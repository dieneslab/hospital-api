require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rotas
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patients');
const doctorRoutes = require('./src/routes/doctors');
const appointmentRoutes = require('./src/routes/appointments');
const fileRoutes = require('./src/routes/files');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/files', fileRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Hospital Management API',
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

// Swagger Documentation
const { swaggerUi, specs } = require('./src/config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Hospital API Documentation'
}));

// Rota não encontrada
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 10MB' });
        }
    }
    
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // Determinar URL base dinamicamente
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
        baseUrl = process.env.API_URL_PROD || 'https://hospital-api.up.railway.app';
    } else {
        baseUrl = process.env.API_URL_DEV || `http://localhost:${PORT}`;
    }
    
    const asciiArt = `
╔═══════════════════════════════════════════════════╗
║                🏥 HOSPITAL API                    ║
║                Sistema de Gestão                  ║
╚═══════════════════════════════════════════════════╝
    `;
    
    console.log(asciiArt);
    console.log('📊 ' + 'INFORMAÇÕES DO SISTEMA'.padEnd(35, ' ') + '📊');
    console.log('├' + '─'.repeat(48) + '┤');
    console.log(`│ 📍 Porta: ${PORT.toString().padEnd(38)} │`);
    console.log(`│ 🌐 Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(33)} │`);
    console.log(`│ 🔗 URL: ${baseUrl.padEnd(39)} │`);
    console.log('├' + '─'.repeat(48) + '┤');
    console.log(`│ 📚 Docs: ${(baseUrl + '/api-docs').padEnd(38)} │`);
    console.log(`│ ❤️  Health: ${(baseUrl + '/health').padEnd(37)} │`);
    console.log('╰' + '─'.repeat(48) + '╯');
    
    // Log da fonte da URL
    if (process.env.API_URL_PROD && process.env.NODE_ENV === 'production') {
        console.log('✅ URL carregada do .env');
    } else if (process.env.API_URL_DEV && process.env.NODE_ENV !== 'production') {
        console.log('✅ URL carregada do .env');
    } else {
        console.log('ℹ️  URL padrão (fallback)');
    }
});