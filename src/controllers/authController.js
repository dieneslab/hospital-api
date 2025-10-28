const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');

const authController = {
    async register(req, res) {
        try {
            const { email, password, role, full_name, phone, cpf, specialty, crm } = req.body;

            // Validar role
            const validRoles = ['admin', 'doctor', 'patient', 'staff'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: 'Tipo de usuário inválido' });
            }

            // Verificar se email já existe
            const existingUser = await db.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Hash da senha
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Inserir usuário
            const userResult = await db.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
                [email, passwordHash, role]
            );

            const userId = userResult.rows[0].id;

            // Inserir perfil
            await db.query(
                'INSERT INTO profiles (user_id, full_name, phone) VALUES ($1, $2, $3)',
                [userId, full_name, phone]
            );

            // Inserir dados específicos baseado no role
            if (role === 'patient' && cpf) {
                await db.query(
                    'INSERT INTO patients (user_id, cpf) VALUES ($1, $2)',
                    [userId, helpers.formatCPF(cpf)]
                );
            } else if (role === 'doctor' && crm && specialty) {
                await db.query(
                    'INSERT INTO doctors (user_id, crm, specialty) VALUES ($1, $2, $3)',
                    [userId, crm, specialty]
                );
            }

            // Gerar token JWT
            const token = jwt.sign(
                { userId: userId, email: email, role: role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            logger.info(`Novo usuário registrado: ${email} - ${role}`);

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                user: {
                    id: userId,
                    email: email,
                    role: role,
                    full_name: full_name
                },
                token
            });

        } catch (error) {
            logger.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            // Buscar usuário com perfil
            const userResult = await db.query(
                `SELECT u.id, u.email, u.password_hash, u.role, p.full_name 
                 FROM users u 
                 JOIN profiles p ON u.id = p.user_id 
                 WHERE u.email = $1`,
                [email]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const user = userResult.rows[0];

            // Verificar senha
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Gerar token JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            logger.info(`Login realizado: ${email}`);

            res.json({
                message: 'Login realizado com sucesso',
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name
                },
                token
            });

        } catch (error) {
            logger.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getProfile(req, res) {
        try {
            const userResult = await db.query(
                `SELECT u.id, u.email, u.role, u.created_at, 
                        p.full_name, p.phone, p.date_of_birth, p.address
                 FROM users u 
                 JOIN profiles p ON u.id = p.user_id 
                 WHERE u.id = $1`,
                [req.user.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json({ user: userResult.rows[0] });

        } catch (error) {
            logger.error('Erro ao buscar perfil:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = authController;