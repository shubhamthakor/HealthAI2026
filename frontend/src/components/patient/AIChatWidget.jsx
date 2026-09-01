import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './AIChatWidget.css';

const AIChatWidget = () => {
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const messagesEndRef = useRef(null);

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  // Set initial greeting on component mount
  useEffect(() => {
    setMessages([
      {
        id: 'initial-greeting',
        sender: 'assistant',
        text: `Hello ${user?.name || 'Patient'}! I am your HealthAI Care Agent. I can help you search doctors, check queue wait times, log bookings, analyze symptoms, and check leaves. How can I assist you today?`,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  // Auto-scroll to bottom of chat when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // 1. Add User message to chat
    const userMsgId = `user-${Date.now()}`;
    const newMsg = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    // 2. Prepare payload
    const lang = i18n.language || 'en';
    
    // Map existing messages to history context for backend LLM
    // Limit history to last 8 messages to prevent context overflow
    const chatHistory = messages
      .slice(-8)
      .map(m => ({
        sender: m.sender,
        text: m.text
      }));

    try {
      // 3. POST request to Express gateway
      const response = await api.post('/assistant/chat', {
        message: text.trim(),
        lang,
        chatHistory,
        city: user?.city || ''
      });

      const responseData = response.data?.data;
      if (responseData) {
        // 4. Add Assistant message response
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: responseData.reply,
          timestamp: new Date(),
          intent: responseData.intent,
          actionExecuted: responseData.actionExecuted,
          actionSuccess: responseData.actionSuccess,
          actionError: responseData.actionError,
          structuredData: responseData.structuredData
        }]);
      } else {
        throw new Error('Invalid response structure received.');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errMsg = error.response?.data?.error?.message || 'Sorry, I encountered a communication error with the backend services.';
      
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: errMsg,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleQuickAction = (actionText) => {
    handleSendMessage(actionText);
  };

  const formatTime = (dateObj) => {
    const d = new Date(dateObj);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Structured Cards Renders
  const renderDoctorsList = (doctors) => {
    if (!doctors || doctors.length === 0) return null;
    return (
      <div className="ai-chat-card-container">
        {doctors.slice(0, 3).map((doc) => (
          <div key={doc._id} className="ai-chat-doctor-card">
            <div className="ai-chat-doctor-info">
              <h4>Dr. {doc.name}</h4>
              <p>{doc.hospital}</p>
            </div>
            <div className="ai-chat-doctor-meta">
              <span className="ai-chat-badge specialization">{doc.specialization}</span>
              <span className="ai-chat-badge city">{doc.city}</span>
            </div>
            <button 
              className="ai-chat-card-btn"
              onClick={() => handleQuickAction(`Book appointment with Dr. ${doc.name} on 2026-07-06`)}
            >
              📅 Book Consultation
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderAppointmentDetails = (appt) => {
    if (!appt) return null;
    const isCancelled = appt.status === 'cancelled';
    return (
      <div className="ai-chat-card-container">
        <div className="ai-chat-appointment-card" style={{ borderColor: isCancelled ? '#fecdd3' : '#99f6e4', background: isCancelled ? '#fff1f2' : '#f0fdfa' }}>
          <div className="ai-chat-appt-header">
            <h4>{isCancelled ? '❌ Appointment Cancelled' : '📅 Booking Confirmed'}</h4>
            <span className="ai-chat-appt-status" style={{ color: isCancelled ? '#e11d48' : '#0d9488' }}>{appt.status}</span>
          </div>
          <div className="ai-chat-appt-details">
            <p><strong>Date:</strong> {new Date(appt.appointmentDate).toDateString()}</p>
            {!isCancelled && (
              <>
                <p><strong>Queue Position:</strong> #{appt.queueNumber}</p>
                <p><strong>Est. Wait Time:</strong> {appt.estimatedWaitTime} mins</p>
              </>
            )}
            {appt.cancellationReason && (
              <p><strong>Reason:</strong> {appt.cancellationReason}</p>
            )}
          </div>
          {!isCancelled && (
            <button 
              className="ai-chat-card-btn cancel"
              onClick={() => handleQuickAction(`Cancel my appointment with ID ${appt._id || appt.appointmentId}`)}
            >
              Cancel Reservation
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderQueueStatus = (queues) => {
    if (!queues || queues.length === 0) return null;
    return (
      <div className="ai-chat-card-container">
        {queues.map((q) => (
          <div key={q.appointmentId} className="ai-chat-appointment-card">
            <div className="ai-chat-appt-header">
              <h4>⏳ Active Queue Tracker</h4>
              <span className="ai-chat-appt-status">{q.status}</span>
            </div>
            <div className="ai-chat-appt-details">
              <p><strong>Doctor:</strong> Dr. {q.doctorName} ({q.specialization})</p>
              <p><strong>Hospital:</strong> {q.hospital}, {q.city}</p>
              <p><strong>Your Position:</strong> {q.position} of {q.totalQueueLength}</p>
              <p><strong>Est. Wait Time:</strong> {q.estimatedWaitTime} mins</p>
            </div>
            <button 
              className="ai-chat-card-btn cancel"
              onClick={() => handleQuickAction(`Cancel my appointment with ID ${q.appointmentId}`)}
            >
              Cancel Reservation
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderDiseasePrediction = (pred) => {
    if (!pred) return null;
    return (
      <div className="ai-chat-card-container">
        <div className="ai-chat-prediction-card">
          <div className="ai-chat-prediction-header">
            <h4>🧠 Disease Inference</h4>
            <span className="ai-chat-confidence">Conf: {(pred.confidence * 100).toFixed(1)}%</span>
          </div>
          <p className="ai-chat-prediction-desc"><strong>Predicted:</strong> {pred.diseaseName}</p>
          <p className="ai-chat-prediction-desc">{pred.description}</p>
          <div style={{ marginTop: '4px' }}>
            <strong>Precautions:</strong>
            <ul className="ai-chat-precautions">
              {pred.precautions?.map((prec, i) => (
                <li key={i}>{prec}</li>
              ))}
            </ul>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.72rem', color: '#dc2626', fontStyle: 'italic' }}>
            ⚠️ Consult a doctor immediately for a professional evaluation.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="ai-chat-widget-container">
      {/* Welcome Bubble */}
      {showWelcomeBubble && !isOpen && (
        <div 
          className="ai-chat-welcome-bubble" 
          id="ai-chat-welcome-bubble"
          onClick={() => {
            setIsOpen(true);
            setShowWelcomeBubble(false);
          }}
        >
          <div className="ai-chat-welcome-bubble-content">
            <span className="ai-chat-welcome-avatar">🤖</span>
            <span className="ai-chat-welcome-text">Hey! How can I help you?</span>
          </div>
          <button 
            className="ai-chat-welcome-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setShowWelcomeBubble(false);
            }}
            aria-label="Dismiss greeting"
          >
            ✖
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="ai-chat-trigger-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setShowWelcomeBubble(false);
          }
        }}
        aria-label="Open Chat Assistant"
        id="ai-assistant-toggle-btn"
      >
        💬
      </button>

      {/* Main Chat Dialog Window */}
      {isOpen && (
        <div className="ai-chat-window" id="ai-assistant-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-avatar">🤖</div>
              <div className="ai-chat-header-meta">
                <h3>HealthAI Care Agent</h3>
                <span>Active Support</span>
              </div>
            </div>
            <button 
              className="ai-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat Window"
            >
              ✖
            </button>
          </div>

          {/* Messages Scroll Body */}
          <div className="ai-chat-messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-chat-message ${msg.sender}`}>
                <div className="ai-chat-bubble">
                  {msg.text}
                  
                  {/* Render dynamic structured metadata details inside the message boundary */}
                  {msg.structuredData && (
                    <>
                      {renderDiseasePrediction(msg.structuredData.diseasePrediction)}
                      {renderDoctorsList(msg.structuredData.doctors)}
                      {renderAppointmentDetails(msg.structuredData.appointment)}
                      {renderQueueStatus(msg.structuredData.queueStatus)}
                    </>
                  )}
                </div>
                <span className="ai-chat-timestamp">{formatTime(msg.timestamp)}</span>
              </div>
            ))}

            {/* Typing Loader State */}
            {isLoading && (
              <div className="ai-chat-typing-bubble" id="ai-assistant-typing-indicator">
                <div className="ai-chat-typing-dot"></div>
                <div className="ai-chat-typing-dot"></div>
                <div className="ai-chat-typing-dot"></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions area */}
          <div className="ai-chat-suggestions">
            <button 
              className="ai-chat-suggestion-pill"
              onClick={() => handleQuickAction('Analyze symptoms')}
            >
              🧠 Symptom prediction
            </button>
            <button 
              className="ai-chat-suggestion-pill"
              onClick={() => handleQuickAction('Search doctors')}
            >
              🔍 Find Doctor
            </button>
            <button 
              className="ai-chat-suggestion-pill"
              onClick={() => handleQuickAction('What is my queue status?')}
            >
              ⏳ Track Queue
            </button>
          </div>

          {/* User Input Form */}
          <form className="ai-chat-input-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              className="ai-chat-input-field"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              aria-label="Chat Input"
              id="ai-assistant-text-input"
            />
            <button 
              type="submit"
              className="ai-chat-send-btn"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send Message"
              id="ai-assistant-send-btn"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
