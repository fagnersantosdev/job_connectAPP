import express from 'express';
// Importando as rotas específicas para cada entidade
import prestadoresRoutes from './routes/prestadoresRouters.js'; 
import clientesRoutes from './routes/clientesRouters.js';   
import categoriasRoutes from './routes/categoriasRoutes.js'; // Adicionado: Rotas para Categorias de Serviço
import basic from './routes/basicRouters.js'; 
import servicosOferecidosController from '../controllers/servicosOferecidosController.js';

const router = express.Router();
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
// Este é o passo que integra as rotas de categorias que criamos anteriormente.
app.use('/categorias', categoriasRoutes);

// Rotas básicas ou de "fallback" (ex: rota raiz '/')
// Certifique-se de que o basicRouters.js não tenha rotas que conflitem com as acima.
app.use('/', basic);

// Inicia o servidor na porta e host definidos
app.listen(PORT, HOST, () => {
    console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});

// Rotas para Serviços Oferecidos
// GET /servicos-oferecidos - Obtém todos os serviços (pode ter filtros por query params)
router.get('/servicos-oferecidos', servicosOferecidosController.getAllServicosOferecidos);
// GET /servicos-oferecidos/:id - Obtém um serviço específico pelo ID
router.get('/servicos-oferecidos/:id', servicosOferecidosController.getServicoOferecidoById);
// POST /servicos-oferecidos - Cria um novo serviço
router.post('/servicos-oferecidos', servicosOferecidosController.createServicoOferecido);
// PUT /servicos-oferecidos/:id - Atualiza um serviço existente
router.put('/servicos-oferecidos/:id', servicosOferecidosController.updateServicoOferecido);
// DELETE /servicos-oferecidos/:id - Deleta um serviço
router.delete('/servicos-oferecidos/:id', servicosOferecidosController.deleteServicoOferecido);