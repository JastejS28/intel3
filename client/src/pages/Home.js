import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';
import Header from '../components/Header';

function Home() {
  const navigate = useNavigate();
  
  const handleStartCheckIn = () => {
    // Clear any existing session data when starting new check-in
    sessionStorage.removeItem('patientInfo');
    sessionStorage.removeItem('completePatientData');
    sessionStorage.removeItem('patientSubmitted');
    navigate('/patient-info');
  };
  
  return (
    <Box className="page-container">
      <Header />
      
      <Container className="content">
        <Box 
          sx={{ 
            textAlign: 'center', 
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box 
            component="img" 
            src="/medical-cross.svg" // Replace with actual icon
            alt="Medical Logo"
            sx={{ width: 60, height: 60, mb: 2 }}
          />
          <Typography variant="h4" component="h1" fontWeight={500} gutterBottom>
            Welcome to HealthCare Kiosk
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
            Intel-powered healthcare kiosk with intelligent patient queue management
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={handleStartCheckIn}
            sx={{ fontSize: '1.1rem', px: 4, py: 1.5, mb: 6 }}
          >
            Start Patient Check-in
          </Button>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="feature-card" elevation={2}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    component="img"
                    src="/quick-registration.svg" // Replace with actual icon
                    alt="Quick Registration"
                    sx={{ width: 64, height: 64, mb: 2 }}
                  />
                  <Typography variant="h6" component="h2" gutterBottom>
                    Quick Registration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fast and easy patient registration with minimal information required
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card className="feature-card" elevation={2}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    component="img"
                    src="/vital-signs.svg" // Replace with actual icon
                    alt="Vital Signs Monitoring"
                    sx={{ width: 64, height: 64, mb: 2 }}
                  />
                  <Typography variant="h6" component="h2" gutterBottom>
                    Vital Signs Monitoring
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accurately measure and record vital signs for priority assessment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card className="feature-card" elevation={2}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    component="img"
                    src="/intelligent-queue.svg" // Replace with actual icon
                    alt="Intelligent Queue"
                    sx={{ width: 64, height: 64, mb: 2 }}
                  />
                  <Typography variant="h6" component="h2" gutterBottom>
                    Intelligent Queue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI powered queue management based on health risk priority
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 6, p: 3, bgcolor: '#f5f9ff', borderRadius: 2, maxWidth: 800 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              About This System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The Healthcare Kiosk is an interactive device designed to streamline patient intake and queue management in hospitals and Ayushman Arogya Mandirs. It
              uses advanced Intel technology and machine learning algorithms to prioritize patients based on their vital signs and medical urgency.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              By collecting vital signs such as blood pressure, heart rate, temperature, and oxygen saturation, the system can intelligently assign priority scores to
              patients, ensuring that those with more critical needs are seen first, while optimizing overall wait times.
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
            © 2025 Healthcare Kiosk System | Powered by Intel Technology
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
