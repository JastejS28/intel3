import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Home from './pages/Home';
import PatientInfo from './pages/PatientInfo';
import VitalSigns from './pages/VitalSigns';
import QueueStatus from './pages/QueueStat';
import Admin from './pages/Admin'; // 1. Import the new Admin component

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0078D4',
    },
    secondary: {
      main: '#6CC24A',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#106EBE',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient-info" element={<PatientInfo />} />
          <Route path="/vital-signs" element={<VitalSigns />} />
          <Route path="/queue-status" element={<QueueStatus />} />
          <Route path="/admin" element={<Admin />} /> {/* 2. Add the new route */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
