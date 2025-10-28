const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gerenciamento de pacientes
 */

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Listar pacientes com paginação
 *     tags: [Patients]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: blood_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/', authenticateToken, authorize('admin', 'doctor', 'staff'), patientController.getPatients);

/**
 * @swagger
 * /api/patients/stats:
 *   get:
 *     summary: Estatísticas de pacientes
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos pacientes
 */
router.get('/stats', authenticateToken, authorize('admin', 'doctor', 'staff'), patientController.getPatientStats);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Buscar paciente por ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do paciente
 */
router.get('/:id', authenticateToken, authorize('admin', 'doctor', 'staff'), patientController.getPatientById);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Criar novo paciente
 *     tags: [Patients]
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
 *               - cpf
 *             properties:
 *               full_name:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *               emergency_contact:
 *                 type: string
 *               health_insurance:
 *                 type: string
 *               blood_type:
 *                 type: string
 *               allergies:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente criado com sucesso
 */
router.post('/', authenticateToken, authorize('admin', 'staff'), patientController.createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Atualizar paciente
 *     tags: [Patients]
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
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               emergency_contact:
 *                 type: string
 *               health_insurance:
 *                 type: string
 *               blood_type:
 *                 type: string
 *               allergies:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente atualizado com sucesso
 */
router.put('/:id', authenticateToken, authorize('admin', 'staff'), patientController.updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Deletar paciente
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente deletado com sucesso
 */
router.delete('/:id', authenticateToken, authorize('admin'), patientController.deletePatient);

module.exports = router;