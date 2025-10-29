# 🏥 Hospital Management API

Bem-vindo à API de Gestão Hospitalar! Uma solução completa para gerenciamento de pacientes, médicos, consultas e prontuários médicos. 🚀

## 📌 Sobre o Projeto

Esta API foi desenvolvida para fornecer um sistema robusto de gestão hospitalar, permitindo o controle completo de operações médicas através de uma interface RESTful moderna. O projeto implementa autenticação segura, upload de arquivos, relatórios detalhados e documentação interativa.

## 🛠️ Tecnologias Utilizadas

* [Node.js](https://nodejs.org/) - Ambiente de execução JavaScript
* [Express.js](https://expressjs.com/) - Framework web para Node.js
* [PostgreSQL](https://www.postgresql.org/) - Banco de dados relacional
* [JWT](https://jwt.io/) - Autenticação por tokens
* [Swagger/OpenAPI](https://swagger.io/) - Documentação interativa da API
* [Multer](https://github.com/expressjs/multer) - Upload de arquivos
* [Joi](https://joi.dev/) - Validação de dados
* [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Criptografia de senhas

## 📂 Estrutura do Projeto

```sh
📦 hospital-api
├── 📂 src
│   ├── 📂 controllers     # Lógica de negócio
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   └── fileController.js
│   ├── 📂 routes         # Definição de endpoints
│   │   ├── auth.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   └── files.js
│   ├── 📂 middleware     # Middlewares customizados
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── 📂 config         # Configurações
│   │   ├── database.js
│   │   └── swagger.js
│   ├── 📂 models         # Modelos e queries
│   │   ├── database.js
│   │   └── queries.js
│   ├── 📂 utils          # Utilitários
│   │   ├── logger.js
│   │   └── helpers.js
│   └── 📂 tests          # Testes automatizados
├── 📂 uploads            # Arquivos enviados
├── 📂 scripts            # Scripts do banco
│   └── hospital-railway-setup.sql
│   └── hospital-setup.sql
├── 📜 .env               # Variáveis de ambiente
├── 📜 package.json       # Dependências e scripts
└── 📜 server.js          # Arquivo principal
```

## 🚀 Como Executar a Aplicação

### 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* [Node.js >= 18](https://nodejs.org/)
* [PostgreSQL >= 13](https://www.postgresql.org/download/)
* [Git](https://git-scm.com/)

### 📥 Clonar o Repositório

```sh
git clone https://github.com/seu-usuario/hospital-api.git
cd hospital-api
```

### 📦 Instalar Dependências

```sh
npm install
```

### 🗄️ Configurar Banco de Dados

1. **Iniciar o PostgreSQL** e criar o banco:

```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco de dados
CREATE DATABASE hospital_db;

-- Conectar ao banco
\\c hospital_db;

-- Executar script de setup
\\i scripts/hospital-setup.sql
```

2. **Ou usar Docker** (opcional):
```sh
docker run --name hospital-db -e POSTGRES_PASSWORD=senha123 -e POSTGRES_DB=hospital_db -p 5432:5432 -d postgres:13
```

### ⚙️ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASS=senha123
API_URL_DEV=http://localhost:3000
API_URL_PROD=https://hospital-api.up.railway.app
JWT_SECRET=seu_jwt_super_secreto_mude_em_producao_2023
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
```

### ▶️ Executar a Aplicação

**Modo desenvolvimento:**
```sh
npm run server
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação interativa:

```
http://localhost:3000/api-docs
```

### 🔍 Health Check
```
GET http://localhost:3000/health
```

## 🌐 Testes Online

Tento manter sempre no ar, mas a API está disponível para testes em produção:

🔗 https://hospital-api.up.railway.app/api-docs

Documentação interativa com Swagger - teste todos os endpoints diretamente pelo navegador.

## 🎯 Endpoints Principais

### 🔐 Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/profile` - Obter perfil do usuário

### 👥 Pacientes
- `GET /api/patients` - Listar pacientes (com paginação e filtros)
- `POST /api/patients` - Criar paciente
- `GET /api/patients/stats` - Estatísticas de pacientes
- `GET /api/patients/:id` - Buscar paciente por ID
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### 🩺 Médicos
- `GET /api/doctors` - Listar médicos
- `POST /api/doctors` - Criar médico
- `GET /api/doctors/stats` - Estatísticas de médicos

### 📅 Consultas
- `GET /api/appointments` - Listar consultas
- `POST /api/appointments` - Agendar consulta
- `PATCH /api/appointments/:id/status` - Atualizar status da consulta
- `GET /api/appointments/stats` - Estatísticas de consultas

### 📁 Arquivos
- `POST /api/files/upload` - Upload de arquivo médico
- `GET /api/files/patient/:patient_id` - Listar arquivos do paciente
- `GET /api/files/download/:file_id` - Download de arquivo
- `DELETE /api/files/:file_id` - Deletar arquivo

## 🧪 Testando a API

### 1. **Registrar um usuário:**
```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@hospital.com",
    "password": "senha123",
    "role": "admin",
    "full_name": "Administrador do Sistema"
  }'
```

### 2. **Fazer login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@hospital.com",
    "password": "senha123"
  }'
```

### 3. **Usar o token JWT** (obtido no login) em requisições subsequentes:
```bash
curl -X GET http://localhost:3000/api/patients \\
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

## 🔒 Sistema de Autenticação e Autorização

A API utiliza **JWT (JSON Web Tokens)** com os seguintes níveis de acesso:

- **Admin**: Acesso completo ao sistema
- **Doctor**: Gestão de consultas e pacientes
- **Staff**: Operações administrativas
- **Patient**: Acesso limitado aos próprios dados

## 📊 Funcionalidades Implementadas

✅ **CRUD Completo** para todos os módulos  
✅ **Autenticação JWT** com diferentes níveis de acesso  
✅ **Upload de arquivos** (exames, imagens, documentos)  
✅ **Paginação e filtros** avançados  
✅ **Relatórios e estatísticas** detalhadas  
✅ **Validações** robustas de dados  
✅ **Documentação Swagger** interativa  
✅ **Logging** completo do sistema  
✅ **Tratamento de erros** padronizado  

## 🛠 Comandos Úteis

```sh
# Desenvolvimento (com auto-reload)
npm run server

# Executar testes
npm test

## 🤝 Contribuindo

Fique à vontade para abrir issues, sugerir melhorias ou enviar PRs. Qualquer contribuição é bem-vinda! 😊

## 📄 Licença

Este projeto está sob a licença MIT. Para mais detalhes, consulte o arquivo [LICENSE](LICENSE).

---

Desenvolvido por [Dienes Stein](https://github.com/dieneslab) 💻✨

**🚀 A API estará rodando em `http://localhost:3000`**