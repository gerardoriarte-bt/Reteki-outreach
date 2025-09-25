import React from 'react';

interface PasteProfileProps {
    rawText: string;
    onTextChange: (text: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error: string;
}

const PasteProfile: React.FC<PasteProfileProps> = ({ rawText, onTextChange, onSubmit, isLoading, error }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">
                    💡 <strong>Instrucciones:</strong> Ve al perfil de LinkedIn, selecciona todo (Ctrl+A o Cmd+A), copia (Ctrl+C o Cmd+C) y pégalo abajo.
                </p>
            </div>
            <div>
                <label htmlFor="profileText" className="block text-sm font-semibold text-slate-700 mb-3">
                    Contenido del Perfil de LinkedIn
                </label>
                <textarea
                    id="profileText"
                    name="profileText"
                    rows={12}
                    className="block w-full px-4 py-4 bg-white border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition duration-150 hover:border-slate-400 resize-none"
                    placeholder="Pega el texto aquí..."
                    value={rawText}
                    onChange={(e) => onTextChange(e.target.value)}
                    aria-label="Contenido del Perfil de LinkedIn"
                />
            </div>
            {error && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
            )}
            <button
                type="submit"
                disabled={isLoading || !rawText.trim()}
                className="w-full inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-indigo-300 disabled:to-blue-300 disabled:cursor-not-allowed transition duration-150 transform hover:scale-105 disabled:transform-none"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Extrayendo Datos...
                    </>
                ) : (
                    <>
                        <span className="mr-2">🔍</span>
                        Extraer y Rellenar Formulario
                    </>
                )}
            </button>
        </form>
    );
};

export default PasteProfile;
