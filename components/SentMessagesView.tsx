import React, { useState, useEffect, useCallback } from 'react';
import { SentMessage } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface SentMessagesViewProps {
  onBack: () => void;
}

const SentMessagesView: React.FC<SentMessagesViewProps> = ({ onBack }) => {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SentMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sentLinkedInMessages');
      if (stored) {
        const messages = JSON.parse(stored) as SentMessage[];
        // Add unique IDs if they don't exist
        const messagesWithIds = messages.map((msg, index) => ({
          ...msg,
          id: msg.id || `msg_${index}_${Date.now()}`
        }));
        setSentMessages(messagesWithIds);
      }
    } catch (error) {
      console.error('Error loading sent messages:', error);
    }
  }, []);

  // Filter and sort messages
  useEffect(() => {
    let filtered = sentMessages.filter(msg =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMessages(filtered);
  }, [sentMessages, searchTerm, sortBy, sortOrder]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    const updatedMessages = sentMessages.filter(msg => msg.id !== messageId);
    setSentMessages(updatedMessages);
    localStorage.setItem('sentLinkedInMessages', JSON.stringify(updatedMessages));
  }, [sentMessages]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los mensajes enviados?')) {
      setSentMessages([]);
      localStorage.removeItem('sentLinkedInMessages');
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ['Nombre', 'Mensaje', 'Fecha de Envío'],
      ...filteredMessages.map(msg => [
        `"${msg.name}"`,
        `"${msg.message.replace(/"/g, '""')}"`,
        `"${new Date(msg.sentAt).toLocaleString('es-ES')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mensajes_linkedin_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredMessages]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const stats = {
    total: sentMessages.length,
    thisWeek: sentMessages.filter(msg => {
      const msgDate = new Date(msg.sentAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return msgDate >= weekAgo;
    }).length,
    thisMonth: sentMessages.filter(msg => {
      const msgDate = new Date(msg.sentAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return msgDate >= monthAgo;
    }).length
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Mensajes Enviados</h1>
        </div>
        <p className="text-slate-500">Historial y reportes de tus mensajes de LinkedIn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CheckIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Enviados</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Esta Semana</p>
              <p className="text-2xl font-bold text-slate-900">{stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Este Mes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o mensaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="date">Ordenar por fecha</option>
                <option value="name">Ordenar por nombre</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Exportar CSV
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay mensajes enviados</h3>
            <p className="text-slate-500">Los mensajes que marques como enviados aparecerán aquí.</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{message.name}</h3>
                  <p className="text-slate-600 mb-2">{message.message}</p>
                  <p className="text-sm text-slate-500">
                    Enviado el {new Date(message.sentAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(message.message)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copiar mensaje"
                  >
                    <ClipboardIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id!)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar mensaje"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition duration-150"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default SentMessagesView;
