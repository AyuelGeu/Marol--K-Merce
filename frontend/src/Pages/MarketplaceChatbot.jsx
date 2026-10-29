import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './MarketplaceChatbot.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const SUGGESTED_QUESTIONS = [
  'How do I place an order?',
  'How does M-Pesa payment work?',
  'How can I become a vendor?'
];

export default function MarketplaceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messageListRef.current?.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isOpen, isSending, messages]);

  const sendMessage = async (value = question) => {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion || isSending) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', content: trimmedQuestion }
    ]);
    setQuestion('');
    setError('');
    setIsSending(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        question: trimmedQuestion
      }, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const answer = response.data?.answer;
      if (typeof answer !== 'string' || !answer.trim()) {
        throw new Error('The assistant returned an empty response.');
      }
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: answer.trim() }
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        requestError.response?.data?.message ||
        requestError.message ||
        'Unable to reach the assistant. Please try again.'
      );
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="marketplace-chatbot">
      {isOpen && (
        <section
          id="marketplace-chatbot-panel"
          className="marketplace-chatbot-panel"
          role="dialog"
          aria-label="K-Merce marketplace assistant"
          aria-modal="false"
        >
          <header className="marketplace-chatbot-header">
            <div className="marketplace-chatbot-brand">
              <span className="marketplace-chatbot-avatar" aria-hidden="true">K</span>
              <div>
                <strong>K-AI Assistant</strong>
                <span>Ask about using the marketplace</span>
              </div>
            </div>
            <button
              className="marketplace-chatbot-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="marketplace-chatbot-messages" ref={messageListRef} role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="marketplace-chatbot-welcome">
                <span aria-hidden="true">✦</span>
                <h2>How can I help?</h2>
                <p>Ask me about shopping, payments, orders, or getting started as a vendor.</p>
                <div className="marketplace-chatbot-suggestions">
                  {SUGGESTED_QUESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isSending}
                      onClick={() => sendMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                className={`marketplace-chatbot-message marketplace-chatbot-message-${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="marketplace-chatbot-message marketplace-chatbot-message-assistant" aria-label="Assistant is responding">
                <span className="marketplace-chatbot-typing" aria-hidden="true"><i /><i /><i /></span>
                <span className="marketplace-chatbot-visually-hidden">Assistant is responding</span>
              </div>
            )}
          </div>

          {error && <p className="marketplace-chatbot-error" role="alert">{error}</p>}

          <form className="marketplace-chatbot-form" onSubmit={handleSubmit}>
            <label className="marketplace-chatbot-visually-hidden" htmlFor="marketplace-chatbot-input">
              Ask the K-AI Assistant
            </label>
            <textarea
              id="marketplace-chatbot-input"
              ref={inputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              maxLength={1000}
              placeholder="Ask a question…"
              rows={1}
              disabled={isSending}
            />
            <button
              className="marketplace-chatbot-send"
              type="submit"
              disabled={!question.trim() || isSending}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12 20 4l-5 16-3-7-8-1Zm8 1 8-9" />
              </svg>
            </button>
          </form>
          <p className="marketplace-chatbot-note">AI responses may not always be accurate.</p>
        </section>
      )}

      <button
        className={`marketplace-chatbot-launcher${isOpen ? ' is-open' : ''}`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="marketplace-chatbot-panel"
        aria-label={isOpen ? 'Close marketplace assistant' : 'Open marketplace assistant'}
      >
        {isOpen ? (
          <span aria-hidden="true">×</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" />
              <path d="M8 11h.01M12 11h.01M16 11h.01" />
            </svg>
            <span>Ask us</span>
          </>
        )}
      </button>
    </div>
  );
}
