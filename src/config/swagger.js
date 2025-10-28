const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.hospital.com',
                description: 'Production server'
            }
        ],
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