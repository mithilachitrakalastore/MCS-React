import express from 'express';

const app = express();
const PORT = 10000;

// Initialize DB and start server

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: send all non-API requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
 
