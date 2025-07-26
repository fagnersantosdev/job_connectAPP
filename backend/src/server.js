
import express from 'express';
// Importando as rotas específicas para cada entidade
import prestadoresRoutes from './routes/prestadoresRouters.js';
import clientesRoutes from './routes/clientesRouters.js';
import categoriasRouters from './routes/categoriasRouters.js';
import basic from './routes/basicRouters.js';
import servicosOferecidosRouters from './routes/servicosOferecidosRouters.js';
import solicitacoesRouters from './routes/solicitacoesRouters.js';
import avaliacoesRouters from './routes/avaliacoesRouters.js';
import mensagensRouters from './routes/mensagensRouters.js';
import pagamentosRouters from './routes/pagamentosRouters.js'; // NOVO: Importar rotas de pagamentos

// Importar o middleware de autenticação (se for aplicado globalmente ou em múltiplos lugares)
import authMiddleware from './middlewares/authMiddleware.js';

const app = express();
// Definindo a porta e o host, preferindo variáveis de ambiente
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware para parsear o corpo das requisições em JSON
app.use(express.json());

// --- Configuração para servir arquivos estáticos (imagens, etc.) ---
// __dirname não está disponível em módulos ES (import/export), então precisamos recriá-lo
import path from 'path'; // Importar path para lidar com caminhos de arquivo
import { fileURLToPath } from 'url'; // Para __dirname em módulos ES

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../'); // Caminho para a raiz do projeto (um nível acima de src)

// Serve arquivos da pasta 'uploads' sob a rota '/uploads'
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));


// --- Montagem das Rotas ---
app.use('/prestadores', prestadoresRoutes);
app.use('/clientes', clientesRoutes);
app.use('/categorias', categoriasRouters);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters);
app.use('/mensagens', mensagensRouters);
app.use('/pagamentos', pagamentosRouters); // NOVO: Montar o roteador de pagamentos

// Rotas básicas ou de "fallback" (ex: rota raiz '/')
app.use('/', basic);

// Inicia o servidor na porta e host definidos
app.listen(PORT, HOST, () => {
    console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});

