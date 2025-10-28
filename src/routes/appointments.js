const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Gerenciamento de consultas
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Agendar nova consulta
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - appointment_date
 *             properties:
 *               patient_id:
 *                 type: string
 *               doctor_id:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Consulta agendada com sucesso
 */
router.post('/', authenticateToken, authorize('admin', 'staff'), validate(validation.appointment), appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Listar consultas
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: doctor_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de consultas
 */
router.get('/', authenticateToken, authorize('admin', 'doctor', 'staff'), appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Atualizar status da consulta
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, no_show]
 *               diagnosis:
 *                 type: string
 *               prescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch('/:id/status', authenticateToken, authorize('admin', 'doctor'), appointmentController.updateAppointmentStatus);

/**
 * @swagger
 * /api/appointments/stats:
 *   get:
 *     summary: Estatísticas de consultas
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas das consultas
 */
router.get('/stats', authenticateToken, authorize('admin', 'staff'), appointmentController.getAppointmentStats);

module.exports = router;