import React, { useState, useCallback } from 'react';
import { ProfileData, MessageType, TargetRole } from './types';
import { generateLinkedInMessage, extractProfileDataFromText, DEFAULT_GENERATION_PROMPT, getPromptForMessageType } from './services/geminiService';
import { getRolePrompt } from './services/rolePromptService';
import ProfileForm from './components/ProfileForm';
import GeneratedMessage from './components/GeneratedMessage';
import { SparklesIcon } from './components/icons/SparklesIcon';
import PasteProfile from './components/PasteProfile';
import { CogIcon } from './components/icons/CogIcon';
import SettingsModal from './components/SettingsModal';
import SentMessagesView from './components/SentMessagesView';
import RolePromptEditor from './components/RolePromptEditor';

type View = 'selector' | 'paste_single' | 'form_single' | 'sent_messages';

const App: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    jobTitle: '',
    companyName: '',
    industry: '',
    activityOrAchievement: '',
    mutualConnection: '',
    additionalContext: '',
    urls: [],
    wordCount: undefined,
  });

  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [view, setView] = useState<View>('selector');
  const [rawProfileText, setRawProfileText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Used for extraction
  const [processingError, setProcessingError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState<string>(DEFAULT_GENERATION_PROMPT);
  const [messageType, setMessageType] = useState<MessageType>('linkedin');
  const [selectedRole, setSelectedRole] = useState<TargetRole>('director_ti');
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);


  const handleDataChange = useCallback(<K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMessageChange = useCallback((newMessage: string) => {
    setGeneratedMessage(newMessage);
  }, []);

  const handleExtractSingle = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawProfileText.trim()) return;
    
    setIsProcessing(true);
    setProcessingError('');
    try {
      const extractedData = await extractProfileDataFromText(rawProfileText);
      setProfileData(extractedData);
      setView('form_single');
    } catch (err) {
      console.error(err);
      setProcessingError('No se pudieron extraer los datos. Asegúrate de haber copiado el contenido principal del perfil y vuelve a intentarlo.');
    } finally {
      setIsProcessing(false);
    }
  }, [rawProfileText]);

  const handleGenerateSingle = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedMessage('');
    setError('');

    try {
      const rolePrompt = getRolePrompt(selectedRole);
      const currentPrompt = messageType === 'linkedin' ? rolePrompt.linkedinPrompt : rolePrompt.emailPrompt;
      const result = await generateLinkedInMessage(profileData, currentPrompt, messageType);
      if (result.shouldGenerate && result.message) {
        setGeneratedMessage(result.message);
      } else {
        setError("No se pudo generar un mensaje personalizado con los datos proporcionados. Es mejor no enviar nada que un mensaje genérico.");
      }
    } catch (apiError) {
      console.error(apiError);
      setError("Hubo un error al contactar al servicio de IA. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, [profileData, messageType, selectedRole]);

  
  const handleMarkAsSent = useCallback((name: string, message: string) => {
    try {
      const sentMessagesRaw = localStorage.getItem('sentLinkedInMessages');
      const sentMessages = sentMessagesRaw ? JSON.parse(sentMessagesRaw) : [];
      
      const newMessage = {
        name,
        message,
        sentAt: new Date().toISOString(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Avoid duplicates just in case of double clicks
      if (!sentMessages.some((m: any) => m.name === name && m.message === message)) {
          sentMessages.push(newMessage);
          localStorage.setItem('sentLinkedInMessages', JSON.stringify(sentMessages));
      }
    } catch (error) {
      console.error("Failed to save sent message to localStorage", error);
    }
  }, []);

  const handleReset = useCallback(() => {
    setView('selector');
    setRawProfileText('');
    setProfileData({
      name: '',
      jobTitle: '',
      companyName: '',
      industry: '',
      activityOrAchievement: '',
      mutualConnection: '',
      additionalContext: '',
      urls: [],
      wordCount: undefined,
    });
    setGeneratedMessage('');
    setError('');
    setProcessingError('');
    setSelectedRole('director_ti');
  }, []);
  
  const handleSavePrompt = (newPrompt: string) => {
      setPromptTemplate(newPrompt);
      setIsSettingsOpen(false);
  };

  const renderContent = () => {
    switch (view) {
      case 'selector':
        return (
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
                    Generador de Mensajes
                  </h1>
                  <p className="text-sm lg:text-base text-slate-500 mt-2">Powered by AntPack</p>
                </div>
              </div>
              <p className="text-slate-600 mt-4 mb-8 text-lg max-w-2xl mx-auto">
                Elige cómo quieres empezar a generar mensajes de conexión hiper-personalizados.
              </p>
            </div>
            
            {/* Configuration Cards - Side by side on laptop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">Rol del Destinatario</h3>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as TargetRole)}
                  className="w-full px-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-white transition-colors"
                >
                  <option value="director_ti">Director de TI</option>
                  <option value="director_financiero">Director Financiero</option>
                  <option value="gerente_compras">Gerente de Compras</option>
                  <option value="ceo_gerente_general">CEO/Gerente General</option>
                  <option value="otro">Otro Rol</option>
                </select>
                <button
                  onClick={() => setIsRoleEditorOpen(true)}
                  className="w-full mt-4 px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  ✏️ Editar Prompts para este Rol
                </button>
              </div>
              
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">Tipo de Mensaje</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMessageType('linkedin')}
                    className={`px-6 py-4 rounded-xl font-medium transition-all duration-200 text-center ${
                      messageType === 'linkedin'
                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-semibold">LinkedIn</div>
                    <div className="text-xs mt-1 opacity-75">Hasta 300 caracteres</div>
                  </button>
                  <button
                    onClick={() => setMessageType('email')}
                    className={`px-6 py-4 rounded-xl font-medium transition-all duration-200 text-center ${
                      messageType === 'email'
                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">📧</div>
                    <div className="font-semibold">Email</div>
                    <div className="text-xs mt-1 opacity-75">Hasta 1500 caracteres</div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                <button 
                  onClick={() => setView('paste_single')} 
                  className="px-8 py-4 font-semibold text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 text-lg"
                >
                    📋 Procesar un Perfil
                </button>
                <button 
                  onClick={() => setView('sent_messages')} 
                  className="px-8 py-4 font-semibold text-slate-700 bg-white rounded-xl shadow-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition duration-150 text-lg border border-slate-200"
                >
                    📬 Ver Mensajes Enviados
                </button>
            </div>
          </div>
        );
      
      case 'paste_single':
          return (
             <div className="w-full max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        Procesar Perfil
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Pega el contenido de un perfil de LinkedIn para autocompletar los datos automáticamente.
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 lg:p-8">
                  <PasteProfile 
                      rawText={rawProfileText}
                      onTextChange={setRawProfileText}
                      onSubmit={handleExtractSingle}
                      isLoading={isProcessing}
                      error={processingError}
                  />
                </div>
                <button 
                  onClick={handleReset} 
                  className="w-full text-center mt-6 px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  ← Volver al inicio
                </button>
            </div>
          )

      case 'form_single':
        return (
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Verificar y Generar</h1>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">Revisa los datos extraídos y ajústalos antes de generar el mensaje.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-100">
                <ProfileForm 
                  data={profileData} 
                  onUpdate={handleDataChange} 
                  onSubmit={handleGenerateSingle} 
                  isLoading={isLoading} 
                  messageType={messageType} 
                  selectedRole={selectedRole} 
                />
                <button 
                  onClick={handleReset} 
                  className="w-full text-center mt-6 px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                  🔄 Empezar de Nuevo
                </button>
              </div>
              
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-slate-100">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">Mensaje Generado</h2>
                <GeneratedMessage 
                  message={generatedMessage} 
                  isLoading={isLoading} 
                  error={error} 
                  profileName={profileData.name} 
                  onMarkAsSent={handleMarkAsSent}
                  onMessageChange={handleMessageChange}
                  messageType={messageType}
                />
              </div>
            </div>
          </div>
        );

      case 'results_multiple':
        return <ResultsView results={results} onReset={handleReset} onMarkAsSent={handleMarkAsSent} />;

      case 'sent_messages':
        return <SentMessagesView onBack={() => setView('selector')} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-800 flex items-center justify-center p-4 lg:p-8">
       <button 
          onClick={() => setIsSettingsOpen(true)}
          className="fixed top-6 right-6 z-50 p-4 bg-white rounded-xl shadow-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 border border-slate-200 hover:border-indigo-300 hover:shadow-xl"
          aria-label="Abrir configuración de prompt"
        >
          <CogIcon className="w-6 h-6" />
       </button>
      
      <main className="w-full">
        {renderContent()}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentPrompt={promptTemplate}
        onSave={handleSavePrompt}
        onReset={() => setPromptTemplate(DEFAULT_GENERATION_PROMPT)}
      />

      <RolePromptEditor
        isOpen={isRoleEditorOpen}
        onClose={() => setIsRoleEditorOpen(false)}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />
    </div>
  );
};

export default App;