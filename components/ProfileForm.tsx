
import React from 'react';
import { ProfileData, MessageType, TargetRole } from '../types';

interface ProfileFormProps {
  data: ProfileData;
  onUpdate: <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  messageType: MessageType;
  selectedRole: TargetRole;
}

// InputField is defined outside the main component to prevent re-creation on re-renders
const InputField: React.FC<{
  id: keyof ProfileData;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: 'input' | 'textarea';
}> = ({ id, label, value, placeholder, onChange, type = 'input' }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    {type === 'input' ? (
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 hover:border-slate-400"
      />
    ) : (
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 hover:border-slate-400 resize-none"
      />
    )}
  </div>
);


const ProfileForm: React.FC<ProfileFormProps> = ({ data, onUpdate, onSubmit, isLoading, messageType, selectedRole }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Role and Message Type Indicator */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👤</span>
            <div>
              <div className="font-semibold text-slate-900 text-lg">
                Rol: {selectedRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{messageType === 'linkedin' ? '📱' : '📧'}</span>
            <div>
              <div className="font-semibold text-slate-900 text-lg">
                {messageType === 'linkedin' ? 'Mensaje de LinkedIn' : 'Email'}
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {messageType === 'linkedin' ? 'Máximo 300 caracteres' : 'Máximo 1500 caracteres'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputField id="name" label="Nombre del Perfil" value={data.name} onChange={(val) => onUpdate('name', val)} placeholder="Ej: Ana García" />
        <InputField id="jobTitle" label="Título del Puesto" value={data.jobTitle} onChange={(val) => onUpdate('jobTitle', val)} placeholder="Ej: Gerente de Operaciones" />
        <InputField id="companyName" label="Nombre de la Empresa" value={data.companyName} onChange={(val) => onUpdate('companyName', val)} placeholder="Ej: Acme Corp" />
        <InputField id="industry" label="Industria" value={data.industry} onChange={(val) => onUpdate('industry', val)} placeholder="Ej: Tecnología" />
      </div>
      <InputField 
        id="activityOrAchievement" 
        label="Actividad Reciente o Logro de la Empresa" 
        value={data.activityOrAchievement} 
        onChange={(val) => onUpdate('activityOrAchievement', val)}
        placeholder="Ej: Publicó sobre gestión remota, cerró ronda de inversión..."
        type="textarea"
      />
      <InputField 
        id="mutualConnection" 
        label="Conexión en Común" 
        value={data.mutualConnection} 
        onChange={(val) => onUpdate('mutualConnection', val)}
        placeholder="Ej: Juan Pérez"
      />
      <InputField 
        id="additionalContext" 
        label="Contexto Adicional (opcional)" 
        value={data.additionalContext || ''} 
        onChange={(val) => onUpdate('additionalContext', val)}
        placeholder="Información adicional, enlaces, noticias recientes..."
        type="textarea"
      />
      
      {/* Word Count Input */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <label htmlFor="wordCount" className="block text-sm font-semibold text-blue-800 mb-3">
          📏 Cantidad de Palabras del Mensaje
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            id="wordCount"
            name="wordCount"
            value={data.wordCount || ''}
            onChange={(e) => onUpdate('wordCount', parseInt(e.target.value) || undefined)}
            placeholder="Ej: 50"
            min="10"
            max="500"
            className="flex-1 px-4 py-3 bg-white border border-blue-300 rounded-xl shadow-sm placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-150 hover:border-blue-400"
          />
          <span className="text-base text-blue-700 font-semibold">
            palabras
          </span>
        </div>
        <p className="text-sm text-blue-700 mt-3 font-medium">
          {messageType === 'linkedin' 
            ? 'Recomendado: 20-50 palabras para LinkedIn' 
            : 'Recomendado: 50-200 palabras para Email'
          }
        </p>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-indigo-300 disabled:to-blue-300 disabled:cursor-not-allowed transition duration-150 transform hover:scale-105 disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando...
          </>
        ) : (
          <>
            <span className="mr-2">✨</span>
            Generar {messageType === 'linkedin' ? 'Mensaje de LinkedIn' : 'Email'}
          </>
        )}
      </button>
    </form>
  );
};

export default ProfileForm;
