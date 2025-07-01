import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Grid, 
  Paper, 
  Slider,
  TextField,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import Header from '../components/Header';
import ProgressIndicator from '../components/ProgressIndicator';
import axios from 'axios';
import config from '../config';

function VitalSigns() {
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState(null);
  
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: 75,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    temperature: 36.6,
    oxygenSaturation: 98,
    respiratoryRate: 16
  });
  
  useEffect(() => {
    const storedPatientInfo = sessionStorage.getItem('patientInfo');
    if (!storedPatientInfo) {
      navigate('/patient-info');
      return;
    }
    
    setPatientInfo(JSON.parse(storedPatientInfo));
  }, [navigate]);
  
  const handleInputChange = (name, value) => {
    setVitalSigns({
      ...vitalSigns,
      [name]: value
    });
  };
  
  const handleSliderChange = (name) => (e, newValue) => {
    handleInputChange(name, newValue);
  };
  
  const handleTextChange = (name) => (e) => {
    const { value } = e.target;
    handleInputChange(name, value === '' ? '' : Number(value));
  };
  
  const getHeartRateColor = (rate) => {
    if (rate < 60 || rate > 100) return '#ff9800'; // Warning
    if (rate < 50 || rate > 120) return '#f44336'; // Danger
    return '#4caf50'; // Normal
  };
  
  const getBloodPressureColor = (systolic, diastolic) => {
    if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) return '#ff9800';
    if (systolic > 180 || systolic < 80 || diastolic > 120 || diastolic < 50) return '#f44336';
    return '#4caf50';
  };
  
  const getOxygenColor = (value) => {
    if (value < 95) return '#ff9800';
    if (value < 90) return '#f44336';
    return '#4caf50';
  };
  
  const getTemperatureColor = (temp) => {
    if (temp > 38 || temp < 35.5) return '#ff9800';
    if (temp > 39 || temp < 35) return '#f44336';
    return '#4caf50';
  };
  
  const getRespRateColor = (rate) => {
    if (rate > 20 || rate < 12) return '#ff9800';
    if (rate > 25 || rate < 8) return '#f44336';
    return '#4caf50';
  };
  
  const handleBack = () => {
    navigate('/patient-info');
  };
  
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/patients`, {
        ...patientInfo,
        vitalSigns
      });
      
      const patientResult = response.data;

      if (patientResult && patientResult.patient_id) {
        // Store data in sessionStorage to survive a refresh
        sessionStorage.setItem('patientData', JSON.stringify({
          patientId: patientResult.patient_id,
          fullName: patientInfo.fullName
        }));
        sessionStorage.setItem('patientSubmitted', 'true');

        // Navigate to the queue status page
        navigate('/queue-status');
      } else {
        console.error('Submission successful, but no patient_id was returned from the server.');
        // Optionally, show an error message to the user here
      }
    } catch (error) {
      console.error('Failed to submit patient data:', error);
    }
  };

  if (!patientInfo) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Box className="page-container">
      <Header />
      
      <Container className="content">
        <Box component={Paper} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Vital Signs Measurement
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Please enter your vital signs readings or use the connected medical devices
          </Typography>
          
          <ProgressIndicator activeStep={2} />
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Enter Your Vital Signs
                </Typography>
                
                <Typography id="heart-rate-slider" gutterBottom>
                  Heart Rate (BPM)
                </Typography>
                <Box className="slider-container">
                  <Slider
                    value={vitalSigns.heartRate}
                    onChange={handleSliderChange('heartRate')}
                    aria-labelledby="heart-rate-slider"
                    min={40}
                    max={180}
                    marks={[
                      { value: 40, label: '40' },
                      { value: 70, label: '70' },
                      { value: 100, label: '100' },
                      { value: 140, label: '140' },
                      { value: 180, label: '180' },
                    ]}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    value={vitalSigns.heartRate}
                    onChange={handleTextChange('heartRate')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">BPM</InputAdornment>,
                    }}
                    inputProps={{
                      step: 1,
                      min: 40,
                      max: 180,
                      type: 'number',
                      'aria-labelledby': 'heart-rate-slider',
                    }}
                    sx={{ width: 100, ml: 2 }}
                  />
                </Box>
                
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={6}>
                    <Typography gutterBottom>
                      Systolic Blood Pressure
                    </Typography>
                    <TextField
                      value={vitalSigns.bloodPressureSystolic}
                      onChange={handleTextChange('bloodPressureSystolic')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                      }}
                      inputProps={{
                        step: 1,
                        min: 70,
                        max: 200,
                        type: 'number',
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography gutterBottom>
                      Diastolic Blood Pressure
                    </Typography>
                    <TextField
                      value={vitalSigns.bloodPressureDiastolic}
                      onChange={handleTextChange('bloodPressureDiastolic')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                      }}
                      inputProps={{
                        step: 1,
                        min: 40,
                        max: 120,
                        type: 'number',
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={6}>
                    <Typography gutterBottom>
                      Body Temperature
                    </Typography>
                    <TextField
                      value={vitalSigns.temperature}
                      onChange={handleTextChange('temperature')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                      }}
                      inputProps={{
                        step: 0.1,
                        min: 34,
                        max: 42,
                        type: 'number',
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography gutterBottom>
                      Oxygen Saturation
                    </Typography>
                    <TextField
                      value={vitalSigns.oxygenSaturation}
                      onChange={handleTextChange('oxygenSaturation')}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{
                        step: 1,
                        min: 70,
                        max: 100,
                        type: 'number',
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    Respiratory Rate
                  </Typography>
                  <TextField
                    value={vitalSigns.respiratoryRate}
                    onChange={handleTextChange('respiratoryRate')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">breaths/min</InputAdornment>,
                    }}
                    inputProps={{
                      step: 1,
                      min: 6,
                      max: 40,
                      type: 'number',
                    }}
                    fullWidth
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box className="vital-sign-summary" sx={{ p: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Vital Signs Summary
                </Typography>
                
                <Box className="vital-sign-item" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Heart Rate</Typography>
                    <Typography variant="body2" className="vital-sign-value">
                      {vitalSigns.heartRate} BPM
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(vitalSigns.heartRate / 180) * 100}
                    className="vital-sign-progress"
                    sx={{ 
                      height: 8, 
                      borderRadius: 1, 
                      bgcolor: '#e0e0e0', 
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getHeartRateColor(vitalSigns.heartRate)
                      }
                    }}
                  />
                </Box>
                
                <Box className="vital-sign-item" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Blood Pressure</Typography>
                    <Typography variant="body2" className="vital-sign-value">
                      {vitalSigns.bloodPressureSystolic}/{vitalSigns.bloodPressureDiastolic} mmHg
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vitalSigns.bloodPressureSystolic / 200) * 100}
                      className="vital-sign-progress"
                      sx={{ 
                        height: 8, 
                        borderRadius: 1, 
                        flex: 1,
                        bgcolor: '#e0e0e0', 
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getBloodPressureColor(vitalSigns.bloodPressureSystolic, vitalSigns.bloodPressureDiastolic)
                        }
                      }}
                    />
                    <Typography variant="body2">/</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vitalSigns.bloodPressureDiastolic / 120) * 100}
                      className="vital-sign-progress"
                      sx={{ 
                        height: 8, 
                        borderRadius: 1, 
                        flex: 1,
                        bgcolor: '#e0e0e0', 
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getBloodPressureColor(vitalSigns.bloodPressureSystolic, vitalSigns.bloodPressureDiastolic)
                        }
                      }}
                    />
                  </Box>
                </Box>
                
                <Box className="vital-sign-item" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Oxygen Saturation</Typography>
                    <Typography variant="body2" className="vital-sign-value">
                      {vitalSigns.oxygenSaturation}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(vitalSigns.oxygenSaturation / 100) * 100}
                    className="vital-sign-progress"
                    sx={{ 
                      height: 8, 
                      borderRadius: 1, 
                      bgcolor: '#e0e0e0', 
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getOxygenColor(vitalSigns.oxygenSaturation)
                      }
                    }}
                  />
                </Box>
                
                <Box className="vital-sign-item" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Body Temperature</Typography>
                    <Typography variant="body2" className="vital-sign-value">
                      {vitalSigns.temperature}°C
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={((vitalSigns.temperature - 34) / (42 - 34)) * 100}
                    className="vital-sign-progress"
                    sx={{ 
                      height: 8, 
                      borderRadius: 1, 
                      bgcolor: '#e0e0e0', 
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getTemperatureColor(vitalSigns.temperature)
                      }
                    }}
                  />
                </Box>
                
                <Box className="vital-sign-item">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Respiratory Rate</Typography>
                    <Typography variant="body2" className="vital-sign-value">
                      {vitalSigns.respiratoryRate} breaths/min
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(vitalSigns.respiratoryRate / 40) * 100}
                    className="vital-sign-progress"
                    sx={{ 
                      height: 8, 
                      borderRadius: 1, 
                      bgcolor: '#e0e0e0', 
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getRespRateColor(vitalSigns.respiratoryRate)
                      }
                    }}
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                  Note: In a real kiosk, these values would be automatically measured using connected medical devices such as a blood pressure monitor, thermometer, pulse oximeter, and scale.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button 
              variant="outlined"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button 
              variant="contained"
              onClick={handleSubmit}
              color="primary"
            >
              Submit and Check Queue
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default VitalSigns;
