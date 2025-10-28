const db = require('../config/database');
const queries = require('../models/queries');
const logger = require('../utils/logger');

const appointmentController = {
    async createAppointment(req, res) {
        try {
            const { patient_id, doctor_id, appointment_date, notes } = req.body;

            // Verificar se paciente existe
            const patientResult = await db.query(
                'SELECT id FROM patients WHERE id = $1',
                [patient_id]
            );

            if (patientResult.rows.length === 0) {
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }

            // Verificar se médico existe e está ativo
            const doctorResult = await db.query(
                'SELECT id FROM doctors WHERE id = $1 AND active = true',
                [doctor_id]
            );

            if (doctorResult.rows.length === 0) {
                return res.status(404).json({ error: 'Médico não encontrado ou inativo' });
            }

            // Verificar conflito de horário
            const conflictResult = await db.query(
                `SELECT id FROM appointments 
                 WHERE doctor_id = $1 
                 AND appointment_date = $2 
                 AND status != 'cancelled'`,
                [doctor_id, appointment_date]
            );

            if (conflictResult.rows.length > 0) {
                return res.status(400).json({ error: 'Médico já possui consulta neste horário' });
            }

            const appointmentResult = await db.query(queries.CREATE_APPOINTMENT, [
                patient_id, doctor_id, appointment_date, 'scheduled', notes
            ]);

            logger.info(`Consulta agendada: Paciente ${patient_id} com Médico ${doctor_id} em ${appointment_date}`);

            res.status(201).json({
                message: 'Consulta agendada com sucesso',
                appointment: appointmentResult.rows[0]
            });

        } catch (error) {
            logger.error('Erro ao agendar consulta', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getAppointments(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                patient_id, 
                doctor_id, 
                status, 
                start_date, 
                end_date 
            } = req.query;

            const { offset } = helpers.paginate(page, limit, 0);

            let query = queries.LIST_APPOINTMENTS;
            const params = [];
            let paramCount = 0;

            if (patient_id) {
                paramCount++;
                query += ` AND a.patient_id = $${paramCount}`;
                params.push(patient_id);
            }

            if (doctor_id) {
                paramCount++;
                query += ` AND a.doctor_id = $${paramCount}`;
                params.push(doctor_id);
            }

            if (status) {
                paramCount++;
                query += ` AND a.status = $${paramCount}`;
                params.push(status);
            }

            if (start_date) {
                paramCount++;
                query += ` AND a.appointment_date >= $${paramCount}`;
                params.push(start_date);
            }

            if (end_date) {
                paramCount++;
                query += ` AND a.appointment_date <= $${paramCount}`;
                params.push(end_date);
            }

            query += ` ORDER BY a.appointment_date DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            params.push(limit, offset);

            const appointmentsResult = await db.query(query, params);

            // Contagem total (simplificado)
            const countResult = await db.query('SELECT COUNT(*) FROM appointments');
            const total = parseInt(countResult.rows[0].count);

            res.json({
                appointments: appointmentsResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            logger.error('Erro ao buscar consultas', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async updateAppointmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, diagnosis, prescription } = req.body;

            const validStatus = ['scheduled', 'completed', 'cancelled', 'no_show'];
            if (!validStatus.includes(status)) {
                return res.status(400).json({ error: 'Status inválido' });
            }

            const result = await db.query(
                `UPDATE appointments 
                 SET status = $1, 
                     diagnosis = COALESCE($2, diagnosis),
                     prescription = COALESCE($3, prescription)
                 WHERE id = $4 
                 RETURNING *`,
                [status, diagnosis, prescription, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Consulta não encontrada' });
            }

            logger.info(`Status da consulta ${id} atualizado para: ${status}`);

            res.json({
                message: 'Status da consulta atualizado com sucesso',
                appointment: result.rows[0]
            });

        } catch (error) {
            logger.error('Erro ao atualizar status da consulta', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getAppointmentStats(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_appointments,
                    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                    COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show
                FROM appointments
            `;

            const monthlyQuery = `
                SELECT 
                    DATE_TRUNC('month', appointment_date) as month,
                    COUNT(*) as count
                FROM appointments
                WHERE appointment_date >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY month
                ORDER BY month
            `;

            const [statsResult, monthlyResult] = await Promise.all([
                db.query(statsQuery),
                db.query(monthlyQuery)
            ]);

            res.json({
                statistics: statsResult.rows[0],
                monthly_trends: monthlyResult.rows
            });

        } catch (error) {
            logger.error('Erro ao buscar estatísticas de consultas', error);
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

module.exports = appointmentController;