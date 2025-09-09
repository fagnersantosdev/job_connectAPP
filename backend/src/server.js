import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import conexao from './database/conexao.js'; // Importa a ligação à base de dados

// Importando as rotas
import prestadoresRouters from './routes/prestadoresRouters.js';
import clientesRouters from './routes/clientesRouters.js';
import categoriasRouters from './routes/categoriasRouters.js';
import servicosOferecidosRouters from './routes/servicosOferecidosRouters.js';
import solicitacoesRouters from './routes/solicitacoesRouters.js';
import avaliacoesRouters from './routes/avaliacoesRouters.js';
import mensagensRouters from './routes/mensagensRouters.js';
import pagamentosRouters from './routes/pagamentosRouters.js';
import loginRouter from './routes/loginRouters.js';
import basic from './routes/basicRouters.js';
import mensagensController from './controllers/mensagensController.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
mensagensController.setIoInstance(io);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

// --- Montagem das Rotas ---
app.use('/', loginRouter);
app.use('/prestadores', prestadoresRouters);
app.use('/api', clientesRouters);
app.use('/categorias', categoriasRouters);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters);
app.use('/mensagens', mensagensRouters);
app.use('/pagamentos', pagamentosRouters);
app.use('/', basic);

io.on('connection', (socket) => {
    console.log(`[Socket.IO] Utilizador conectado: ${socket.id}`);
    socket.on('joinRoom', (solicitacaoId) => {
        socket.join(solicitacaoId);
        console.log(`[Socket.IO] Utilizador ${socket.id} entrou na sala: ${solicitacaoId}`);
    });
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Utilizador desconectado: ${socket.id}`);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Servidor HubServiços a rodar em http://${HOST}:${PORT}`);
    console.log(`Socket.IO a escutar em ws://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});

