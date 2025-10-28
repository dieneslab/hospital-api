const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validate, validation } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Gerenciamento de médicos
 */

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Criar novo médico
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - crm
 *               - specialty
 *               - email
 *             properties:
 *               full_name:
 *                 type: string
 *               crm:
 *                 type: string
 *               specialty:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               consultation_fee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Médico criado com sucesso
 */
router.post('/', authenticateToken, authorize('admin'), doctorController.createDoctor);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Listar médicos
 *     tags: [Doctors]
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
 *         name: specialty
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de médicos
 */
router.get('/', authenticateToken, authorize('admin', 'doctor', 'staff'), doctorController.getDoctors);

/**
 * @swagger
 * /api/doctors/stats:
 *   get:
 *     summary: Estatísticas de médicos
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos médicos
 */
router.get('/stats', authenticateToken, authorize('admin', 'staff'), doctorController.getDoctorStats);

module.exports = router;