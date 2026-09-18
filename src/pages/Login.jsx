import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ArrowRight, Loader2, Sprout, AlertCircle } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const destinazione = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrore(null);

    const emailPulita = email.trim().toLowerCase();
    if (!emailPulita || !password) {
      setErrore('Inserisci sia l\'email che la password.');
      return;
    }

    setLoading(true);

    try {
      // Autenticazione sicura tramite Supabase Auth (chiamata parametrizzata su endpoint OAuth/Auth)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailPulita,
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrore('Email o password non corretti. Verifica e riprova.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrore('Account in attesa di conferma.');
        } else {
          setErrore('Impossibile accedere. Riprova tra qualche istante.');
        }
        return;
      }

      if (data?.session) {
        navigate(destinazione, { replace: true });
      }
    } catch (err) {
      console.error('Errore durante il login:', err);
      setErrore('Si è verificato un errore di connessione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-[#1C201C]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link to="/" className="flex flex-col items-center justify-center gap-2 mb-6 group">
          <img
            src="/brand/logo-mark.svg"
            alt="Logo Campo dei Fiori"
            decoding="async"
            className="w-16 h-16 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
          />
          <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C201C] tracking-tight">
            Campo dei Fiori
          </span>
        </Link>
        <h2 className="text-center font-serif font-semibold text-xl sm:text-2xl text-[#1C201C] tracking-tight">
          Gestione Vivaio & Magazzino
        </h2>
        <p className="mt-2 text-center text-xs text-[#1C201C]/70">
          Accesso riservato all'amministrazione del catalogo e listino all'ingrosso
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-xs border border-[#1C201C]/10 rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Indirizzo Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1C201C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.it"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1C201C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white transition-all"
                />
              </div>
            </div>

            {errore && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errore}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#25570A] hover:bg-[#1E4608] text-white text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:ring-offset-2 touch-target active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Accesso in corso...</span>
                  </>
                ) : (
                  <>
                    <span>Accedi al Gestionale</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-[#1C201C]/60 hover:text-[#25570A] transition-colors inline-flex items-center gap-1"
          >
            Torna alla pagina principale del vivaio
          </Link>
        </div>
      </div>
    </div>
  );
}
