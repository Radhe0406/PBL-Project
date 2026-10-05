import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Conversation, Message as MessageType } from '../types';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';

export default function Messages() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(conversationId || null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/messages/conversations').then(({ data }) => {
      setConversations(data.conversations || []);
      if (!activeConv && data.conversations?.length > 0) {
        setActiveConv(data.conversations[0]._id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeConv) {
      api.get(`/messages/conversations/${activeConv}`).then(({ data }) => {
        setMessages(data.messages || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }).catch(() => {});
    }
  }, [activeConv]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    const conv = conversations.find(c => c._id === activeConv);
    const recipient = conv?.otherParticipant || conv?.participants?.find((p: any) => p._id !== user?._id);
    if (!recipient) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', { recipientId: (recipient as any)._id, content: newMessage });
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {} finally { setSending(false); }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-container">
      <h1 className="section-title text-dark-100 mb-6">Messages</h1>
      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r border-dark-700/50 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-dark-700/50">
              <h2 className="font-semibold text-dark-200">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                  <p className="text-sm text-dark-500">No conversations yet</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const other = conv.otherParticipant || conv.participants?.find((p: any) => p._id !== user?._id);
                  return (
                    <button key={conv._id} onClick={() => setActiveConv(conv._id)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-dark-700/30 transition-colors border-b border-dark-800/50 ${activeConv === conv._id ? 'bg-dark-700/50' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {(other as any)?.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-dark-200 truncate">{(other as any)?.firstName} {(other as any)?.lastName}</p>
                        <p className="text-xs text-dark-500 truncate">{conv.lastMessage?.content}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-dark-500">{conv.lastMessage?.createdAt ? formatTime(conv.lastMessage.createdAt) : ''}</p>
                        {(conv.unreadForMe || 0) > 0 && (
                          <span className="inline-block mt-1 w-5 h-5 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center">{conv.unreadForMe}</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Message area */}
          <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
            {activeConv ? (
              <>
                <div className="p-4 border-b border-dark-700/50 flex items-center gap-3">
                  <button onClick={() => setActiveConv(null)} className="md:hidden text-dark-400"><ArrowLeft className="w-5 h-5" /></button>
                  {(() => {
                    const conv = conversations.find(c => c._id === activeConv);
                    const other = conv?.otherParticipant || conv?.participants?.find((p: any) => p._id !== user?._id);
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                          {(other as any)?.firstName?.[0] || '?'}
                        </div>
                        <p className="font-semibold text-dark-200 text-sm">{(other as any)?.firstName} {(other as any)?.lastName}</p>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isMine = (msg.senderId as any)?._id === user?._id || msg.senderId === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary-500 text-white rounded-br-md' : 'bg-dark-700 text-dark-200 rounded-bl-md'}`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-dark-500'}`}>{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-dark-700/50">
                  <div className="flex gap-2">
                    <input
                      type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..." className="input-field flex-1"
                    />
                    <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="btn-primary !px-4">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
