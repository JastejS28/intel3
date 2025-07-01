import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Button, Paper, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import ProgressIndicator from '../components/ProgressIndicator';
import config from '../config';

function QueueStatus() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    // This logic makes the page refresh-proof by using sessionStorage.
    const storedPatientData = sessionStorage.getItem('patientData');
    const isSubmitted = sessionStorage.getItem('patientSubmitted');

    if (isSubmitted && storedPatientData) {
      const data = JSON.parse(storedPatientData);
      setPatientData(data);
      setPatientId(data.patientId);
      fetchQueue();
      setLoading(false);
    } else {
      // If there's no data, the user shouldn't be here. Redirect to home.
      navigate('/');
    }

    const interval = setInterval(fetchQueue, 15000); // Refresh queue every 15 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/patients`);
      // The server now returns the enriched queue with names, no client-side mapping needed.
      setAllPatients(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load queue.');
    }
  };

  const getPriorityColor = (score) => (score > 20 ? '#d32f2f' : '#6CC24A');

  const handleRestart = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const current = allPatients.find(p => p.patient_id === patientId);

  return (
    <Box className="page-container">
      <Header />
      <Container>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} />
            <Typography sx={{ mt: 3 }}>Processing your information...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" align="center">Queue Status</Typography>
            <ProgressIndicator activeStep={3} />
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              Hello {patientData?.fullName}, your check-in is complete.
            </Typography>

            {current && (
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${current.priority_score > 20 ? 'High' : 'Low'} Priority`}
                  sx={{ bgcolor: getPriorityColor(current.priority_score), color: 'white', fontWeight: 'bold' }}
                />
                <Typography>Queue Position: {current.queue_position}</Typography>
                <Typography>Estimated Wait Time: {current.estimated_wait_time} minutes</Typography>
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 4 }}>Current Queue</Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#0078D4' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>Position</TableCell>
                    <TableCell sx={{ color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Priority</TableCell>
                    <TableCell sx={{ color: 'white' }}>Wait Time</TableCell>
                    <TableCell sx={{ color: 'white' }}>Checked In</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPatients.map((p, index) => (
                    <TableRow key={p.patient_id}>
                      <TableCell>{p.queue_position}</TableCell>
                      <TableCell>{p.name || 'Anonymous'}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.priority_score > 20 ? 'High' : 'Low'}
                          sx={{ bgcolor: getPriorityColor(p.priority_score), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>{p.estimated_wait_time} min</TableCell>
                      <TableCell>
                        {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button variant="contained" onClick={handleRestart}>Start New Check-in</Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default QueueStatus;
