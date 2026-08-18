import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { triggerAiChat } from '../../services/messageService';
import { Send, Bot, Sparkles, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';

const AITutor = () => {
  const { user } = useAuth();
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm your AI tutor powered by Gemini. Ask me anything about your courses, concepts, or learning goals!" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef();

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const sendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    try {
      const messagesPayload = [...aiMessages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const data = await triggerAiChat(messagesPayload);
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ AI service unavailable. Please configure your API key in backend/.env'
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-card2)' }}>
        
        {/* Modern Header Banner */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 70%, var(--secondary) 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            position: 'absolute',
            right: 40,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.15,
            pointerEvents: 'none'
          }}>
            <BrainCircuit size={84} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Sparkles size={18} color="#fcd34d" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fcd34d' }}>Interactive Assistant</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, fontFamily: 'Syne, sans-serif' }}>AI Study Tutor</h1>
            <p style={{ margin: '6px 0 0 0', fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
              Deepen your learning. Ask questions, clarify topics, and practice with step-by-step guidance.
            </p>
          </div>
        </div>

        {/* Chat History Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {aiMessages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                <div className="avatar" style={{
                  width: 38,
                  height: 38,
                  fontSize: 13,
                  background: isUser ? 'var(--primary)' : 'var(--secondary)',
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.04)'
                }}>
                  {isUser ? initials(user.name) : <Bot size={18} color="white" />}
                </div>
                <div style={{
                  background: isUser ? 'var(--primary)' : 'white',
                  border: isUser ? 'none' : '1px solid var(--border)',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  padding: '14px 18px',
                  maxWidth: '70%',
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: isUser ? 'white' : 'var(--text)',
                  whiteSpace: 'pre-wrap',
                  boxShadow: isUser ? 'none' : '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          
          {aiLoading && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="avatar" style={{ width: 38, height: 38, background: 'var(--secondary)' }}>
                <Bot size={18} color="white" />
              </div>
              <div style={{
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '4px 16px 16px 16px',
                padding: '14px 18px',
                fontSize: 13.5,
                color: 'var(--text-muted)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={aiEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', background: 'white' }}>
          <div style={{
            display: 'flex',
            gap: 10,
            background: 'var(--bg-card2)',
            padding: '6px 10px',
            borderRadius: 14,
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
          }}>
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendAiMessage(e);
                }
              }}
              placeholder="Ask your AI tutor anything..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                boxShadow: 'none',
                padding: '10px 12px',
                fontSize: 13.5,
                outline: 'none'
              }}
            />
            <button
              onClick={sendAiMessage}
              className="btn btn-primary"
              style={{
                borderRadius: 11,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              disabled={aiLoading || !aiInput.trim()}
            >
              <Send size={14} /> Send
            </button>
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
            Powered by Gemini. Responses are AI-generated.
          </div>
        </div>

      </main>
    </div>
  );
};

export default AITutor;
