import express from 'express';

const app = express();
const PORT = 10000;

// Initialize DB and start server

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
 
