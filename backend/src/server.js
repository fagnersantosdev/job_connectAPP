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
// 🔹 Importação da nova rota de login
import loginRouter from './routes/loginRouters.js';

// Importar o middleware de autenticação (se for aplicado globalmente ou em múltiplos lugares)
import authMiddleware from './middlewares/authMiddleware.js';

// Importar o controller de mensagens para injetar a instância do io
import mensagensController from './controllers/mensagensController.js';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
    origin: "*", // Permitir todas as origens para desenvolvimento. Em produção, especifique as origens do seu frontend.
    methods: ["GET", "POST"]
    }
});

// Configurar o CORS para o Express (para requisições HTTP REST)
app.use(cors());

// Injetar a instância do Socket.IO no controller de mensagens
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
// 🔹 Adicionando a rota de login antes das outras
app.use('/', loginRouter);
app.use('/prestadores', prestadoresRouters);
app.use('/clientes', clientesRouters);
app.use('/categorias', categoriasRouters);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters);
app.use('/mensagens', mensagensRouters);
app.use('/pagamentos', pagamentosRouters);

app.use('/', basic);

// ... (o restante do seu código do server.js permanece o mesmo) ...

// --- Lógica do Socket.IO (apenas conexão e salas, a emissão de mensagens será no controller) ---
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Usuário conectado: ${socket.id}`);

     // Um evento para o cliente se juntar a uma sala de chat (ex: sala da solicitacao_id)
    socket.on('joinRoom', (solicitacaoId) => {
    socket.join(solicitacaoId);
    console.log(`[Socket.IO] Usuário ${socket.id} entrou na sala: ${solicitacaoId}`);
    });
    // Removido: socket.on('chatMessage', ...) - A emissão agora será feita pelo controller HTTP POST

    socket.on('disconnect', () => {
    console.log(`[Socket.IO] Usuário desconectado: ${socket.id}`);
    });
});



// Inicia o servidor HTTP (que agora inclui o Express e o Socket.IO)
// server.listen(PORT, HOST, () => {
//     console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
//     console.log(`Socket.IO escutando em ws://${HOST}:${PORT}`);
//     console.log('Pressione Ctrl+C para parar.');
// });

// server.listen(PORT, HOST, () => { // Use 'HOST' aqui, já que ele será '0.0.0.0'
//     console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
//     console.log(`Socket.IO escutando em ws://${HOST}:${PORT}`);
//     console.log('Pressione Ctrl+C para parar.');
// });

server.listen(PORT, '0.0.0.0', () => { // <--- Mude 'HOST' para '0.0.0.0' diretamente
    console.log(`Servidor JobConnect rodando em http://0.0.0.0:${PORT}`);
    console.log(`Socket.IO escutando em ws://0.0.0.0:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});
