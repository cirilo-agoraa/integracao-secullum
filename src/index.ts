import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';
import authRoutes from './routes/authRoutes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 8888;
app.use(express.static(path.join(__dirname, "../public")));

// Configurar o EJS como motor de templates
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './views'));

// Validate required environment variables
const {
    API_URL_AUTH,
    API_USERNAME,
    API_PASSWORD,
    API_CLIENT_ID,
    GRANT_TYPE,
} = process.env;

if (!API_URL_AUTH || !API_USERNAME || !API_PASSWORD || !API_CLIENT_ID || !GRANT_TYPE) {
    throw new Error('Missing required environment variables. Please check your .env file.');
}

// Middleware para parse de JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/auth', authRoutes);

// Função para obter as datas de ontem e hoje
const getDates = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
        dataInicio: formatDate(yesterday),
        dataFim: formatDate(yesterday),
    };
};

// Rota para renderizar a página inicial com as batidas
// Rota para renderizar a página inicial com as batidas
app.get('/', async (req, res) => {
    // Obter os parâmetros de data da URL ou usar os valores padrão
    const dataInicio = req.query.dataInicio as string || getDates().dataInicio;
    const dataFim = req.query.dataFim as string || getDates().dataFim;

    try {
        // Realizar login para obter o token
        const loginResponse = await axios.post(API_URL_AUTH, qs.stringify({
            username: API_USERNAME,
            password: API_PASSWORD,
            client_id: API_CLIENT_ID,
            grant_type: GRANT_TYPE,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const token = loginResponse.data.access_token;

        // Fazer a chamada para a API de batidas
        const batidasResponse = await axios.get('https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Batidas', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                dataInicio,
                dataFim,
            },
        });

        // Fazer a chamada para a API de funcionários
        const functionariosResponse = await axios.get('https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Funcionarios', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const batidas = batidasResponse.data;
        const funcionarios = functionariosResponse.data;

        // Cruzar os dados de batidas com os funcionários
        const batidasComNomes = batidas.map((batida: any) => {
            const funcionario = funcionarios.find((f: any) => f.Id === batida.FuncionarioId);
            return {
                ...batida,
                NomeFuncionario: funcionario ? funcionario.Nome : 'Desconhecido',
            };
        });

        batidasComNomes.sort((a: any, b: any) => {
            const dateA = new Date(a.Data).getTime();
            const dateB = new Date(b.Data).getTime();

            if (dateA !== dateB) {
                return dateA - dateB; // Ordenar por data
            }

            return a.NomeFuncionario.localeCompare(b.NomeFuncionario); // Ordenar por nome
        });

        // Ordenar as batidas por data e nome
        batidasComNomes.sort((a: any, b: any) => {
            const dateA = new Date(a.Data).getTime();
            const dateB = new Date(b.Data).getTime();

            if (dateA !== dateB) {
                return dateA - dateB; // Ordenar por data
            }

            return a.NomeFuncionario.localeCompare(b.NomeFuncionario); // Ordenar por nome
        });

        // Renderizar a página com os dados
        res.render('index', {
            title: 'Visualizar Batidas',
            batidas: batidasComNomes,
            dataInicio, // Passando dataInicio para o template
            dataFim,    // Passando dataFim para o template
        });
    } catch (error: any) {
        console.error('Erro ao buscar batidas ou funcionários:', error.response?.data || error.message);
        res.status(500).send('Erro ao buscar batidas ou funcionários.');
    }
});

// Servir arquivos estáticos (views)
app.use(express.static('src/views'));

// Rota para exibir os dados de batidas em JSON
app.get('/batidas', async (req, res) => {
    const { dataInicio, dataFim } = getDates();

    try {
        // Realizar login para obter o token
        const loginResponse = await axios.post(API_URL_AUTH, qs.stringify({
            username: API_USERNAME,
            password: API_PASSWORD,
            client_id: API_CLIENT_ID,
            grant_type: GRANT_TYPE,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const token = loginResponse.data.access_token;

        // Fazer a chamada para a API de batidas
        const batidasResponse = await axios.get('https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Batidas', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                dataInicio,
                dataFim,
            },
        });

        res.json(batidasResponse.data); // Retornar os dados de batidas como JSON
    } catch (error: any) {
        console.error('Erro ao buscar batidas:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro ao buscar batidas.' });
    }
});
app.get('/fixos', async (req, res) => {
    const { dataInicio, dataFim } = getDates();

    try {
        // Realizar login para obter o token
        const loginResponse = await axios.post(API_URL_AUTH, qs.stringify({
            username: API_USERNAME,
            password: API_PASSWORD,
            client_id: API_CLIENT_ID,
            grant_type: GRANT_TYPE,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const token = loginResponse.data.access_token;

        // Fazer a chamada para a API de batidas
        const batidasResponse = await axios.get('https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Batidas', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                dataInicio,
                dataFim,
            },
        });

        const functionariosResponse = await axios.get('https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Funcionarios', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {

            }
        });
        const batidas = batidasResponse.data;
        const funcionarios = functionariosResponse.data;
        
        const batidasComNomes = batidas.map((batida: any) => {
            const funcionario = funcionarios.find((f: any) => f.Id === batida.FuncionarioId);
            return {
                ...batida,
                NomeFuncionario: funcionario ? funcionario.Nome : 'Desconhecido',
            };
        });
        // console.log('Batidas:', batidasResponse); // Logar as batidas recebidas
        // console.log('Funcionarios:', functionariosResponse); // Logar os funcionarios recebidos
        // console.log(batidasResponse.data);
        res.render('index', {
            title: 'Visualizar Batidas',
            batidas: batidasComNomes,
            dataInicio, // Passando dataInicio para o template
            dataFim,    // Passando dataFim para o template
        });
    } catch (error: any) {
        console.error('Erro ao buscar batidas:', error.response?.data || error.message);
        res.status(500).send('Erro ao buscar batidas.');
    }
});

// Rota para exibir os dados de funcionários em JSON
app.get('/funcionarios', async (req, res) => {
    try {
        // Realizar login para obter o token
        const loginResponse = await axios.post(API_URL_AUTH, qs.stringify({
            username: API_USERNAME,
            password: API_PASSWORD,
            client_id: API_CLIENT_ID,
            grant_type: GRANT_TYPE,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const token = loginResponse.data.access_token;

        // Fazer a chamada para a API de funcionários
        const functionariosResponse = await axios.get('https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna/Funcionarios', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        res.json(functionariosResponse.data); // Retornar os dados de funcionários como JSON
    } catch (error: any) {
        console.error('Erro ao buscar funcionários:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro ao buscar funcionários.' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});