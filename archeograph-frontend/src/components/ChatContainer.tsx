import React, { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const ChatContainer: React.FC = () => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      // Clean up any existing chat instances
      const existingChat = chatRef.current.querySelector('#n8n-chat');
      if (existingChat) {
        existingChat.innerHTML = '';
      }

      createChat({
        webhookUrl: 'https://n8n.paulserver.dpdns.org/webhook/11608553-f847-445d-85c9-08002aaa4a3a/chat',
        target: '#n8n-chat',
        mode: 'fullscreen',
        showWelcomeScreen: false,
        initialMessages: [
          'Hi there! 👋',
          'I can help you query the ArchaeoGraph database using natural language. Try asking me about artifacts, places, or relationships!'
        ],
        enableStreaming: false,
        i18n: {
          en: {
            title: '',
            subtitle: '',
            footer: '',
            getStarted: 'New Conversation',
            inputPlaceholder: 'Type your question...',
            closeButtonTooltip: 'Close chat',
          },
        },
      });
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div
        id="n8n-chat"
        ref={chatRef}
        className="flex-1 min-h-0 w-full"
      />
      {/* Add minimalistic styling to match the app's design */}
      <style>
        {`
          /* Minimalistic white styling for the chat widget */
          :root {
            --chat--color--primary: #f1f5f9;
            --chat--color--secondary: #4f46e5;
            --chat--color-white: #ffffff;
            --chat--color-light: #ffffff;
            --chat--color-medium: #e2e8f0;
            --chat--color-dark: #1e293b;
            --chat--window--width: 100%;
            --chat--window--height: 100%;
            --chat--header--background: #ffffff;
            --chat--header--color: #1e293b;
            --chat--message--bot--background: #f8fafc;
            --chat--message--user--background: #e2e8f0;
            --chat--message--user--color: #1e293b;
            --chat--message--bot--color: #1e293b;
            --chat--border-radius: 8px;
            --chat--spacing: 0.75rem;
            --chat--textarea--height: 48px;
            --chat--message--padding: 0.75rem;
            --chat--message--font-size: 0.875rem;
          }
        `}
      </style>
    </div>
  );
};

export default ChatContainer;