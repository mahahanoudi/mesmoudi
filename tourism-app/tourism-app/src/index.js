// src/index.js - VERSION FINALE CORRIGÉE
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { frFR } from '@clerk/localizations';

// ⚠️ IMPORTANT: La clé doit être exactement celle-ci
const PUBLISHABLE_KEY = "pk_test_c3BsZW5kaWQtYW50LTMxLmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Missing Clerk Publishable Key");
}

console.log("✅ Clerk Publishable Key détectée:", PUBLISHABLE_KEY.substring(0, 20) + "...");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      localization={frFR}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);