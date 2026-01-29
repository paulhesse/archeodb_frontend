import React, { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

interface ChatContainerProps {
  onAqlQueryDetected?: (query: string) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ onAqlQueryDetected }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  // Function to detect AQL queries in text
  const detectAqlQuery = (text: string): string | null => {
    // Simple pattern to detect AQL queries - looks for FOR...RETURN patterns
    const aqlPattern = /FOR\s+.*?\s+RETURN\s+.*?(?=\s*[.;]|$)/i;
    const match = text.match(aqlPattern);

    if (match) {
      // Clean up the query by removing any trailing punctuation
      let query = match[0].trim();
      if (query.endsWith(';') || query.endsWith('.')) {
        query = query.slice(0, -1).trim();
      }
      return query;
    }

    // Also check for common AQL patterns
    const simplePatterns = [
      /FOR\s+.*?\s+IN\s+.*?(?=\s*[.;]|$)/i,
      /RETURN\s+.*?(?=\s*[.;]|$)/i,
      /FOR\s+.*?\s+ANY\s+.*?\s+GRAPH\s+.*?(?=\s*[.;]|$)/i
    ];

    for (const pattern of simplePatterns) {
      const simpleMatch = text.match(pattern);
      if (simpleMatch) {
        let query = simpleMatch[0].trim();
        if (query.endsWith(';') || query.endsWith('.')) {
          query = query.slice(0, -1).trim();
        }
        return query;
      }
    }

    return null;
  };

  // Function to monitor chat messages (simplified approach)
  const monitorChatMessages = () => {
    if (!onAqlQueryDetected) return;

    // Since we can't directly access the n8n chat internals, we'll implement
    // a manual detection mechanism that users can trigger
    // In a real implementation, this would be more sophisticated

    // For now, we'll provide a way to manually detect queries from copied text
    const handlePasteDetection = (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData('text');
      if (pastedText) {
        const detectedQuery = detectAqlQuery(pastedText);
        if (detectedQuery) {
          onAqlQueryDetected(detectedQuery);
        }
      }
    };

    // Add event listener for paste events
    document.addEventListener('paste', handlePasteDetection);

    // Cleanup function
    return () => {
      document.removeEventListener('paste', handlePasteDetection);
    };
  };

  useEffect(() => {
    // Initialize chat when component mounts
    if (chatRef.current) {
      // Only initialize chat if it doesn't already exist to preserve state
      // We check if the container has any children, as the chat widget adds elements to it
      if (chatRef.current.children.length === 0) {
        // Always create the chat - this ensures it initializes properly
        createChat({
          webhookUrl: 'https://n8n.paulserver.dpdns.org/webhook/11608553-f847-445d-85c9-08002aaa4a3a/chat',
          target: '#n8n-chat',
          mode: 'fullscreen',
          showWelcomeScreen: false,
          initialMessages: [
            'Hi there! 👋',
            'I can help you query the ArchaeoGraph database using natural language. Try asking me about artifacts, places, or relationships!',
            'Tip: When I provide an AQL query, you can copy it and it will automatically appear in the query interface!'
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
    }

    // Set up message monitoring
    const cleanupMonitoring = monitorChatMessages();

    return () => {
      if (cleanupMonitoring) {
        cleanupMonitoring();
      }
    };
  }, [onAqlQueryDetected]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex gap-1 mb-1 px-1">
        {onAqlQueryDetected && (
          <>
            <button
              onClick={() => {
                // Get the last bot message from the chat
                const chatElement = document.querySelector('#n8n-chat');
                if (chatElement) {
                  // This is a simplified approach - in a real implementation,
                  // we would need to access the chat messages more directly
                  const lastMessage = chatElement.querySelector('.chat-message-assistant:last-child');
                  if (lastMessage) {
                    const messageText = lastMessage.textContent || '';
                    const detectedQuery = detectAqlQuery(messageText);
                    if (detectedQuery) {
                      onAqlQueryDetected(detectedQuery);
                    } else {
                      alert('No AQL query detected in the last message. Try copying the query manually.');
                    }
                  }
                }
              }}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
              title="Detect AQL Query in last message"
            >
              <span>🔍</span>
              <span>Last</span>
            </button>
            <button
              onClick={() => {
                const chatElement = document.querySelector('#n8n-chat');
                if (chatElement) {
                  // Select all bot messages and try to find AQL queries in them
                  const botMessages = chatElement.querySelectorAll('.chat-message-assistant');
                  const queries: string[] = [];

                  botMessages.forEach(message => {
                    const messageText = message.textContent || '';
                    const detectedQuery = detectAqlQuery(messageText);
                    if (detectedQuery && !queries.includes(detectedQuery)) {
                      queries.push(detectedQuery);
                    }
                  });

                  if (queries.length > 0) {
                    // Use the most recent query
                    onAqlQueryDetected(queries[queries.length - 1]);
                  } else {
                    alert('No AQL queries detected in the chat. Try copying the query manually.');
                  }
                }
              }}
              className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors flex items-center gap-1"
              title="Scan all messages for AQL queries"
            >
              <span>🔍</span>
              <span>All</span>
            </button>
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          id="n8n-chat"
          ref={chatRef}
          className="h-full w-full overflow-y-auto"
        />
      </div>
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

          /* Constrain n8n chat widget to prevent UI breakage */
          #n8n-chat {
            height: 100% !important;
            max-height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }

          /* Target n8n chat internal structure - more comprehensive selectors */
          #n8n-chat > div,
          #n8n-chat > div > div {
            height: 100% !important;
            max-height: 100% !important;
          }

          /* Target message container */
          #n8n-chat [class*="messages"],
          #n8n-chat [class*="message-container"] {
            flex: 1 !important;
            overflow-y: auto !important;
            max-height: calc(100% - 50px) !important; /* Account for input area - reduced from 80px to 50px */
            contain: strict !important;
          }

          /* Target input area */
          #n8n-chat [class*="input"],
          #n8n-chat [class*="textarea"] {
            flex-shrink: 0 !important;
            min-height: auto !important;
          }

          /* Prevent individual messages from breaking layout */
          #n8n-chat [class*="message"],
          #n8n-chat [class*="bubble"] {
            max-width: 100% !important;
            overflow-wrap: break-word !important;
            word-break: break-word !important;
          }

          /* Target any scrollable containers within n8n chat */
          #n8n-chat [class*="scroll"],
          #n8n-chat [class*="container"] {
            max-height: 100% !important;
            overflow: hidden !important;
          }

          /* Ensure the chat doesn't expand beyond its container */
          #n8n-chat * {
            max-height: 100vh !important;
            overflow-anchor: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default ChatContainer;
