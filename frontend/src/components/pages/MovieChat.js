import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_SERVER_URI || 'http://localhost:8081';

const SUGGESTED_CHIPS = [
  "What makes this movie special?",
  "Who directed it?",
  "Is it worth watching?",
  "Tell me about the ending",
];

const MovieChat = ({ imdbId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!userId) {
    return <p className="movie-chat__signin">Sign in to chat about this movie.</p>;
  }

  const sendMessage = async (textOverride) => {
    const trimmed = (textOverride !== undefined ? textOverride : input).trim();
    if (!trimmed || loading || cooldown) return;

    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError('');
    setCooldown(true);
    setTimeout(() => setCooldown(false), 1000);

    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/movies/chat`, {
        imdbId,
        userId,
        messages: nextMessages
      });
      setMessages((prev) => [...prev, { role: 'model', content: response.data.reply }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="movie-chat">
      <div className="movie-chat__messages">
        {messages.length === 0 && (
          <div className="movie-chat__empty-state">
            <p className="movie-chat__empty">Ask anything about this movie.</p>
            <div className="movie-chat__chips">
              {SUGGESTED_CHIPS.map((q) => (
                <button
                  key={q}
                  className="movie-chat__chip"
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`movie-chat__bubble movie-chat__bubble--${msg.role}`}>
            <span className="movie-chat__label">{msg.role === 'user' ? 'You' : 'AI'}</span>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="movie-chat__bubble movie-chat__bubble--model">
            <span className="movie-chat__label">AI</span>
            <p className="movie-chat__thinking">Thinking...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="movie-chat__error">{error}</p>}

      <div className="movie-chat__input-row">
        <textarea
          className="movie-chat__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this movie... (Enter to send)"
          maxLength={500}
          rows={2}
          disabled={loading}
        />
        <button
          className="movie-action-btn"
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading || cooldown}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <span className="movie-chat__char-count">{input.length}/500</span>
    </div>
  );
};

export default MovieChat;