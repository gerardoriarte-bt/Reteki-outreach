import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (newPrompt: string) => void;
  onReset: () => void;
}

const availablePlaceholders = [
    { variable: '{{name}}', description: 'Nombre completo del perfil.' },
    { variable: '{{jobTitle}}', description: 'Título del puesto actual.' },
    { variable: '{{companyName}}', description: 'Nombre de la empresa actual.' },
    { variable: '{{industry}}', description: 'Industria del perfil o la empresa.' },
    { variable: '{{activityOrAchievement}}', description: 'Resumen de actividad reciente o logro.' },
    { variable: '{{mutualConnection}}', description: 'Nombre de la conexión en común.' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentPrompt, onSave, onReset }) => {
  const [editedPrompt, setEditedPrompt] = useState(currentPrompt);

  useEffect(() => {
    setEditedPrompt(currentPrompt);
  }, [currentPrompt, isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleReset = () => {
      onReset();
  }

  const handleSave = () => {
    onSave(editedPrompt);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 id="settings-modal-title" className="text-xl font-bold text-slate-800">
            Configuración de Prompt
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"
            aria-label="Cerrar modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          <div className="flex flex-col">
              <label htmlFor="prompt-textarea" className="block text-sm font-medium text-slate-700 mb-2">
                Plantilla del Prompt de Generación
              </label>
              <textarea
                id="prompt-textarea"
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full h-full flex-grow px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 font-mono text-xs"
                rows={20}
              />
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Variables Disponibles</h3>
                <p className="text-sm text-slate-600 mb-4">
                    Usa estas variables en tu plantilla. Serán reemplazadas con la información del perfil.
                </p>
                <div className="space-y-3">
                    {availablePlaceholders.map(p => (
                        <div key={p.variable}>
                            <code className="text-sm font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">{p.variable}</code>
                            <p className="text-xs text-slate-500 mt-1 ml-1">{p.description}</p>
                        </div>
                    ))}
                </div>
          </div>
        </main>

        <footer className="flex justify-end items-center gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Restaurar por Defecto
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Guardar Cambios
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;