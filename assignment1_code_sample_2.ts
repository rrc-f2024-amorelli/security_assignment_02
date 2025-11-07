import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as https from 'https';

const dbConfig = {
    // FIX 1: A02:2021 - Cryptographic Failures
    host: process.env.DB_HOST || 'mydatabase.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '', // Load from environment
    database: process.env.DB_NAME || 'mydb'
};


function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
  

function sendEmail(to: string, subject: string, body: string) {
    // FIX 2: A03:2021 - Injection
    const sanitizedBody = body.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove special characters
    const sanitizedSubject = subject.replace(/[^a-zA-Z0-9\s]/g, '');
    const sanitizedTo = to.replace(/[^a-zA-Z0-9@.\-]/g, '');
    
    exec(`echo ${sanitizedBody} | mail -s "${sanitizedSubject}" ${sanitizedTo}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error sending email: ${error}`);
        }
    });
}

function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        // FIX 3: A06:2021 - Vulnerable and Outdated Components
        https.get('https://insecure-api.com/get-data', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);
    
    // FIX 4: A03:2021 - Injection
    // Use parameterized query instead of string concat
    const query = 'INSERT INTO mytable (column1, column2) VALUES (?, ?)';

    connection.connect();
    connection.query(query, [data, 'Another Value'], (error, results) => {
        // FIX 5: A09:2021 - Security Logging and Monitoring Failures
        //logging with timestamp and details
        if (error) {
            console.error(`[${new Date().toISOString()}] ERROR: Database query failed:`, error.message);
        } else {
            console.log(`[${new Date().toISOString()}] SUCCESS: Data saved to database`);
        }
        connection.end();
    });
}

(async () => {
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
})();