const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const fileController = {
    async uploadFile(req, res) {
        try {
            const { patient_id, description } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            // Verificar se paciente existe
            const patientResult = await db.query(
                'SELECT id FROM patients WHERE id = $1',
                [patient_id]
            );

            if (patientResult.rows.length === 0) {
                // Deletar arquivo enviado
                fs.unlinkSync(file.path);
                return res.status(404).json({ error: 'Paciente não encontrado' });
            }

            // Inserir registro do arquivo no banco
            const result = await db.query(
                `INSERT INTO medical_files 
                 (patient_id, filename, original_name, file_path, file_type, file_size, description, uploaded_by) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                 RETURNING *`,
                [
                    patient_id,
                    file.filename,
                    file.originalname,
                    file.path,
                    file.mimetype,
                    file.size,
                    description,
                    req.user.id
                ]
            );

            res.status(201).json({
                message: 'Arquivo enviado com sucesso',
                file: result.rows[0]
            });

        } catch (error) {
            console.error('Erro no upload:', error);
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getPatientFiles(req, res) {
        try {
            const { patient_id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const filesResult = await db.query(
                `SELECT mf.*, u.email as uploaded_by_email, prof.full_name as uploaded_by_name
                 FROM medical_files mf
                 LEFT JOIN users u ON mf.uploaded_by = u.id
                 LEFT JOIN profiles prof ON u.id = prof.user_id
                 WHERE mf.patient_id = $1
                 ORDER BY mf.created_at DESC
                 LIMIT $2 OFFSET $3`,
                [patient_id, limit, offset]
            );

            const countResult = await db.query(
                'SELECT COUNT(*) FROM medical_files WHERE patient_id = $1',
                [patient_id]
            );

            const total = parseInt(countResult.rows[0].count);

            res.json({
                files: filesResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Erro ao buscar arquivos:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async downloadFile(req, res) {
        try {
            const { file_id } = req.params;

            const fileResult = await db.query(
                'SELECT * FROM medical_files WHERE id = $1',
                [file_id]
            );

            if (fileResult.rows.length === 0) {
                return res.status(404).json({ error: 'Arquivo não encontrado' });
            }

            const file = fileResult.rows[0];

            if (!fs.existsSync(file.file_path)) {
                return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
            }

            res.setHeader('Content-Type', file.file_type);
            res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);

            const fileStream = fs.createReadStream(file.file_path);
            fileStream.pipe(res);

        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async deleteFile(req, res) {
        try {
            const { file_id } = req.params;

            const fileResult = await db.query(
                'SELECT * FROM medical_files WHERE id = $1',
                [file_id]
            );

            if (fileResult.rows.length === 0) {
                return res.status(404).json({ error: 'Arquivo não encontrado' });
            }

            const file = fileResult.rows[0];

            // Deletar do banco
            await db.query('DELETE FROM medical_files WHERE id = $1', [file_id]);

            // Deletar arquivo físico
            if (fs.existsSync(file.file_path)) {
                fs.unlinkSync(file.file_path);
            }

            res.json({ message: 'Arquivo deletado com sucesso' });

        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = fileController;