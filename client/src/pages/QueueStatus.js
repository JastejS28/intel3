import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';
import Header from '../components/Header';
import ProgressIndicator from '../components/ProgressIndicator';
import config from '../config';

function QueueStatus() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [priorityScore, setPriorityScore] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  
  // Update the useEffect function to handle different queue data format
  useEffect(() => {
    const submitPatientData = async () => {
      try {
        // Check if we have stored patient data
        const storedData = sessionStorage.getItem('completePatientData');
        if (!storedData) {
          navigate('/vital-signs');
          return;
        }

        const patientData = JSON.parse(storedData);
        setPatientData(patientData);
        
        // Check if patient has already been submitted
        const patientSubmitted = sessionStorage.getItem('patientSubmitted');
        const patientId = sessionStorage.getItem('patientId');
        
        if (patientSubmitted === 'true' && patientId) {
          console.log('Patient already submitted, fetching current queue status');
          
          try {
            // Fetch queue to get current patient status
            const queueResponse = await axios.get(`${config.apiUrl}/patients`);
            
            if (Array.isArray(queueResponse.data)) {
              // Find current patient in queue
              const currentPatient = queueResponse.data.find(p => p.patient_id === patientId);
              setAllPatients(queueResponse.data);
              
              if (currentPatient) {
                // Use data directly from API
                setPriorityScore(currentPatient.priority_score);
                setQueuePosition(currentPatient.queue_position);
                setEstimatedWaitTime(currentPatient.estimated_wait_time);
              } else {
                // Patient not found in queue
                console.log('Patient not found in queue');
                setQueuePosition(queueResponse.data.length + 1);
                setEstimatedWaitTime(5);
              }
            }
          } catch (error) {
            console.error('Error fetching queue:', error);
            setQueuePosition(1);
            setEstimatedWaitTime(5);
          }
          
          setLoading(false);
          return;
        }

        // If not submitted yet, send data to backend
        const vitalSigns = patientData.vitalSigns;
        const completeData = {
          fullName: patientData.fullName,
          age: parseInt(patientData.age),
          gender: patientData.gender,
          weight: parseFloat(patientData.weight || 0),
          height: parseFloat(patientData.height || 0),
          contactNumber: patientData.contactNumber || '',
          emergencyContact: patientData.emergencyContact || '',
          vitalSigns: {
            heartRate: parseFloat(vitalSigns.heartRate),
            bloodPressureSystolic: parseFloat(vitalSigns.bloodPressureSystolic),
            bloodPressureDiastolic: parseFloat(vitalSigns.bloodPressureDiastolic),
            temperature: parseFloat(vitalSigns.temperature),
            oxygenSaturation: parseFloat(vitalSigns.oxygenSaturation),
            respiratoryRate: parseFloat(vitalSigns.respiratoryRate)
          }
        };
        
        console.log('Submitting new patient data');
        
        // Send data to backend which will forward to external APIs
        const patientResponse = await axios.post(`${config.apiUrl}/patients`, completeData);
        const savedPatient = patientResponse.data;
        
        // Store the patient ID and mark as submitted
        sessionStorage.setItem('patientId', savedPatient._id);
        sessionStorage.setItem('patientSubmitted', 'true');
        
        // Use data directly from API response
        setPriorityScore(savedPatient.priority_score);
        setQueuePosition(savedPatient.queue_position);
        setEstimatedWaitTime(savedPatient.estimated_wait_time);
        
        try {
          // Get the updated queue
          const queueResponse = await axios.get(`${config.apiUrl}/patients`);
          if (Array.isArray(queueResponse.data)) {
            setAllPatients(queueResponse.data);
          }
        } catch (queueError) {
          console.error('Error fetching queue after submission:', queueError);
        }
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error submitting patient data:', err);
        setError('There was an error processing your information. Please try again.');
        setLoading(false);
      }
    };
    
    submitPatientData();
  }, [navigate]);
  
  // Update the getPriorityInfo function to better handle different data formats
  const getPriorityInfo = (patient) => {
    // Get risk level directly from API data if available
    if (patient.risk_level) {
      if (patient.risk_level.includes('High')) {
        return { level: 'High', color: '#d32f2f' };
      } else if (patient.risk_level.includes('Medium')) {
        return { level: 'Medium', color: '#f57c00' };
      } else {
        return { level: 'Low', color: '#6CC24A' };
      }
    }
    
    // Otherwise fall back to priority score
    const score = patient.priority_score || 0;
    if (score >= 20) {
      return { level: 'High', color: '#d32f2f' };
    } else if (score >= 10) {
      return { level: 'Medium', color: '#f57c00' };
    } else {
      return { level: 'Low', color: '#6CC24A' };
    }
  };
  
  const handleBackToHome = () => {
    // Clear session storage including submission flag
    sessionStorage.removeItem('patientInfo');
    sessionStorage.removeItem('completePatientData');
    sessionStorage.removeItem('patientSubmitted');
    navigate('/');
  };
  
  if (loading) {
    return (
      <Box className="page-container">
        <Header />
        <Container className="content" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Processing your information...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Calculating priority and assigning you to the queue
          </Typography>
        </Container>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box className="page-container">
        <Header />
        <Container className="content">
          <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
          <Button variant="contained" onClick={handleBackToHome}>
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }
  
  const priorityInfo = (() => {
    if (patientData && priorityScore !== null) {
      // If there's API data in allPatients, try to find this patient
      if (Array.isArray(allPatients) && allPatients.length > 0) {
        const patientId = sessionStorage.getItem('patientId');
        const currentPatient = allPatients.find(p => p.patient_id === patientId);
        
        if (currentPatient && currentPatient.risk_level) {
          // Use risk level from API data
          if (currentPatient.risk_level.includes('High')) {
            return { level: 'High', color: '#d32f2f' };
          } else if (currentPatient.risk_level.includes('Medium')) {
            return { level: 'Medium', color: '#f57c00' };
          } else {
            return { level: 'Low', color: '#6CC24A' };
          }
        }
      }
      
      // Fall back to scoring logic if we can't find API risk level
      if (priorityScore >= 20) {
        return { level: 'High', color: '#d32f2f' };
      } else if (priorityScore >= 10) {
        return { level: 'Medium', color: '#f57c00' };
      } else {
        return { level: 'Low', color: '#6CC24A' };
      }
    }
    return { level: 'Unknown', color: '#757575' };
  })();
  
  return (
    <Box className="page-container">
      <Header />
      
      <Container className="content">
        <Box component={Paper} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Queue Status
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Your information has been processed and you have been assigned a priority in the queue
          </Typography>
          
          <ProgressIndicator activeStep={3} />
          
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f0f8ff', borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Thank you for checking in, {patientData?.fullName}!
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Your vital signs have been analyzed and you have been assigned a priority level.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className={`queue-card ${priorityInfo.level.toLowerCase()}-priority`} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Priority Status
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={`${priorityInfo.level} Priority`}
                      sx={{ 
                        bgcolor: priorityInfo.color,
                        color: 'white',
                        fontWeight: 'bold',
                        px: 1
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Priority Score: {priorityScore}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" paragraph>
                    <strong>Queue Position:</strong> {queuePosition}
                  </Typography>
                  
                  <Typography variant="body1">
                    <strong>Estimated Wait Time:</strong> {estimatedWaitTime} minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    What Happens Next?
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    1. Please take a seat in the waiting area
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    2. Watch the display screen for your name
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    3. When your name appears, proceed to the indicated room
                  </Typography>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Note:</strong> Patients with high priority conditions are seen first, regardless of arrival time. Thank you for your understanding.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Current Patient Queue
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#0078D4' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Queue Position</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estimated Time</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-in Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(allPatients) && allPatients.length > 0 ? (
                    allPatients.map((patient, index) => {
                      // Use patient ID from API
                      const patientId = sessionStorage.getItem('patientId');
                      const isCurrentPatient = patient.patient_id === patientId;
                      
                      // Get priority info directly from API data
                      const patientPriorityInfo = getPriorityInfo(patient);
                      
                      return (
                        <TableRow 
                          key={patient.patient_id || index}
                          sx={{ 
                            bgcolor: isCurrentPatient ? '#e3f2fd' : 'inherit',
                            '&:nth-of-type(odd)': { bgcolor: isCurrentPatient ? '#e3f2fd' : '#fafafa' }
                          }}
                        >
                          <TableCell>{patient.queue_position || index + 1}</TableCell>
                          <TableCell>{patient.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={patientPriorityInfo.level}
                              size="small"
                              sx={{ 
                                bgcolor: patientPriorityInfo.color,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {patient.estimated_wait_time ? 
                                `${patient.estimated_wait_time} minutes` : 
                                'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(patient.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No patients in queue</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained"
              onClick={handleBackToHome}
              color="primary"
              size="large"
            >
              Return to Home
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            © 2025 Healthcare Kiosk System | Powered by Intel Technology
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default QueueStatus;
