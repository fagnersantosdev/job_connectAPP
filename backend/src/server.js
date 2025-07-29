import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

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

// Injetar a instância do Socket.IO no controller de mensagens
mensagensController.setIoInstance(io);


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));


// --- Montagem das Rotas REST (Express) ---
app.use('/prestadores', prestadoresRouters);
app.use('/clientes', clientesRouters);
app.use('/categorias', categoriasRouters);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters);
app.use('/mensagens', mensagensRouters);
app.use('/pagamentos', pagamentosRouters);

app.use('/', basic);

// --- Lógica do Socket.IO ---
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Usuário conectado: ${socket.id}`);

    socket.on('joinRoom', (solicitacaoId) => {
        socket.join(solicitacaoId);
        console.log(`[Socket.IO] Usuário ${socket.id} entrou na sala: ${solicitacaoId}`);
    });

    // Este evento 'chatMessage' será o principal para o frontend enviar mensagens
    socket.on('chatMessage', async (msg) => {
        console.log(`[Socket.IO] Mensagem recebida via Socket.IO na sala ${msg.solicitacao_id}: ${msg.conteudo}`);
        // Aqui, você pode chamar o método do controller diretamente para persistir e re-emitir
        // Nota: msg.remetente_id e msg.remetente_tipo devem ser enviados pelo cliente via socket
        // Para simplificar, vamos assumir que o cliente envia esses dados ou que você os obtém do token JWT do socket.
        // Para um ambiente real, você precisaria de um middleware de autenticação para sockets.

        // Para este exemplo, vamos simular a persistência e re-emissão.
        // Em um cenário real, você faria uma chamada HTTP POST para /mensagens
        // ou teria uma lógica de persistência aqui que retornasse a mensagem completa com ID e timestamp.

        // Simulação de persistência e re-emissão
        const messageData = {
            solicitacao_id: msg.solicitacao_id,
            remetente_id: msg.remetente_id, // Assume que o cliente envia
            remetente_tipo: msg.remetente_tipo, // Assume que o cliente envia
            destinatario_id: msg.destinatario_id, // Assume que o cliente envia
            destinatario_tipo: msg.destinatario_tipo, // Assume que o cliente envia
            conteudo: msg.conteudo,
            foto_url: msg.foto_url || null,
            data_envio: new Date().toISOString(),
            id: Math.floor(Math.random() * 100000) // ID simulado
        };
        // Em um cenário real, a persistência seria feita via HTTP POST para /mensagens
        // e a resposta dessa requisição conteria os dados completos para emitir.
        // Para o Socket.IO, estamos apenas re-emitindo o que recebemos com alguns dados extras simulados.

        // Emite a mensagem para todos na sala (incluindo o remetente)
        io.to(messageData.solicitacao_id.toString()).emit('message', messageData);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Usuário desconectado: ${socket.id}`);
    });
});


// Inicia o servidor HTTP (que agora inclui o Express e o Socket.IO)
server.listen(PORT, HOST, () => {
    console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
    console.log(`Socket.IO escutando em ws://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});
