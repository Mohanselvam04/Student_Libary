import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { fetchConversations, fetchUsers, fetchMessages } from '../../services/messageService';
import { Send, MessageSquare, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:8001');

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const msgEndRef = useRef();

  const loadConversations = async () => {
    try { 
      const data = await fetchConversations(); 
      setConversations(data || []); 
    } catch {}
  };

  const loadUsers = async () => {
    try { 
      const data = await fetchUsers(); 
      setUsers(data || []); 
    } catch {}
  };

  useEffect(() => {
    socket.emit('join', user._id);
    
    const handleNewMessage = (msg) => {
      if (selectedUser && msg.sender._id === selectedUser._id) {
        setMessages(prev => [...prev, msg]);
      }
      loadConversations();
    };

    socket.on('newMessage', handleNewMessage);
    loadConversations();
    loadUsers();
    
    return () => socket.off('newMessage');
  }, [user._id, selectedUser]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectUser = async (u) => {
    setSelectedUser(u);
    try { 
      const data = await fetchMessages(u._id); 
      setMessages(data || []); 
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !selectedUser) return;
    const content = msgInput;
    setMsgInput('');
    const convId = [user._id, selectedUser._id].sort().join('_');
    socket.emit('sendMessage', { senderId: user._id, receiverId: selectedUser._id, content, conversationId: convId });
  };

  useEffect(() => {
    const handleMessageSent = (msg) => {
      setMessages(prev => [...prev, msg]);
      loadConversations();
    };
    const handleSocketError = (errorMsg) => {
      toast.error(errorMsg || 'Failed to send message');
    };
    socket.on('messageSent', handleMessageSent);
    socket.on('error', handleSocketError);
    return () => {
      socket.off('messageSent');
      socket.off('error');
    };
  }, []);

  // When search is empty, show active conversations. Otherwise, show filtered list from database users
  const displayList = userSearch.trim() === ''
    ? conversations.map(c => c.otherUser).filter(Boolean)
    : users.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
      );

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Messaging</h1>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* User List */}
          <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '16px' }}>
              <div className="search-bar">
                <Search size={14} />
                <input 
                  placeholder="Search name or email..." 
                  value={userSearch} 
                  onChange={e => setUserSearch(e.target.value)} 
                  style={{ fontSize: 13 }} 
                />
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* AI Tutor Chat Link */}
              <div 
                onClick={() => navigate('/ai-tutor')} 
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderBottom: '1px solid var(--border)',
                  background: 'rgba(252, 211, 77, 0.05)',
                  transition: 'all 0.15s'
                }}
              >
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--secondary)', flexShrink: 0 }}>
                  <Sparkles size={16} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                    AI Tutor Assistant
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ask questions & get help</div>
                </div>
              </div>

              {displayList.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5, lineHeight: 1.5 }}>
                  {userSearch.trim() === '' 
                    ? 'No active chats. Search for a user by name or email to start a conversation.' 
                    : 'No matching users found.'}
                </div>
              ) : (
                displayList.map(u => {
                  const conv = conversations.find(c => c.conversationId === [user._id, u._id].sort().join('_'));
                  const isSel = selectedUser?._id === u._id;
                  return (
                    <div key={u._id} onClick={() => selectUser(u)} style={{
                      padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      background: isSel ? 'rgba(46,125,50,0.06)' : 'transparent',
                      borderLeft: isSel ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s'
                    }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--primary)', flexShrink: 0 }}>{initials(u.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{u.role}</div>
                        {conv?.lastMessage && <div style={{ fontSize: 11, color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{conv.lastMessage.content}</div>}
                      </div>
                      {conv?.unread > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{conv.unread}</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Message Area */}
          {selectedUser ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)' }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--primary)' }}>{initials(selectedUser.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{selectedUser.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {selectedUser.role} {selectedUser.email ? `• ${selectedUser.email}` : ''}
                  </div>
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
                        padding: '10px 14px', maxWidth: '65%', fontSize: 13.5, color: isMe ? 'white' : 'var(--text)',
                        boxShadow: isMe ? 'none' : 'var(--shadow)'
                      }}>
                        {msg.content}
                        <div style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)', marginTop: 4, textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, background: 'var(--bg-card2)', padding: '6px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                    placeholder={`Message ${selectedUser.name}...`} style={{ flex: 1, background: 'none', border: 'none', boxShadow: 'none', padding: '8px 12px', fontSize: 13.5 }} />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: 9, padding: '8px 12px' }} disabled={!msgInput.trim()}>
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <MessageSquare size={50} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p style={{ fontSize: 14 }}>Select a user to start messaging</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;
