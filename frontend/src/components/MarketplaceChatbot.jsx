import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './MarketplaceChatbot.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function MarketplaceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can help with products, stores, and shopping on K-Merce. What would you like to know?'
    }
  ]);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (isOpen && messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [isOpen, isSending, messages]);

  const sendQuestion = async (event) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', content: trimmedQuestion }
    ]);
    setQuestion('');
    setIsSending(true);

    try {
      const history = messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .slice(-8);
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        question: trimmedQuestion,
        history
      }, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: response.data.answer }
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: error.response?.data?.error || 'I could not reach the assistant. Please try again shortly.'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="marketplace-chatbot">
      {isOpen && (
        <section className="marketplace-chat-panel" aria-label="K-Merce marketplace assistant">
          <header className="marketplace-chat-header">
            <div>
              <strong>K-Merce Assistant</strong>
              <span>Marketplace help</span>
            </div>
            <button
              type="button"
              className="marketplace-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="marketplace-chat-messages" ref={messageListRef} aria-live="polite">
            {messages.map((message, index) => (
              <p
                className={`marketplace-chat-message is-${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </p>
            ))}
            {isSending && <p className="marketplace-chat-typing" role="status">Thinking…</p>}
          </div>

          <form className="marketplace-chat-form" onSubmit={sendQuestion}>
            <label className="marketplace-chat-visually-hidden" htmlFor="marketplace-chat-question">
              Ask the marketplace assistant
            </label>
            <input
              id="marketplace-chat-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question…"
              maxLength={1000}
              disabled={isSending}
            />
            <button type="submit" disabled={!question.trim() || isSending}>Send</button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="marketplace-chat-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close marketplace chat' : 'Open marketplace chat'}
      >
        {isOpen ? 'Close chat' : 'K-AI'}
      </button>
    </div>
  );
}
