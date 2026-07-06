import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Send, Bot, MessageSquare, User, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:8001');

const Chat = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ai');
  // AI Chat
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm your AI tutor powered by GPT. Ask me anything about your courses, concepts, or learning goals!" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  // Messaging
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const aiEndRef = useRef();
  const msgEndRef = useRef();

  useEffect(() => {
    socket.emit('join', user._id);
    socket.on('newMessage', (msg) => {
      if (selectedUser && msg.sender._id === selectedUser._id) {
        setMessages(prev => [...prev, msg]);
      }
      loadConversations();
    });
    loadConversations();
    loadUsers();
    return () => socket.off('newMessage');
  }, [user._id, selectedUser]);

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages]);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try { const res = await axios.get('/api/messages/conversations'); setConversations(res.data); }
    catch {}
  };

  const loadUsers = async () => {
    try { const res = await axios.get('/api/messages/users'); setUsers(res.data); }
    catch {}
  };

  const selectUser = async (u) => {
    setSelectedUser(u);
    try { const res = await axios.get(`/api/messages/${u._id}`); setMessages(res.data); }
    catch {}
  };

  const sendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await axios.post('/api/ai/chat', {
        messages: [...aiMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
      });
      setAiMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: '⚠️ AI service unavailable. Please configure your OpenAI API key in backend/.env' }]);
    } finally { setAiLoading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedUser) return;
    const content = msgInput;
    setMsgInput('');
    const convId = [user._id, selectedUser._id].sort().join('_');
    socket.emit('sendMessage', { senderId: user._id, receiverId: selectedUser._id, content, conversationId: convId });
  };

  socket.on('messageSent', (msg) => {
    setMessages(prev => [...prev, msg]);
    loadConversations();
  });

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Chat & AI Tutor</h1>
          <div className="tabs" style={{ marginTop: 12, marginBottom: 0, maxWidth: 300 }}>
            <button className={`tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
              <Sparkles size={14} /> AI Tutor
            </button>
            <button className={`tab ${activeTab === 'msg' ? 'active' : ''}`} onClick={() => setActiveTab('msg')}>
              <MessageSquare size={14} /> Messages
            </button>
          </div>
        </div>

        {/* AI Tutor Tab */}
        {activeTab === 'ai' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {aiMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: msg.role === 'user' ? 'var(--primary)' : 'var(--secondary)', flexShrink: 0 }}>
                    {msg.role === 'user' ? initials(user.name) : <Bot size={18} color="white" />}
                  </div>
                  <div style={{
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '12px 16px', maxWidth: '75%', fontSize: 14, lineHeight: 1.7,
                    color: msg.role === 'user' ? 'white' : 'var(--text)', whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar" style={{ width: 36, height: 36, background: 'var(--secondary)' }}><Bot size={18} color="white" /></div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', fontSize: 14, color: 'var(--text-muted)' }}>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={aiEndRef} />
            </div>
            <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card2)', padding: '8px', borderRadius: 14, border: '1px solid var(--border)' }}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(e); } }}
                  placeholder="Ask your AI tutor anything..." style={{ flex: 1, background: 'none', border: 'none', boxShadow: 'none', padding: '8px 12px', fontSize: 14 }} />
                <button onClick={sendAiMessage} className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 14px' }} disabled={aiLoading || !aiInput.trim()}>
                  <Send size={16} />
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>Powered by OpenAI GPT. Responses are AI-generated.</div>
            </div>
          </div>
        )}

        {/* Messaging Tab */}
        {activeTab === 'msg' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* User List */}
            <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: '16px' }}>
                <div className="search-bar">
                  <Search size={14} />
                  <input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ fontSize: 13 }} />
                </div>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {filteredUsers.map(u => {
                  const conv = conversations.find(c => c.conversationId === [user._id, u._id].sort().join('_'));
                  return (
                    <div key={u._id} onClick={() => selectUser(u)} style={{
                      padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      background: selectedUser?._id === u._id ? 'rgba(79,70,229,0.15)' : 'transparent',
                      borderLeft: selectedUser?._id === u._id ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s'
                    }}>
                      <div className="avatar" style={{ width: 40, height: 40, fontSize: 15, background: 'var(--primary)', flexShrink: 0 }}>{initials(u.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{u.role}</div>
                        {conv?.lastMessage && <div style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{conv.lastMessage.content}</div>}
                      </div>
                      {conv?.unread > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{conv.unread}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message Area */}
            {selectedUser ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)' }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--primary)' }}>{initials(selectedUser.name)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selectedUser.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{selectedUser.role}</div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender._id === user._id || msg.sender === user._id;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          background: isMe ? 'var(--primary)' : 'var(--bg-card)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          padding: '10px 14px', maxWidth: '65%', fontSize: 14, color: isMe ? 'white' : 'var(--text)',
                        }}>
                          {msg.content}
                          <div style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)', marginTop: 4, textAlign: 'right' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card2)', padding: '6px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                      placeholder={`Message ${selectedUser.name}...`} style={{ flex: 1, background: 'none', border: 'none', boxShadow: 'none', padding: '8px 12px', fontSize: 14 }} />
                    <button onClick={sendMessage} className="btn btn-primary" style={{ borderRadius: 9, padding: '8px 12px' }} disabled={!msgInput.trim()}>
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
                <MessageSquare size={60} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Select a user to start messaging</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
