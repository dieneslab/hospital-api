const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuração simplificada usando as mesmas variáveis
const isProduction = process.env.NODE_ENV === 'production';

// Servers - todos usando as mesmas variáveis do .env
const servers = [
    {
        url: isProduction 
            ? (process.env.API_URL_PROD || 'https://hospital-api.up.railway.app')
            : (process.env.API_URL_DEV || `http://localhost:${process.env.PORT || 3000}`),
        description: isProduction ? '🎯 Production server' : '🎯 Development server'
    },
    {
        url: process.env.API_URL_PROD || 'https://hospital-api.up.railway.app',
        description: '🚀 Production'
    },
    {
        url: process.env.API_URL_DEV || 'http://localhost:3000',
        description: '💻 Development'
    }
];

// Remover duplicatas
const uniqueServers = servers.filter((server, index, self) => 
    index === self.findIndex(s => s.url === server.url)
);

console.log('🔧 Swagger Servers Config:');
uniqueServers.forEach((server, index) => {
    const indicator = index === 0 ? '🎯 SELECIONADO' : '🔁 ALTERNATIVA';
    console.log(`   ${indicator}: ${server.description} - ${server.url}`);
});

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hospital Management API',
            version: '1.0.0',
            description: 'Sistema completo de gestão hospitalar com PostgreSQL',
            contact: {
                name: 'API Support',
                email: 'support@hospital.com'
            },
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html'
            }
        },
        servers: uniqueServers,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'password', 'role'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        password: {
                            type: 'string',
                            minLength: 6
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'doctor', 'patient', 'staff']
                        }
                    }
                },
                Patient: {
                    type: 'object',
                    required: ['full_name', 'cpf'],
                    properties: {
                        full_name: { type: 'string' },
                        cpf: { type: 'string' },
                        phone: { type: 'string' },
                        emergency_contact: { type: 'string' },
                        health_insurance: { type: 'string' },
                        blood_type: { type: 'string' },
                        allergies: { type: 'string' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };