import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Importando as rotas específicas para cada entidade
import prestadoresRouters from './routes/prestadoresRouters.js';
import clientesRouters from './routes/clientesRouters.js';
import categoriasRouters from './routes/categoriasRouters.js';
import basic from './routes/basicRouters.js';
import servicosOferecidosRouters from './routes/servicosOferecidosRouters.js';
import solicitacoesRouters from './routes/solicitacoesRouters.js';
import avaliacoesRouters from './routes/avaliacoesRouters.js';
import mensagensRouters from './routes/mensagensRouters.js';
import pagamentosRouters from './routes/pagamentosRouters.js';
import loginRouter from './routes/loginRouters.js';

import authMiddleware from './middlewares/authMiddleware.js';
import mensagensController from './controllers/mensagensController.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
    origin: "*",
    methods: ["GET", "POST"]
    }
});

app.use(cors());
mensagensController.setIoInstance(io);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

// --- Montagem das Rotas REST (Express) ---
app.use('/', loginRouter);
app.use('/prestadores', prestadoresRouters);

// ** AQUI ESTÁ A CORREÇÃO: Montar o roteador de clientes em '/api/clientes' **
// O seu aplicativo está fazendo uma requisição para '/api/register'
// Para que isso funcione, você precisa ter a rota `POST /register` no seu clientesRouters.txt
// E a montagem aqui deve ser em `/api`
app.use('/api', clientesRouters);

app.use('/categorias', categoriasRouters);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters);
app.use('/mensagens', mensagensRouters);
app.use('/pagamentos', pagamentosRouters);

app.use('/', basic);

// ... (o restante do seu código do server.js permanece o mesmo) ...

io.on('connection', (socket) => {
    console.log(`[Socket.IO] Usuário conectado: ${socket.id}`);

    socket.on('joinRoom', (solicitacaoId) => {
    socket.join(solicitacaoId);
    console.log(`[Socket.IO] Usuário ${socket.id} entrou na sala: ${solicitacaoId}`);
    });

    socket.on('disconnect', () => {
    console.log(`[Socket.IO] Usuário desconectado: ${socket.id}`);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor JobConnect rodando em http://0.0.0.0:${PORT}`);
    console.log(`Socket.IO escutando em ws://0.0.0.0:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});
