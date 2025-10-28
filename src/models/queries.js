const queries = {
    // Users
    CREATE_USER: `
        INSERT INTO users (email, password_hash, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, email, role, created_at
    `,
    
    FIND_USER_BY_EMAIL: `
        SELECT id, email, password_hash, role 
        FROM users 
        WHERE email = $1
    `,
    
    FIND_USER_BY_ID: `
        SELECT id, email, role, created_at 
        FROM users 
        WHERE id = $1
    `,

    // Profiles
    CREATE_PROFILE: `
        INSERT INTO profiles (user_id, full_name, phone, date_of_birth, address) 
        VALUES ($1, $2, $3, $4, $5)
    `,

    UPDATE_PROFILE: `
        UPDATE profiles 
        SET full_name = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            date_of_birth = COALESCE($3, date_of_birth),
            address = COALESCE($4, address),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
    `,

    // Patients
    CREATE_PATIENT: `
        INSERT INTO patients (user_id, cpf, emergency_contact, health_insurance, blood_type, allergies) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
    `,

    FIND_PATIENT_BY_CPF: `
        SELECT id FROM patients WHERE cpf = $1
    `,

    FIND_PATIENT_BY_ID: `
        SELECT p.*, u.email, prof.full_name, prof.phone, prof.date_of_birth, prof.address
        FROM patients p
        JOIN users u ON p.user_id = u.id
        JOIN profiles prof ON u.id = prof.user_id
        WHERE p.id = $1
    `,

    LIST_PATIENTS: `
        SELECT p.*, u.email, prof.full_name, prof.phone, prof.date_of_birth
        FROM patients p
        JOIN users u ON p.user_id = u.id
        JOIN profiles prof ON u.id = prof.user_id
        WHERE 1=1
    `,

    COUNT_PATIENTS: `
        SELECT COUNT(*) 
        FROM patients p
        JOIN users u ON p.user_id = u.id
        JOIN profiles prof ON u.id = prof.user_id
        WHERE 1=1
    `,

    UPDATE_PATIENT: `
        UPDATE patients 
        SET emergency_contact = COALESCE($1, emergency_contact),
            health_insurance = COALESCE($2, health_insurance),
            blood_type = COALESCE($3, blood_type),
            allergies = COALESCE($4, allergies)
        WHERE id = $5
    `,

    DELETE_PATIENT: `
        DELETE FROM patients WHERE id = $1 RETURNING id
    `,

    // Doctors
    CREATE_DOCTOR: `
        INSERT INTO doctors (user_id, crm, specialty, consultation_fee, active) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `,

    LIST_DOCTORS: `
        SELECT d.*, u.email, prof.full_name, prof.phone
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN profiles prof ON u.id = prof.user_id
        WHERE d.active = true
    `,

    // Appointments
    CREATE_APPOINTMENT: `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, notes) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `,

    LIST_APPOINTMENTS: `
        SELECT a.*, 
               p.cpf as patient_cpf, prof_p.full_name as patient_name,
               d.crm as doctor_crm, prof_d.full_name as doctor_name, d.specialty
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN profiles prof_p ON p.user_id = prof_p.user_id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN profiles prof_d ON d.user_id = prof_d.user_id
        WHERE 1=1
    `,

    // Medical Files
    CREATE_MEDICAL_FILE: `
        INSERT INTO medical_files 
        (patient_id, filename, original_name, file_path, file_type, file_size, description, uploaded_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
    `,

    LIST_MEDICAL_FILES: `
        SELECT mf.*, u.email as uploaded_by_email, prof.full_name as uploaded_by_name
        FROM medical_files mf
        LEFT JOIN users u ON mf.uploaded_by = u.id
        LEFT JOIN profiles prof ON u.id = prof.user_id
        WHERE mf.patient_id = $1
        ORDER BY mf.created_at DESC
    `,

    FIND_MEDICAL_FILE: `
        SELECT * FROM medical_files WHERE id = $1
    `,

    DELETE_MEDICAL_FILE: `
        DELETE FROM medical_files WHERE id = $1 RETURNING *
    `
};

module.exports = queries;