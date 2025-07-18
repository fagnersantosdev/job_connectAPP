import express from 'express';
import mensagensController from '../controllers/mensagensController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer'; // Importar multer
import path from 'path'; // Importar path para lidar com caminhos de arquivo
import { fileURLToPath } from 'url'; // Para __dirname em módulos ES

// __dirname não está disponível em módulos ES (import/export), então precisamos recriá-lo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../'); // Caminho para a raiz do projeto

// Configuração do Multer para armazenamento em disco
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define o diretório onde os arquivos serão salvos
        // Usamos path.join para garantir que o caminho seja correto em diferentes SOs
        cb(null, path.join(projectRoot, 'uploads'));
    },
    filename: (req, file, cb) => {
        // Define o nome do arquivo: timestamp + nome original
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB para a imagem
    },
    fileFilter: (req, file, cb) => {
        // Aceita apenas imagens
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

const router = express.Router();

// --- Rotas Protegidas para Mensagens ---
// Todas as rotas de mensagens devem ser protegidas, pois envolvem comunicação privada.

// POST /mensagens - Envia uma nova mensagem (com suporte a upload de imagem)
// 'upload.single('foto')' significa que esperamos um único arquivo no campo 'foto' do formulário.
router.post('/', authMiddleware, upload.single('foto'), mensagensController.createMensagem);

// GET /mensagens/solicitacao/:solicitacao_id - Obtém todas as mensagens para uma solicitação específica
router.get('/solicitacao/:solicitacao_id', authMiddleware, mensagensController.getMensagensBySolicitacao);

// PUT /mensagens/:id/read - Marca uma mensagem como lida
router.put('/:id/read', authMiddleware, mensagensController.markMensagemAsRead);

// DELETE /mensagens/:id - Deleta uma mensagem
router.delete('/:id', authMiddleware, mensagensController.deleteMensagem);

export default router;
