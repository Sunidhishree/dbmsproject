import React, { useState, useEffect } from 'react'

export default function MessagesPanel({ userUid, isAdmin = false }) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchMessages()
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchMessages, 10000)
        return () => clearInterval(interval)
    }, [])

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/message/my-messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages || [])
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        }
    }

    const handleMarkAsRead = async (messageId) => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('firebaseToken')
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/requests/message/${messageId}/read`,
                {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )

            if (response.ok) {
                setMessages(messages.map(m =>
                    m._id === messageId ? { ...m, read: true } : m
                ))
            }
        } catch (err) {
            console.error('Failed to mark message as read:', err)
        }
    }

    const unreadCount = messages.filter(m => !m.read).length

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-dark">Messages</h2>
                {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount} new
                    </span>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
                <p className="text-gray-500">No messages yet</p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages.map(msg => (
                        <div
                            key={msg._id}
                            className={`p-4 rounded-lg border-l-4 cursor-pointer transition ${msg.read
                                    ? 'bg-gray-50 border-gray-300'
                                    : 'bg-blue-50 border-blue-500'
                                }`}
                            onClick={() => !msg.read && handleMarkAsRead(msg._id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-dark">{msg.sender_name}</h3>
                                    {!msg.read && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            New
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-2">{msg.message}</p>
                            {msg.request_id && (
                                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                    Request: {msg.request_id}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
