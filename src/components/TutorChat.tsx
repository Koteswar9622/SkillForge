import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { MessageSquare, Upload, Sparkles, Send, FileText, CheckCircle, HelpCircle, Loader2, RefreshCw, Trash2, Globe, FileUp } from 'lucide-react';
import { Message, DocumentRecord } from '../types';

interface TutorChatProps {
  token: string;
  initialTopic?: string;
  onClearTopic?: () => void;
}

export default function TutorChat({ token, initialTopic, onClearTopic }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Message History
  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chat', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load document records:', err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    fetchDocuments();
  }, [token]);

  // Handle Initial Topic from Roadmap click
  useEffect(() => {
    if (initialTopic) {
      setInput(`Hi Tutor! Explain the concept of "${initialTopic}" to me in detail, give some real-world application examples, and tell me what the industry expects.`);
      if (onClearTopic) onClearTopic();
    }
  }, [initialTopic]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tutor failed to respond.');
      }

      const modelMsg: Message = {
        role: 'model',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        role: 'model',
        content: `⚠️ Error processing response: ${error.message || 'Please verify server keys or try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Upload Document
  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload evaluation failed.');
      }

      fetchDocuments();
      
      // Inject alert inside chat that document is catalogued
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `📥 **System Notice**: Catalogued "${file.name}" into our Vector Knowledge Base. Its ${data.document?.chunkCount || 1} chunks are indexed and will ground your future questions.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const templates = [
    'Explain the event loop in Javascript simply.',
    'What is RAG and how do vector embeddings work?',
    'Give me a clean typescript template for an Express router.',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-auto lg:h-[calc(100vh-160px)] flex flex-col justify-between">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/60 to-indigo-950/20 border border-slate-800 flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-400 animate-pulse" /> AI Tutor Chat
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ground discussions in your own uploaded documentation using the **TutorAgent** + Cosine Vector similarity.
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-teal-400 flex items-center gap-1.5 self-start md:self-auto">
          <Globe className="h-3.5 w-3.5" /> TutorAgent + RAG Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Left Side: Chat Console */}
        <div className="lg:col-span-8 flex flex-col justify-between glass-card rounded-2xl border border-slate-800 overflow-hidden h-[500px] lg:h-full">
          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-5 py-12">
                <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <MessageSquare className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-base">Chat with Tutor Agent</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-light">
                    Ask coding questions, request templates, or explore concepts. If you upload materials on the right, the Tutor references them instantly!
                  </p>
                </div>
                <div className="w-full space-y-2">
                  {templates.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(undefined, tpl)}
                      className="w-full text-left p-3 rounded-xl border border-slate-900 hover:border-indigo-500/20 bg-slate-950/40 text-xs text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                    >
                      💡 "{tpl}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/15'
                          : 'bg-slate-900/60 border border-slate-900 text-slate-200 rounded-tl-none font-sans prose prose-invert'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="markdown-body">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900/40 border border-slate-900 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      <span>Tutor is formulating explanation using Vector RAG...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950/40 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatLoading ? "Tutor is drafting response..." : "Ask the tutor anything..."}
              className="flex-grow glass-input px-4 py-2.5 rounded-xl text-xs"
              disabled={chatLoading}
              required
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Side: RAG Knowledge Base */}
        <div className="lg:col-span-4 flex flex-col justify-between glass-card rounded-2xl border border-slate-800 p-5 overflow-y-auto lg:overflow-hidden h-auto lg:h-full space-y-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-900">
              <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" /> Knowledge Base RAG
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Upload course lecture slides, text guidelines, or cheat sheets (PDF & TXT).
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.txt"
                className="hidden"
              />
              <FileUp className="h-7 w-7 text-indigo-400 mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-slate-300 font-medium">
                {uploading ? 'Parsing Embeddings...' : 'Drag & drop file or click to choose'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">PDF, TXT accepted (Max 10MB)</p>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-300 font-medium leading-normal bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                ⚠️ {uploadError}
              </p>
            )}

            {/* Document Records List */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Uploaded Sources ({documents.length})</p>
              {documents.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2 text-center">No reference source uploaded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-900 flex justify-between items-center text-left">
                      <div className="min-w-0 flex-grow pr-2">
                        <p className="text-xs text-slate-200 truncate font-medium">{doc.fileName}</p>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                          {doc.chunkCount} Chunks Index • {Math.round(doc.size / 1024)} KB
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
            <h4 className="text-[11px] font-mono text-indigo-400 font-semibold mb-1 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" /> RAG Diagnostic Context
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-light">
              When queries reach the server, the Cosine Vector matching engine scans document chunks for maximum context overlap, merging matched sources into your prompt prior to sending them to Gemini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
