
import React, { useState } from 'react';
import { PatientList } from './app/patients/page';
import { CreatePatient } from './app/patients/nouveau/page';
import { PatientDetails } from './app/patients/[id]/page';

// Simplified Router for the Demo/Functional Prototype
export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/patients');

  React.useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  // Basic Routing Logic
  const renderView = () => {
    if (currentPath === '#/patients' || currentPath === '') return <PatientList onNavigate={navigate} />;
    if (currentPath === '#/patients/nouveau') return <CreatePatient onNavigate={navigate} />;
    if (currentPath.startsWith('#/patients/') && currentPath.endsWith('/modifier')) {
      return <div>Modifier Patient (ID: {currentPath.split('/')[2]})</div>;
    }
    if (currentPath.startsWith('#/patients/')) {
      const id = currentPath.split('/')[2];
      return <PatientDetails id={id} onNavigate={navigate} />;
    }
    return <PatientList onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('#/patients')}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">O</div>
            <h1 className="text-xl font-bold text-slate-800">OncoManager <span className="text-blue-600">Maroc</span></h1>
          </div>
          <nav className="flex gap-4">
            <button onClick={() => navigate('#/patients')} className="px-3 py-2 text-sm font-medium hover:bg-slate-100 rounded-md">Patients</button>
            <button className="px-3 py-2 text-sm font-medium hover:bg-slate-100 rounded-md">Consultations</button>
            <button className="px-3 py-2 text-sm font-medium hover:bg-slate-100 rounded-md">Agenda</button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}
