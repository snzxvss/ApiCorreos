// src/App.js
import React from 'react';
import './css/App.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import EmailForm from './EmailForm';

function App() {
  return (
    <div className="App">
      <EmailForm />
    </div>
  );
}

export default App;