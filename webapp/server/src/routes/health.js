import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
