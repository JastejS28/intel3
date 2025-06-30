import React from 'react';
import { Box, Typography } from '@mui/material';

function Header({ title, subtitle }) {
  return (
    <Box className="header" sx={{ textAlign: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box component="img" src="/medical-icon.svg" alt="Medical Icon" sx={{ width: 40, height: 40, mb: 1 }} />
        <Typography variant="h5" component="h1" fontWeight={500}>
          HealthCare Kiosk
        </Typography>
        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
          Intelligent Patient Priority System
        </Typography>
      </Box>
    </Box>
  );
}

export default Header;
