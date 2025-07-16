import express from 'express';
// Importando as rotas específicas para cada entidade
import prestadoresRoutes from './routes/prestadoresRouters.js';
import clientesRoutes from './routes/clientesRouters.js';
import categoriasRoutes from './routes/categoriasRoutes.js';
import basic from './routes/basicRouters.js';
// Importações dos novos arquivos de rotas
import servicosOferecidosRouters from './routes/servicosOferecidosRouters.js'; // Novo
import solicitacoesRouters from '../routes/solicitacoesRouters.js';     // Novo

// Importar o middleware de autenticação (se for aplicado globalmente ou em múltiplos lugares)
import authMiddleware from '../middlewares/authMiddleware.js';

const app = express();
// Definindo a porta e o host, preferindo variáveis de ambiente
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware para parsear o corpo das requisições em JSON
app.use(express.json());

// --- Montagem das Rotas ---
// As requisições para '/prestadores' serão tratadas por prestadoresRoutes
app.use('/prestadores', prestadoresRoutes);

// As requisições para '/clientes' serão tratadas por clientesRoutes
app.use('/clientes', clientesRoutes);

// As requisições para '/categorias' serão tratadas por categoriasRoutes
app.use('/categorias', categoriasRoutes);

// As requisições para '/servicos-oferecidos' serão tratadas por servicosOferecidosRouters
app.use('/servicos-oferecidos', servicosOferecidosRouters); // Montando o novo roteador de serviços oferecidos

// As requisições para '/solicitacoes' serão tratadas por solicitacoesRouters
app.use('/solicitacoes', solicitacoesRouters); // Montando o novo roteador de solicitações

// Rotas básicas ou de "fallback" (ex: rota raiz '/')
app.use('/', basic);

// Inicia o servidor na porta e host definidos
app.listen(PORT, HOST, () => {
    console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});
