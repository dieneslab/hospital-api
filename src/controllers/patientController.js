const db = require('../config/database');
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');

const patientController = {
    async createPatient(req, res) {
        try {
            const { full_name, cpf, phone, date_of_birth, emergency_contact, health_insurance, blood_type, allergies } = req.body;

            // Verificar se CPF já existe
            const existingPatient = await db.query(
                'SELECT id FROM patients WHERE cpf = $1',
                [cpf]
            );

            if (existingPatient.rows.length > 0) {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }

            // Em uma implementação real, você criaria o usuário primeiro
            // Aqui é uma simplificação para teste
            const userResult = await db.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
                [`${cpf}@patient.com`, 'hashed_password_temp', 'patient']
            );

            const userId = userResult.rows[0].id;

            // Criar perfil
            await db.query(
                'INSERT INTO profiles (user_id, full_name, phone, date_of_birth) VALUES ($1, $2, $3, $4)',
                [userId, full_name, phone, date_of_birth]
            );

            // Criar paciente
            const result = await db.query(
                `INSERT INTO patients (user_id, cpf, emergency_contact, health_insurance, blood_type, allergies) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [userId, cpf, emergency_contact, health_insurance, blood_type, allergies]
            );

            logger.info(`Paciente criado: ${full_name} - CPF: ${cpf}`);

            res.status(201).json({
                message: 'Paciente criado com sucesso',
                patient: result.rows[0]
            });

        } catch (error) {
            logger.error('Erro ao criar paciente:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getPatients(req, res) {
        try {
            const { page = 1, limit = 10, search, blood_type } = req.query;
            const offset = (page - 1) * limit;

            let query = `
                SELECT p.*, u.email, prof.full_name, prof.phone, prof.date_of_birth
                FROM patients p
                JOIN users u ON p.user_id = u.id
                JOIN profiles prof ON u.id = prof.user_id
                WHERE 1=1
            `;
            const params = [];
            let paramCount = 0;

            if (search) {
                paramCount++;
                query += ` AND (prof.full_name ILIKE $${paramCount} OR p.cpf ILIKE $${paramCount})`;
                params.push(`%${search}%`);
            }

            if (blood_type) {
                paramCount++;
                query += ` AND p.blood_type = $${paramCount}`;
                params.push(blood_type);
            }

            query += ` ORDER BY prof.full_name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(parseInt(limit), offset);

            const patientsResult = await db.query(query, params);

            // Contagem total
            let countQuery = `
                SELECT COUNT(*) 
                FROM patients p
                JOIN users u ON p.user_id = u.id
                JOIN profiles prof ON u.id = prof.user_id
                WHERE 1=1
            `;
            const countParams = [];

            if (search) {
                countParams.push(`%${search}%`);
                countQuery += ` AND (prof.full_name ILIKE $1 OR p.cpf ILIKE $1)`;
            }

            if (blood_type) {
                countParams.push(blood_type);
                countQuery += ` AND p.blood_type = $${search ? '2' : '1'}`;
            }

            const countResult = await db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].count);

            res.json({
                patients: patientsResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar pacientes:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getPatientById(req, res) {
        try {
            const { id } = req.params;

            const result = await db.query(
                `SELECT p.*, u.email, prof.full_name, prof.phone, prof.date_of_birth, prof.address
                 FROM patients p
                 JOIN users u ON p.user_id = u.id
                 JOIN profiles prof ON u.id = prof.user_id
                 WHERE p.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }

            res.json({ patient: result.rows[0] });

        } catch (error) {
            logger.error('Erro ao buscar paciente:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async updatePatient(req, res) {
        try {
            const { id } = req.params;
            const { full_name, phone, emergency_contact, health_insurance, blood_type, allergies } = req.body;

            // Verificar se paciente existe
            const existingPatient = await db.query(
                'SELECT user_id FROM patients WHERE id = $1',
                [id]
            );

            if (existingPatient.rows.length === 0) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }

            const userId = existingPatient.rows[0].user_id;

            // Atualizar dados do paciente
            await db.query(
                `UPDATE patients 
                 SET emergency_contact = $1, health_insurance = $2, blood_type = $3, allergies = $4
                 WHERE id = $5`,
                [emergency_contact, health_insurance, blood_type, allergies, id]
            );

            // Atualizar perfil se fornecido
            if (full_name || phone) {
                await db.query(
                    `UPDATE profiles 
                     SET full_name = COALESCE($1, full_name), 
                         phone = COALESCE($2, phone),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = $3`,
                    [full_name, phone, userId]
                );
            }

            res.json({ message: 'Paciente atualizado com sucesso' });

        } catch (error) {
            logger.error('Erro ao atualizar paciente:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async deletePatient(req, res) {
        try {
            const { id } = req.params;

            const result = await db.query(
                'DELETE FROM patients WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }

            res.json({ message: 'Paciente deletado com sucesso' });

        } catch (error) {
            logger.error('Erro ao deletar paciente:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getPatientStats(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_patients,
                    COUNT(DISTINCT blood_type) as blood_types_count,
                    COUNT(DISTINCT health_insurance) as insurance_companies_count
                FROM patients
            `;

            const bloodTypeQuery = `
                SELECT blood_type, COUNT(*) as count
                FROM patients 
                WHERE blood_type IS NOT NULL 
                GROUP BY blood_type
            `;

            const [statsResult, bloodResult] = await Promise.all([
                db.query(statsQuery),
                db.query(bloodTypeQuery)
            ]);

            res.json({
                statistics: statsResult.rows[0],
                blood_types: bloodResult.rows
            });

        } catch (error) {
            logger.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = patientController;