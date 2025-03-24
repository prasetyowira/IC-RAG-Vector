import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentConversation,
  sendMessage,
  createConversation,
  selectIsLoading
} from '../store/chatSlice';
import type { AppDispatch } from '../store/store';

const Chat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentConversation = useSelector(selectCurrentConversation);
  const isLoading = useSelector(selectIsLoading);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Create a new conversation if none exists
    if (!currentConversation) {
      dispatch(createConversation('New Conversation'));
    }
  }, [dispatch, currentConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation) return;

    try {
      await dispatch(sendMessage({
        conversationId: currentConversation.id, 
        content: input
      })).unwrap();
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!currentConversation) {
    return <div>Loading conversation...</div>;
  }

  return (
    <div className="chat-container">
      <div className="messages-container">
        {currentConversation.messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role.user !== undefined ? 'user-message' : 'system-message'}`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && <div className="message loading">AI is thinking...</div>}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 