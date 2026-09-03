import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLista from './pages/AdminLista';
import AdminForm from './pages/AdminForm';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-stone-50 text-stone-900">
        <Navbar />
        <div className="flex-1">
          <Routes>
            {/* Vetrina Pubblica */}
            <Route path="/" element={<Home />} />

            {/* Login Gestione */}
            <Route path="/login" element={<Login />} />

            {/* Area Riservata Admin (Protetta da sessione Supabase) */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLista />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/nuova"
              element={
                <RequireAuth>
                  <AdminForm />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/:id"
              element={
                <RequireAuth>
                  <AdminForm />
                </RequireAuth>
              }
            />

            {/* Fallback per rotte inesistenti */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
