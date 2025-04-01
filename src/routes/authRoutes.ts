import { Router } from 'express';
import path from 'path';

const router = Router();

// Rota para servir a página viewPoints.html
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/viewPoints.html'));
});

export default router;