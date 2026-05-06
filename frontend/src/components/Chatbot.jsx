import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I\'m your RitConnect Assistant. How can I help you today? You can ask about donor matching, your eligibility, or general health rules.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const auth = getAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                setMessages(prev => [...prev, { role: 'model', text: 'Please log in to use the chatbot features.' }]);
                setIsLoading(false);
                return;
            }

            const token = await user.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    history: messages.map(m => ({
                        role: m.role,
                        parts: [m.text]
                    }))
                })
            });

            const data = await response.json();
            if (data.response) {
                setMessages(prev => [...prev, { role: 'model', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Could not connect to the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white/90 backdrop-blur-md w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-400 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🤖</span>
                            </div>
                            <span className="font-bold">RitConnect Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    m.role === 'user' 
                                    ? 'bg-primary text-white rounded-tr-none' 
                                    : 'bg-gray-100 text-dark rounded-tl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none animate-pulse">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-primary text-white p-2 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <div className="relative">
                {/* Glowing pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-red-500 opacity-40 animate-ping" />
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        boxShadow: '0 0 20px rgba(220,38,38,0.6), 0 4px 15px rgba(0,0,0,0.3)'
                    }}
                >
                    {isOpen ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    ) : (
                        <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    )}
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-red-600 animate-bounce">
                            AI
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
