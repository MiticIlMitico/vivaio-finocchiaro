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
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-moss-700 text-white flex items-center justify-center shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-center font-display font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
          Area Riservata Vivaio
        </h2>
        <p className="mt-2 text-center text-xs text-stone-600">
          Accesso riservato alla gestione del catalogo e listino {AZIENDA.nome}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-sm border border-stone-200 rounded-2xl">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Indirizzo Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.it"
                  className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {errore && (
              <div className="p-3 bg-clay-50 border border-clay-200 rounded-xl text-xs text-clay-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-clay-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errore}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-moss-700 hover:bg-moss-800 text-white text-sm font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:ring-offset-2 touch-target"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Accesso in corso...</span>
                  </>
                ) : (
                  <>
                    <span>Entra nel Pannello</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <Link
              to="/"
              className="text-xs font-medium text-stone-500 hover:text-moss-700 transition-colors"
            >
              &larr; Torna alla vetrina pubblica
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
