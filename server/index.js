const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// External API base URL
const EXTERNAL_API_URL = 'https://queue-assigner.onrender.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// GET Queue - Simple proxy to external API
app.get('/api/patients', async (req, res) => {
  try {
    console.log('Fetching queue from external API');
    const response = await axios.get('https://queue-assigner.onrender.com/queue/');
    
    if (response.data && response.data.queue) {
      console.log('Queue retrieved with', response.data.queue.length, 'patients');
      res.json(response.data.queue);
    } else {
      console.log('Queue API returned empty or invalid response');
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching queue:', error.message);
    res.status(500).json({ message: 'Failed to fetch queue data' });
  }
});

// POST Patient - Process vital signs and add to queue
app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    console.log('Received patient data for:', patientData.fullName);
    
    // Debug received data
    console.log('Vital signs received:', JSON.stringify(patientData.vitalSigns));
    
    // Check if vital signs exist
    if (!patientData.vitalSigns) {
      throw new Error('Missing vital signs data');
    }
    
    // Convert vital signs data from client format (camelCase) to API format (snake_case)
    // Also ensure all values are valid numbers with fallbacks
    const vitalSigns = {
      heart_rate: Number(patientData.vitalSigns.heartRate || 0),
      blood_pressure_systolic: Number(patientData.vitalSigns.bloodPressureSystolic || 0),
      blood_pressure_diastolic: Number(patientData.vitalSigns.bloodPressureDiastolic || 0),
      temperature: Number(patientData.vitalSigns.temperature || 0),
      oxygen_saturation: Number(patientData.vitalSigns.oxygenSaturation || 0),
      respiratory_rate: Number(patientData.vitalSigns.respiratoryRate || 0)
    };
    
    // Additional validation - provide reasonable defaults for invalid values
    if (isNaN(vitalSigns.heart_rate) || vitalSigns.heart_rate <= 0) vitalSigns.heart_rate = 75;
    if (isNaN(vitalSigns.blood_pressure_systolic) || vitalSigns.blood_pressure_systolic <= 0) vitalSigns.blood_pressure_systolic = 120;
    if (isNaN(vitalSigns.blood_pressure_diastolic) || vitalSigns.blood_pressure_diastolic <= 0) vitalSigns.blood_pressure_diastolic = 80;
    if (isNaN(vitalSigns.temperature) || vitalSigns.temperature <= 0) vitalSigns.temperature = 37;
    if (isNaN(vitalSigns.oxygen_saturation) || vitalSigns.oxygen_saturation <= 0) vitalSigns.oxygen_saturation = 98;
    if (isNaN(vitalSigns.respiratory_rate) || vitalSigns.respiratory_rate <= 0) vitalSigns.respiratory_rate = 16;
    
    console.log('Formatted vital signs for API:', JSON.stringify(vitalSigns));
    
    // Step 1: Get priority from /predict endpoint
    let predictResponse;
    try {
      console.log('Sending to predict API...');
      predictResponse = await axios.post(`${EXTERNAL_API_URL}/predict`, vitalSigns);
      console.log('Predict API success!');
    } catch (predictError) {
      console.error('Predict API error:', predictError.message);
      if (predictError.response) {
        console.error('API response data:', JSON.stringify(predictError.response.data));
        console.error('API response status:', predictError.response.status);
      } else if (predictError.request) {
        console.error('No response received');
      }
      throw new Error('Failed to predict priority: ' + predictError.message);
    }
    
    // Extract priority information
    const priorityScore = predictResponse.data.priority_score;
    const riskLevel = predictResponse.data.risk_level;
    console.log('Priority assigned:', riskLevel, 'with score:', priorityScore);
    
    // Step 2: Add patient to queue
    const patientId = `patient_${Date.now()}`;
    const queuePayload = {
      patient_id: patientId,
      name: patientData.fullName,
      age: Number(patientData.age) || 30, // Default age if invalid
      gender: patientData.gender || 'Unknown',
      priority_score: priorityScore,
      vital_signs: vitalSigns,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending to queue API...');
    let queueResponse;
    try {
      queueResponse = await axios.post(`${EXTERNAL_API_URL}/queue/`, queuePayload);
      console.log('Queue API success!');
    } catch (queueError) {
      console.error('Queue API error:', queueError.message);
      if (queueError.response) {
        console.error('API response data:', JSON.stringify(queueError.response.data));
        console.error('API response status:', queueError.response.status);
      }
      throw new Error('Failed to add to queue: ' + queueError.message);
    }
    
    // Return the complete patient data with queue information
    res.status(201).json({
      _id: patientId,
      patient_id: patientId,
      name: patientData.fullName,
      fullName: patientData.fullName,
      age: Number(patientData.age) || 30,
      gender: patientData.gender || 'Unknown',
      priority_score: priorityScore,
      risk_level: riskLevel,
      queue_position: queueResponse.data.queue_position,
      estimated_wait_time: queueResponse.data.estimated_wait_time,
      timestamp: queueResponse.data.timestamp || new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing patient:', error.message);
    res.status(400).json({ 
      message: error.message,
      details: 'There was a problem processing your data. Please check your inputs and try again.'
    });
  }
});

// Get individual patient status
app.get('/api/patient/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    const response = await axios.get(`${EXTERNAL_API_URL}/queue/`);
    
    if (response.data && response.data.queue) {
      const patient = response.data.queue.find(p => p.patient_id === patientId);
      if (patient) {
        return res.json(patient);
      }
    }
    
    res.status(404).json({ message: 'Patient not found' });
  } catch (error) {
    console.error('Error fetching patient:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
