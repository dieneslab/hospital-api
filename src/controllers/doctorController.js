const db = require('../config/database');
const queries = require('../models/queries');
const logger = require('../utils/logger');

const doctorController = {
    async createDoctor(req, res) {
        try {
            const { full_name, crm, specialty, consultation_fee, phone, email, password } = req.body;

            // Verificar se CRM já existe
            const existingDoctor = await db.query(
                'SELECT id FROM doctors WHERE crm = $1',
                [crm]
            );

            if (existingDoctor.rows.length > 0) {
                return res.status(400).json({ error: 'CRM já cadastrado' });
            }

            // Em uma implementação real, você criaria o usuário primeiro
            // Aqui é uma simplificação
            const userResult = await db.query(queries.CREATE_USER, [
                email, '$2a$10$CH6b6AiOx6t7p/jzHpXIEu5a9ACUfz5qNkKBlVBnTjwETWpZSzgrq', 'doctor'
            ]);

            const userId = userResult.rows[0].id;

            // Criar perfil
            await db.query(queries.CREATE_PROFILE, [
                userId, full_name, phone, null, null
            ]);

            // Criar médico
            const doctorResult = await db.query(queries.CREATE_DOCTOR, [
                userId, crm, specialty, consultation_fee, true
            ]);

            logger.info(`Médico criado: ${full_name} - CRM: ${crm}`);

            res.status(201).json({
                message: 'Médico criado com sucesso',
                doctor: doctorResult.rows[0]
            });

        } catch (error) {
            logger.error('Erro ao criar médico', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getDoctors(req, res) {
        try {
            const { page = 1, limit = 10, specialty, search } = req.query;
            const { offset } = helpers.paginate(page, limit, 0);

            let query = queries.LIST_DOCTORS;
            const params = [];
            let paramCount = 0;

            if (specialty) {
                paramCount++;
                query += ` AND d.specialty ILIKE $${paramCount}`;
                params.push(`%${specialty}%`);
            }

            if (search) {
                paramCount++;
                query += ` AND prof.full_name ILIKE $${paramCount}`;
                params.push(`%${search}%`);
            }

            query += ` ORDER BY prof.full_name ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(limit, offset);

            const doctorsResult = await db.query(query, params);

            // Contagem total (simplificado)
            const countResult = await db.query(
                'SELECT COUNT(*) FROM doctors WHERE active = true'
            );
            const total = parseInt(countResult.rows[0].count);

            res.json({
                doctors: doctorsResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar médicos', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getDoctorStats(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_doctors,
                    COUNT(DISTINCT specialty) as total_specialties,
                    AVG(consultation_fee) as avg_consultation_fee
                FROM doctors 
                WHERE active = true
            `;

            const specialtyQuery = `
                SELECT specialty, COUNT(*) as count
                FROM doctors 
                WHERE active = true 
                GROUP BY specialty
                ORDER BY count DESC
            `;

            const [statsResult, specialtyResult] = await Promise.all([
                db.query(statsQuery),
                db.query(specialtyQuery)
            ]);

            res.json({
                statistics: statsResult.rows[0],
                specialties: specialtyResult.rows
            });

        } catch (error) {
            logger.error('Erro ao buscar estatísticas de médicos', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

const helpers = {
    paginate: (page, limit, total) => {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;
        return { offset };
    }
};

module.exports = doctorController;