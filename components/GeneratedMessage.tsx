
import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { MessageType } from '../types';

interface GeneratedMessageProps {
  message: string;
  isLoading: boolean;
  error: string;
  profileName: string;
  onMarkAsSent: (name: string, message: string) => void;
  onMessageChange: (message: string) => void;
  messageType: MessageType;
}

const GeneratedMessage: React.FC<GeneratedMessageProps> = ({ message, isLoading, error, profileName, onMarkAsSent, onMessageChange, messageType }) => {
    const [copied, setCopied] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);
    
    useEffect(() => {
        setIsSent(false);
        setEditedMessage(message);
        setIsEditing(false);
    }, [message]);

    const handleCopy = () => {
        if (currentMessage) {
            navigator.clipboard.writeText(currentMessage);
            setCopied(true);
        }
    };
    
    const handleMarkAsSent = () => {
        const messageToSave = isEditing ? editedMessage : message;
        if (messageToSave && profileName) {
            onMarkAsSent(profileName, messageToSave);
            setIsSent(true);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        onMessageChange(editedMessage);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedMessage(message);
        setIsEditing(false);
    };

    const currentMessage = isEditing ? editedMessage : message;
    const charCount = currentMessage.length;
    const charLimit = messageType === 'linkedin' ? 300 : 1500;
    const countColor = charCount > charLimit ? 'text-red-500' : 'text-slate-400';
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500">Analizando perfil y generando {messageType === 'linkedin' ? 'mensaje de LinkedIn' : 'email'}...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-full p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            );
        }

        if (message) {
            return (
                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <button 
                                    onClick={handleEdit}
                                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                >
                                    ✏️ Editar
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSave}
                                        className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                    >
                                        💾 Guardar
                                    </button>
                                    <button 
                                        onClick={handleCancel}
                                        className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        ❌ Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            aria-label="Copiar mensaje"
                        >
                            <ClipboardIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {isEditing ? (
                        <textarea
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            className="w-full p-4 bg-white border border-slate-300 rounded-md font-mono text-sm leading-relaxed text-slate-700 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows={8}
                            placeholder="Edita el mensaje aquí..."
                        />
                    ) : (
                        <p className="p-4 bg-slate-100 rounded-md whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
                            {currentMessage}
                        </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 text-xs">
                        <div>
                            {copied ? (
                                <span className="text-green-600 font-semibold">¡Copiado!</span>
                            ) : (
                                <span className={countColor}>{charCount} / {charLimit} caracteres</span>
                            )}
                        </div>
                        <button
                            onClick={handleMarkAsSent}
                            disabled={isSent}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-green-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSent ? (
                                <>
                                    <CheckIcon className="w-4 h-4 mr-1.5" />
                                    Enviado
                                </>
                            ) : (
                                'Marcar como Enviado'
                            )}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center text-center h-full p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                 <p className="text-slate-500">El mensaje generado aparecerá aquí.</p>
            </div>
        );
    };

    return <div className="flex-grow flex flex-col">{renderContent()}</div>;
};

export default GeneratedMessage;