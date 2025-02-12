import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import he from 'he';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const emailsFilePath = join(__dirname, 'emails.json');
const usersFilePath = join(__dirname, 'users.json');

if (!existsSync(emailsFilePath)) {
  writeFileSync(emailsFilePath, JSON.stringify([]));
}

if (!existsSync(usersFilePath)) {
  writeFileSync(usersFilePath, JSON.stringify({ users: [] }));
}

const getUsers = () => JSON.parse(readFileSync(usersFilePath)).users;
const saveUsers = (users) => writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));

app.post('/authenticate', (req, res) => {
  const { authCode } = req.body;
  const users = getUsers();
  const user = users.find(u => u.authCode === authCode);

  if (user) {
    res.json({ attemptsLeft: user.attemptsLeft });
  } else {
    res.status(401).json({ error: 'Código de autenticación incorrecto.' });
  }
});

app.post('/send-email', (req, res) => {
  console.log('Datos recibidos:', req.body);
  const { from, to, subject, message, authCode } = req.body;
  const users = getUsers();
  const user = users.find(u => u.authCode === authCode);

  if (user && user.attemptsLeft > 0) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const emailData = { from, to, subject, message, date: new Date(), ip: clientIp };
    const emails = JSON.parse(readFileSync(emailsFilePath));
    emails.push(emailData);
    writeFileSync(emailsFilePath, JSON.stringify(emails, null, 2));
    user.attemptsLeft -= 1;
    saveUsers(users);

    console.log('Directorio de trabajo actual:', process.cwd());

    // Verificar si el mensaje contiene HTML
    const isHtml = message.trim().startsWith('<!DOCTYPE html>');
    const decodedMessage = he.decode(message);
    const formattedMessage = decodedMessage.replace(/'/g, "\\'");

    const command = `/root/swaks --auth --server smtp.mailgun.org --port 587 --au send@alchoke.systems --ap sanzvoss --from ${from} --to ${to} --h-Subject: "${subject}" --h-From: "<${from}>" --body '${formattedMessage}' ${isHtml ? '--header "Content-Type: text/html"' : ''}`;
    
    console.log('Ejecutando comando:', command);

    const childProcess = spawn(command, {
      cwd: __dirname,
      shell: true
    });

    let stdoutData = '';
    let stderrData = '';

    childProcess.stdout.on('data', (data) => {
      stdoutData += data;
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
      stderrData += data;
      console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`Process exited with code ${code}`);
        console.error(`Process exited with code ${code}`);
        console.error('stderr:', stderrData);
        return res.status(500).json({ error: 'Error enviando el correo.' });
      }
      console.log('stdout:', stdoutData);
      res.json({ success: true, attemptsLeft: user.attemptsLeft });
    });

    childProcess.on('error', (error) => {
      console.log('Process error:', error);
      res.status(500).json({ error: 'Error ejecutando el comando.' });
    });
  } else {
    res.status(401).json({ error: 'Código de autenticación incorrecto o sin intentos restantes.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});