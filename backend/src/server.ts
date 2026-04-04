import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`[SERVER] ERP Backend running on port ${PORT}...`);
});

process.on('unhandledRejection', (err: Error) => {
    console.error('[UNHANDLED REJECTION] Shutting down gracefully...');
    console.error(err.name, err.message);
    server.close(() => process.exit(1));
});
