const Joi = require('joi');

const validation = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'doctor', 'patient', 'staff').required(),
        full_name: Joi.string().min(2).required(),
        phone: Joi.string().optional(),
        cpf: Joi.string().when('role', {
            is: 'patient',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        specialty: Joi.string().when('role', {
            is: 'doctor',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        crm: Joi.string().when('role', {
            is: 'doctor',
            then: Joi.required(),
            otherwise: Joi.optional()
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    patient: Joi.object({
        full_name: Joi.string().min(2).required(),
        cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required(),
        phone: Joi.string().optional(),
        emergency_contact: Joi.string().optional(),
        health_insurance: Joi.string().optional(),
        blood_type: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
        allergies: Joi.string().optional()
    }),

    appointment: Joi.object({
        patient_id: Joi.string().required(),
        doctor_id: Joi.string().required(),
        appointment_date: Joi.date().iso().required(),
        notes: Joi.string().optional()
    })
};

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Dados de entrada inválidos',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

module.exports = { validation, validate };