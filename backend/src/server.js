// backend/src/server.js
import express from 'express';
import cors from 'cors'; // Importe o CORS
import dotenv from 'dotenv';
import YAML from 'yamljs'; // Importe YAMLjs
import swaggerUi from 'swagger-ui-express'; // Importe swagger-ui-express
import path from 'path'; // Importe path
import { fileURLToPath } from 'url'; // Importe fileURLToPath

// Carrega as variáveis de ambiente do .env
dotenv.config();

// __dirname não está disponível em módulos ES, então precisamos recriá-lo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../'); // Caminho para a raiz do projeto (um nível acima de src)

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Configuração do CORS (para permitir requisições do frontend)
app.use(cors());

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Middleware para servir arquivos estáticos (para uploads de imagens)
// Isso fará com que arquivos na pasta 'uploads' sejam acessíveis via http://localhost:3000/uploads/nome_do_arquivo.jpg
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

// --- Configuração do Swagger/OpenAPI ---
const swaggerSpec = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// Rota para servir a documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log(`Documentação da API disponível em http://${HOST}:${PORT}/api-docs`);
// ----------------------------------------

// Importar as rotas
import clientesRouters from './routes/clientesRouters.js';
import prestadoresRouters from './routes/prestadoresRouters.js';
import categoriasRouters from './routes/categoriasRouters.js';
import servicosOferecidosRouters from './routes/servicosOferecidosRouters.js';
import solicitacoesRouters from './routes/solicitacoesRouters.js';
import avaliacoesRouters from './routes/avaliacoesRouters.js';
import mensagensRouters from './routes/mensagensRouters.js';

// Usar as rotas
app.use('/clientes', clientesRouters);
app.use('/prestadores', prestadoresRouters);
app.use('/categorias', categoriasRouters);
app.use('/servicos-oferecidos', servicosOferecidosRouters);
app.use('/solicitacoes', solicitacoesRouters);
app.use('/avaliacoes', avaliacoesRouters);
app.use('/mensagens', mensagensRouters);

// Rota de teste
app.get('/', (req, res) => {
    res.send('Bem-vindo à API JobConnect!');
});

// Iniciar o servidor
app.listen(PORT, HOST, () => {
    console.log(`Servidor JobConnect rodando em http://${HOST}:${PORT}`);
    console.log('Pressione Ctrl+C para parar.');
});
