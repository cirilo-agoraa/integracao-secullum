import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
// import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = 8888;

// Middleware para parse de JSON
app.use(express.json());

// Rota para servir a página viewPoints.html diretamente em "/"
app.get('/', (req, res) => {
    res.render('index', { title: 'Visualizar Batidas' });
});

// Outras rotas
// app.use('/auth', authRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});