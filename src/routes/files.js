const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload de arquivo médico
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               patient_id:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Arquivo enviado com sucesso
 */
router.post('/upload', authenticateToken, authorize('admin', 'doctor', 'staff'), upload.single('file'), fileController.uploadFile);

/**
 * @swagger
 * /api/files/patient/{patient_id}:
 *   get:
 *     summary: Listar arquivos do paciente
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de arquivos
 */
router.get('/patient/:patient_id', authenticateToken, authorize('admin', 'doctor', 'staff'), fileController.getPatientFiles);

/**
 * @swagger
 * /api/files/download/{file_id}:
 *   get:
 *     summary: Download de arquivo
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo para download
 */
router.get('/download/:file_id', authenticateToken, authorize('admin', 'doctor', 'staff'), fileController.downloadFile);

/**
 * @swagger
 * /api/files/{file_id}:
 *   delete:
 *     summary: Deletar arquivo
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo deletado com sucesso
 */
router.delete('/:file_id', authenticateToken, authorize('admin', 'doctor'), fileController.deleteFile);

module.exports = router;