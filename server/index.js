const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const EXTERNAL_API_URL = 'https://queue-assigner.onrender.com';

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Patient Schema for storing names ---
const PatientSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
});
const Patient = mongoose.model('Patient', PatientSchema);


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health-check', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}`);
    res.json({ status: 'up', externalApiStatus: response.status });
  } catch (error) {
    res.status(503).json({ status: 'down', message: 'External API is not responding' });
  }
});

// Get queue (just forward it from external API)
app.get('/api/patients', async (req, res) => {
  try {
    // 1. Fetch the live queue from the external API
    const queueResponse = await axios.get(`${EXTERNAL_API_URL}/queue/`);
    const queue = queueResponse.data;

    // 2. Fetch all our patients with names from MongoDB
    const patientsFromDb = await Patient.find({});
    const patientNameMap = new Map(patientsFromDb.map(p => [p.patient_id, p.fullName]));

    // 3. Enrich the queue data with names
    const enrichedQueue = queue.map(patient => ({
      ...patient,
      name: patientNameMap.get(patient.patient_id) || 'Anonymous'
    }));

    res.json(enrichedQueue);
  } catch (error) {
    console.error('Failed to fetch queue:', error);
    res.status(500).json({ message: 'Failed to fetch queue data' });
  }
});

// Submit new patient
app.post('/api/patients', async (req, res) => {
  try {
    const { fullName, age, gender, weight, height, vitalSigns } = req.body;

    const genderMap = { Male: 0, Female: 1 };
    const genderAsNumber = genderMap[gender] ?? 2;

    const payload = {
      Heart_Rate: Number(vitalSigns.heartRate),
      Respiratory_Rate: Number(vitalSigns.respiratoryRate),
      Body_Temperature: Number(vitalSigns.temperature),
      Oxygen_Saturation: Number(vitalSigns.oxygenSaturation),
      Systolic_Blood_Pressure: Number(vitalSigns.bloodPressureSystolic),
      Diastolic_Blood_Pressure: Number(vitalSigns.bloodPressureDiastolic),
      Age: Number(age),
      Gender: genderAsNumber,
      Weight_kg: Number(weight),
      Height_m: Number(height),
      Derived_HRV: 60,
      Derived_Pulse_Pressure: 40,
      Derived_BMI: 22.5,
      Derived_MAP: 88.3
    };

    // 1. Get prediction. This adds the patient to the external queue.
    const predictResponse = await axios.post(`${EXTERNAL_API_URL}/predict/`, payload, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });

    // Add a small delay to allow the external API to process the queue
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. Fetch the entire queue and our saved patients
    const queueResponse = await axios.get(`${EXTERNAL_API_URL}/queue/`);
    const queue = queueResponse.data;
    const savedPatients = await Patient.find({}).select('patient_id');
    const savedPatientIds = new Set(savedPatients.map(p => p.patient_id));

    // 3. Find the new patient in the queue (one that is not already in our DB)
    const newPatientInQueue = queue.find(p => !savedPatientIds.has(p.patient_id));

    // 4. Now we have the patient_id. Save the name to MongoDB.
    if (newPatientInQueue && newPatientInQueue.patient_id) {
      await Patient.create({
        patient_id: newPatientInQueue.patient_id,
        fullName: fullName
      });
    }

    // 5. Return the full patient data (including the ID) to the client.
    res.status(201).json(newPatientInQueue || predictResponse.data);

  } catch (error) {
    console.error('Failed to submit patient:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message || 'Failed to submit patient data' });
  }
});

// Get individual patient
app.get('/api/patient/:id', async (req, res) => {
  try {
    // 1. Fetch the patient's queue data from the external API
    const queueResponse = await axios.get(`${EXTERNAL_API_URL}/queue/`);
    let patientQueueData = queueResponse.data.find(p => p.patient_id === req.params.id);

    if (patientQueueData) {
      // 2. Find the patient's name in our database
      const patientDb = await Patient.findOne({ patient_id: req.params.id });
      // 3. Combine the data
      const enrichedPatient = {
        ...patientQueueData,
        name: patientDb ? patientDb.fullName : 'Anonymous'
      };
      res.json(enrichedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found in queue' });
    }
  } catch (error) {
    console.error('Failed to get patient:', error);
    res.status(500).json({ message: error.message });
  }
});

// Call next patient
app.post('/api/queue/next', async (req, res) => {
  try {
    // 1. Call the external API to get the next patient and remove them from the queue.
    const response = await axios.get(`${EXTERNAL_API_URL}/queue/next/`);
    const calledPatientData = response.data;

    if (calledPatientData && calledPatientData.patient_id) {
      // 2. Find the patient's name in our database using their ID.
      const patientDb = await Patient.findOne({ patient_id: calledPatientData.patient_id });

      // 3. Enrich the data with the name before sending it back.
      calledPatientData.name = patientDb ? patientDb.fullName : 'Anonymous';

      // 4. Delete the patient's record from our MongoDB database.
      await Patient.deleteOne({ patient_id: calledPatientData.patient_id });
    }
    
    res.json({ message: 'Next patient called successfully', calledPatient: calledPatientData });
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to call next patient';
    res.status(error.response?.status || 500).json({ message });
  }
});

// --- Function to periodically update priorities to prevent starvation ---
const updatePatientPriorities = async () => {
  try {
    // We use POST as this action changes the state on the server.
    await axios.post(`${EXTERNAL_API_URL}/queue/update-priorities/`);
    console.log('Successfully triggered priority update for waiting patients.');
  } catch (error) {
    console.error('Failed to trigger priority update:', error.response?.data?.message || error.message);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Run the priority update function every 5 minutes (300,000 milliseconds)
  setInterval(updatePatientPriorities, 300000);
});
