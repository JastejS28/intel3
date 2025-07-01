import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, // CRITICAL FIX: Add TableContainer to the import list
  TableHead, 
  TableRow,
  CircularProgress,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import config from '../config'; // Use the config file for the API URL

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState(null);
  const [callSuccess, setCallSuccess] = useState(false);
  const [calledPatient, setCalledPatient] = useState(null);

  const fetchQueue = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.get(`${config.apiUrl}/patients`);
      setQueue(response.data || []);
    } catch (err) {
      setError('Failed to fetch queue data. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const intervalId = setInterval(fetchQueue, 20000); // Refresh every 20 seconds
    return () => clearInterval(intervalId);
  }, [fetchQueue]);

  const callNextPatient = async () => {
    setIsCalling(true);
    setError(null);
    try {
      const response = await axios.post(`${config.apiUrl}/queue/next`);
      setCalledPatient(response.data.calledPatient);
      setCallSuccess(true);
      await fetchQueue(); // Refresh queue immediately
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to call next patient.');
    } finally {
      setIsCalling(false);
    }
  };

  const getPriorityInfo = (patient) => {
    const score = patient.priority_score || 0;
    if (score > 20) {
      return { level: 'High', color: '#d32f2f' };
    }
    return { level: 'Low', color: '#6CC24A' };
  };

  const highPriorityCount = queue.filter(p => (p.priority_score || 0) > 20).length;
  const lowPriorityCount = queue.filter(p => (p.priority_score || 0) <= 20).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Administrator Dashboard
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h6">Current Queue Status</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
            <Box>
              <Typography>High Priority:</Typography>
              <Typography variant="h5" color="#d32f2f" fontWeight="bold">{highPriorityCount}</Typography>
            </Box>
            <Box>
              <Typography>Low Priority:</Typography>
              <Typography variant="h5" color="#6CC24A" fontWeight="bold">{lowPriorityCount}</Typography>
            </Box>
            <Box>
              <Typography>Total Patients:</Typography>
              <Typography variant="h5" fontWeight="bold">{queue.length}</Typography>
            </Box>
          </Box>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#0078D4' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Position</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Wait Time</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-in Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && queue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell>
                </TableRow>
              ) : queue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>The queue is currently empty.</TableCell>
                </TableRow>
              ) : (
                queue.map((patient) => {
                  const { level, color } = getPriorityInfo(patient);
                  return (
                    <TableRow key={patient.patient_id} hover>
                      <TableCell>{patient.queue_position}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{patient.name || 'Processing...'}</TableCell>
                      <TableCell>
                        <Chip label={level} size="small" sx={{ bgcolor: color, color: 'white' }} />
                      </TableCell>
                      <TableCell>{typeof patient.estimated_wait_time === 'number' ? `${patient.estimated_wait_time} min` : '...'}</TableCell>
                      <TableCell>{new Date(patient.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="outlined" color="primary" onClick={fetchQueue} disabled={loading}>
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={callNextPatient} 
            disabled={isCalling || queue.length === 0}
            startIcon={isCalling ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isCalling ? 'Calling...' : 'Call Next Patient'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={callSuccess}
        autoHideDuration={6000}
        onClose={() => setCallSuccess(false)}
        message={`Successfully called patient: ${calledPatient?.name || calledPatient?.patient_id || ''}`}
      />
    </Container>
  );
}

export default AdminDashboard;