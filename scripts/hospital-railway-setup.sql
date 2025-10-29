-- HOSPITAL API - SETUP PARA RAILWAY
-- Este script é compatível com PostgreSQL do Railway

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Perfis
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    health_insurance VARCHAR(100),
    emergency_contact VARCHAR(255),
    blood_type VARCHAR(5),
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Médicos
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crm VARCHAR(20) UNIQUE NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    diagnosis TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Arquivos/Exames
CREATE TABLE IF NOT EXISTS medical_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_medical_files_patient_id ON medical_files(patient_id);

-- Insert de dados iniciais (APENAS se não existirem)
INSERT INTO users (email, password_hash, role) VALUES 
('admin@hospital.com', '$2b$10$ExampleHash', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, role) VALUES 
('dr.silva@hospital.com', '$2b$10$ExampleHash', 'doctor')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, role) VALUES 
('paciente@email.com', '$2b$10$ExampleHash', 'patient')
ON CONFLICT (email) DO NOTHING;

-- Confirmar criação
SELECT '✅ Banco de dados do Hospital API configurado com sucesso!' as status;