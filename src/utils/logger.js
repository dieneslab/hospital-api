const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = {
    info: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO] ${timestamp} - ${message}\n`;
        console.log(logMessage.trim());
        fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
    },
    
    error: (message, error = null) => {
        const timestamp = new Date().toISOString();
        const errorDetails = error ? ` - ${error.stack || error}` : '';
        const logMessage = `[ERROR] ${timestamp} - ${message}${errorDetails}\n`;
        console.error(logMessage.trim());
        fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
        fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
    },
    
    warn: (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[WARN] ${timestamp} - ${message}\n`;
        console.warn(logMessage.trim());
        fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
    }
};

module.exports = logger;