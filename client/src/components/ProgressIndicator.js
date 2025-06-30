import React from 'react';
import { Box, Typography } from '@mui/material';

function ProgressIndicator({ activeStep }) {
  const steps = [
    { number: 1, label: 'Patient Info' },
    { number: 2, label: 'Vital Signs' },
    { number: 3, label: 'Queue Status' }
  ];
  
  return (
    <Box className="progress-indicator" sx={{ display: 'flex', mb: 4, mt: 2 }}>
      {steps.map((step) => {
        const isActive = step.number === activeStep;
        const isCompleted = step.number < activeStep;
        
        return (
          <Box 
            key={step.number} 
            className={`progress-step ${isActive || isCompleted ? 'active' : ''}`}
            sx={{ 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1
            }}
          >
            <Box 
              className={`step-number ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isCompleted ? 'secondary.main' : isActive ? 'primary.main' : 'grey.400',
                color: 'white',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              {step.number}
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isActive ? 'primary.main' : isCompleted ? 'secondary.main' : 'text.secondary',
                fontWeight: isActive ? 500 : 400
              }}
            >
              {step.label}
            </Typography>
            {step.number !== steps.length && (
              <Box 
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: '-50%',
                  width: '100%',
                  height: 2,
                  backgroundColor: isCompleted ? 'secondary.main' : 'grey.300',
                  zIndex: -1
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default ProgressIndicator;
