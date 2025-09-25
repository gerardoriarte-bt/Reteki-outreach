import React, { useState, useEffect } from 'react';
import { TargetRole, RolePrompt } from '../types';
import { getRolePrompt, saveRolePrompt } from '../services/rolePromptService';
import { XIcon } from './icons/XIcon';

interface RolePromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: TargetRole;
  onRoleChange: (role: TargetRole) => void;
}

const RolePromptEditor: React.FC<RolePromptEditorProps> = ({
  isOpen,
  onClose,
  selectedRole,
  onRoleChange
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<RolePrompt>(getRolePrompt(selectedRole));
  const [activeTab, setActiveTab] = useState<'linkedin' | 'email'>('linkedin');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setCurrentPrompt(getRolePrompt(selectedRole));
    setHasChanges(false);
  }, [selectedRole]);

  const handleSave = () => {
    saveRolePrompt(selectedRole, currentPrompt);
    setHasChanges(false);
  };

  const handlePromptChange = (field: 'linkedinPrompt' | 'emailPrompt', value: string) => {
    setCurrentPrompt(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleRoleChange = (role: TargetRole) => {
    if (hasChanges) {
      if (window.confirm('¿Deseas guardar los cambios antes de cambiar de rol?')) {
        handleSave();
      }
    }
    onRoleChange(role);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Editor de Prompts por Rol</h2>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value as TargetRole)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="director_ti">Director de TI</option>
              <option value="director_financiero">Director Financiero</option>
              <option value="gerente_compras">Gerente de Compras</option>
              <option value="ceo_gerente_general">CEO/Gerente General</option>
              <option value="otro">Otro Rol</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Role Info */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{currentPrompt.name}</h3>
          <p className="text-slate-600">{currentPrompt.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'linkedin'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📱 LinkedIn (300 caracteres)
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'email'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📧 Email (1500 caracteres)
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-700">
                Prompt para {activeTab === 'linkedin' ? 'LinkedIn' : 'Email'}
              </label>
              <div className="text-sm text-slate-500">
                {currentPrompt[activeTab === 'linkedin' ? 'linkedinPrompt' : 'emailPrompt'].length} caracteres
              </div>
            </div>
            <textarea
              value={currentPrompt[activeTab === 'linkedin' ? 'linkedinPrompt' : 'emailPrompt']}
              onChange={(e) => handlePromptChange(
                activeTab === 'linkedin' ? 'linkedinPrompt' : 'emailPrompt',
                e.target.value
              )}
              className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-none"
              placeholder="Escribe tu prompt aquí..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            {hasChanges ? 'Tienes cambios sin guardar' : 'Todo guardado'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePromptEditor;

