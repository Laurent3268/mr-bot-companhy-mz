const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8939065923961050" crossorigin="anonymous"></script>
// Configurar o EJS como o motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar a pasta pública para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar o armazenamento do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware de verificação de autenticação
function verificaAutenticacao(req, res, next) {
    const usuarioAutenticado = true;
    if (usuarioAutenticado) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Rota para a tela de boas-vindas
app.get('/', (req, res) => {
    res.render('index');
});

// Rota para o dashboard
app.get('/dashboard', (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            console.error('Erro ao listar arquivos', err);
            res.render('dashboard', { imagens: [] });
        } else {
            const imagens = files.map(file => `/uploads/${file}`);
            res.render('dashboard', { imagens });
        }
    });
});

// Rota para o painel administrativo
app.get('/admin', verificaAutenticacao, (req, res) => {
    res.render('admin', { imagens: [] });
});


// Rota para upload de imagens
app.post('/admin/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        console.log('Arquivo carregado:', req.file);
        res.redirect('/admin');
    } else {
        res.status(400).send('Erro ao carregar arquivo: Nenhum arquivo selecionado');
    }
});

// Rota de login
app.get('/login', (req, res) => {
    res.send('Página de Login - implementar lógica de autenticação');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

app.post('/admin/delete/:id', (req, res) => {
    const imagemId = req.params.id;

    // Ler o diretório de uploads para encontrar o arquivo correspondente
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            console.error('Erro ao listar arquivos', err);
            res.status(500).send('Erro ao acessar o servidor.');
        } else {
            const fileName = files[imagemId];
            if (fileName) {
                // Caminho completo do arquivo a ser deletado
                const filePath = path.join(__dirname, 'uploads', fileName);

                // Deletar o arquivo do sistema
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Erro ao deletar arquivo', err);
                        res.status(500).send('Erro ao deletar o arquivo.');
                    } else {
                        console.log('Arquivo deletado:', fileName);
                        res.redirect('/admin');
                    }
                });
            } else {
                res.status(404).send('Imagem não encontrada');
            }
        }
    });
});
