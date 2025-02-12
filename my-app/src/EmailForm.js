import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import Swal from 'sweetalert2';
import { sendEmail } from './services/emailService';
import { authenticateUser } from './services/authService';
import './css/EmailForm.css';

function EmailForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(true);
  const [authError, setAuthError] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const handleAuthenticate = async () => {
    try {
      const response = await authenticateUser({ authCode });
      setIsAuthenticated(true);
      setAttemptsLeft(response.attemptsLeft);
      setAuthModalVisible(false);
    } catch (error) {
      setIsAuthenticated(false);
      setAuthModalVisible(true);
      setAuthError('Código de autenticación incorrecto.');
    }
  };

  const handleSubmit = async () => {
    if (!from || !to || !subject || !message) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios.',
      });
      return;
    }

    if (!validateEmail(from) || !validateEmail(to)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa correos electrónicos válidos.',
      });
      return;
    }

    const emailData = { from, to, subject, message };
      try {
        await sendEmail(emailData);
        setAttemptsLeft(attemptsLeft - 1);
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'El correo se ha enviado exitosamente.',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al enviar el correo.',
        });
      }
  };

  const handleAddEmail = () => {
    if (validateEmail(to)) {
      setAdditionalEmails([...additionalEmails, to]);
      setTo('');
    }
    setEmailModalVisible(true);
  };

  return (
    <div className="email-form-container">

  <Dialog
    header={<div style={{ textAlign: 'center', width: '100%' }}>Autenticación</div>}
    visible={authModalVisible}
    modal
    closable={false}
    className="auth-dialog"
  >
    <div className="auth-section">
      <InputText
        id="authCode"
        type="text"
        value={authCode}
        onChange={(e) => setAuthCode(e.target.value)}
        placeholder="Código de Autenticación"
      />
      {authError && <p style={{ color: 'red' }}>{authError}</p>}
      <Button
        label="Autenticar"
        icon="pi pi-check"
        onClick={handleAuthenticate}
        className="p-mt-3"
      />
    </div>
  </Dialog>

  <Dialog
    header="Agregar Correos"
    visible={emailModalVisible}
    modal
    onHide={() => setEmailModalVisible(false)}
    className="email-dialog"
  >
    <div className="p-field">
      <label htmlFor="additionalEmail">Correo Adicional</label>
      <div className="p-inputgroup">
        <InputText
          id="additionalEmail"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Correo Adicional"
        />
        <Button
          icon="pi pi-plus"
          onClick={handleAddEmail}
        />
      </div>
    </div>
    <table className="email-table">
      <thead>
        <tr>
          <th>Correo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {additionalEmails.map((email, index) => (
          <tr key={index}>
            <td>{email}</td>
            <td>
              <Button
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => setAdditionalEmails(additionalEmails.filter(e => e !== email))}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Dialog>

      {isAuthenticated && (
        <div className="email-form">
          <Panel header="PANEL MAIL">
          <div className="p-field">
              <label>Intentos restantes: {attemptsLeft}</label>
            </div>
            <div className="p-field">
              <label htmlFor="from">Correo Remitente</label>
              <InputText
                id="from"
                type="email"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Correo Remitente"
              />
            </div>
            <div className="p-field">
              <label htmlFor="to">Correo Destino</label>
              <div className="p-inputgroup">
                <InputText
                  id="to"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Correo Destino"
                />
                <Button
                  icon="pi pi-user-plus"
                  onClick={handleAddEmail}
                />
              </div>
            </div>
            <div className="p-field">
              <label htmlFor="subject">Asunto</label>
              <InputText
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto"
              />
            </div>
            <div className="p-field p-grid p-justify-center">
              <div className="p-col-12 p-md-10">
                <label htmlFor="message">Mensaje</label>
                <textarea
                  id="message"
                  style={{ width: '100%', height: '320px' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>
            </div>
            <Button
              label="Enviar"
              icon="pi pi-send"
              onClick={handleSubmit}
            />
          </Panel>
          {/* <div className="attempts-panel">
            <Panel header="Intentos Restantes">
              <p>{attemptsLeft}</p>
            </Panel>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default EmailForm;