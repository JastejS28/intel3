import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio,
  InputAdornment
} from '@mui/material';
import Header from '../components/Header';
import ProgressIndicator from '../components/ProgressIndicator';

function PatientInfo() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    contactNumber: '',
    emergencyContact: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value
    });
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!patientData.fullName) newErrors.fullName = 'Name is required';
    if (!patientData.age) newErrors.age = 'Age is required';
    else if (isNaN(patientData.age) || parseInt(patientData.age) <= 0 || parseInt(patientData.age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!patientData.weight) newErrors.weight = 'Weight is required';
    if (!patientData.height) newErrors.height = 'Height is required';
    else if (parseFloat(patientData.height) < 0.5 || parseFloat(patientData.height) > 2.5) {
      newErrors.height = 'Please enter a valid height in meters (e.g., 1.75)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateForm()) {
      // Store data in session storage for the next steps
      sessionStorage.setItem('patientInfo', JSON.stringify(patientData));
      navigate('/vital-signs');
    }
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <Box className="page-container">
      <Header />
      
      <Container className="content">
        <Box component={Paper} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Patient Information
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Please enter your basic information to start the check-in process
          </Typography>
          
          <ProgressIndicator activeStep={1} />
          
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={patientData.fullName}
                  onChange={handleInputChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  value={patientData.age}
                  onChange={handleInputChange}
                  error={!!errors.age}
                  helperText={errors.age}
                  variant="outlined"
                  type="number"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Gender
                  </Typography>
                  <RadioGroup
                    row
                    name="gender"
                    value={patientData.gender}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  value={patientData.weight}
                  onChange={handleInputChange}
                  error={!!errors.weight}
                  helperText={errors.weight}
                  variant="outlined"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (m)"
                  name="height"
                  value={patientData.height}
                  onChange={handleInputChange}
                  error={!!errors.height}
                  helperText={errors.height || "Enter height in meters (e.g., 1.75)"}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number (Optional)"
                  name="contactNumber"
                  value={patientData.contactNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact (Optional)"
                  name="emergencyContact"
                  value={patientData.emergencyContact}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                variant="outlined"
                onClick={handleBack}
              >
                Back to Home
              </Button>
              <Button 
                variant="contained"
                onClick={handleNext}
                color="primary"
              >
                Next: Enter Vital Signs
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default PatientInfo;
