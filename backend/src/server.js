import express from 'express';
// Importando as rotas específicas para cada entidade
import prestadoresRoutes from './routes/prestadoresRouters.js';
import clientesRoutes from './routes/clientesRouters.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import basic from './routes/basicRouters.js';
import servicosOferecidosRouters from './routes/servicosOferecidosRouters.js';
import solicitacoesRouters from './routes/solicitacoesRouters.js';
import avaliacoesRouters from './routes/avaliacoesRouters.js'; // NOVO: Importar rotas de avaliações

// Importar o middleware de autenticação (se for aplicado globalmente ou em múltiplos lugares)
import authMiddleware from './middlewares/authMiddleware.js';

const app = express();
// Definindo a porta e o host, preferindo variáveis de ambiente
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware para parsear o corpo das requisições em JSON
app.use(express.json());

// --- Montagem das Rotas ---
app.use('/prestadores', prestadoresRoutes);
app.use('/clientes', clientesRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters); // NOVO: Montar o roteador de avaliações

// Rotas básicas ou de "fallback" (ex: rota raiz '/')
app.use('/', basic);

// Inicia o servidor na porta e host definidos
app.listen(PORT, HOST, () => {
    console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});
