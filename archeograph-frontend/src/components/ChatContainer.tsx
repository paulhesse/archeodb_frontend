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
    // 1. Check for Markdown code blocks first (most reliable)
    // Matches ```aql ... ``` or just ``` ... ```
    const markdownPattern = /```(?:aql)?\s*([\s\S]*?)```/i;
    const match = text.match(markdownPattern);
    if (match && match[1]) {
      return match[1].trim();
    }

    // 2. Look for the specific pattern mentioned in the task
    // Matches "Here's the query I'll run:" followed by a query
    const specificPattern = /Here's the query I'll run:\s*([\s\S]*?)(?=\s*This test will:|\s*What you should see|\s*Would you like|$)/i;
    const specificMatch = text.match(specificPattern);
    if (specificMatch && specificMatch[1]) {
      // Clean up the query
      let query = specificMatch[1].trim();
      // Remove any leading/trailing punctuation or formatting
      query = query.replace(/^[:-\s]+|[:-\s]+$/g, '');
      return query;
    }

    // 3. Fallback: Simple pattern to detect AQL queries - looks for FOR...RETURN patterns
    const aqlPattern = /FOR\s+.*?\s+RETURN\s+.*?(?=\s*[.;]|$)/i;
    const simpleMatch = text.match(aqlPattern);

    if (simpleMatch) {
      // Clean up the query by removing any trailing punctuation
      let query = simpleMatch[0].trim();
      if (query.endsWith(';') || query.endsWith('.')) {
        query = query.slice(0, -1).trim();
      }
      return query;
    }

    return null;
  };

  // Function to monitor chat messages (simplified approach)
  const monitorChatMessages = () => {
    if (!onAqlQueryDetected) return;

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
      if (chatRef.current.children.length === 0) {
        createChat({
          webhookUrl: 'https://n8n_v2.paulserver.dpdns.org/webhook/11608553-f847-445d-85c9-08002aaa4a3a/chat',
          target: '#n8n-chat',
          mode: 'fullscreen',
          showWelcomeScreen: false,
          initialMessages: [
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
    }

    // Set up message monitoring
    const cleanupMonitoring = monitorChatMessages();

    return () => {
      if (cleanupMonitoring) {
        cleanupMonitoring();
      }
    };
  }, [onAqlQueryDetected]);

  const handleImportLastMessage = () => {
     if (!onAqlQueryDetected) return;

     const chatElement = document.querySelector('#n8n-chat');
     if (chatElement) {
       // Try multiple selectors to find messages
       const selectors = [
         '.chat-message-assistant',
         '.message-assistant',
         '[class*="assistant"]',
         '.chat-message',
         '.message',
         'div[role="article"]'
       ];

       let messages: Element[] = [];
       for (const selector of selectors) {
         const foundMessages = chatElement.querySelectorAll(selector);
         if (foundMessages.length > 0) {
           messages = Array.from(foundMessages);
           break;
         }
       }

       if (messages.length > 0) {
         const lastMessage = messages[messages.length - 1];

         // Priority 1: Check for code block element in DOM
         const codeElement = lastMessage.querySelector('code');
         if (codeElement && codeElement.textContent) {
             onAqlQueryDetected(codeElement.textContent.trim());
             return;
         }

         // Priority 2: Parse text content
         const messageText = lastMessage.textContent || '';
         const detectedQuery = detectAqlQuery(messageText);

         if (detectedQuery) {
           onAqlQueryDetected(detectedQuery);
         }
       }
     }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          id="n8n-chat"
          ref={chatRef}
          className="h-full w-full overflow-y-auto"
        />
      </div>
      <div className="flex gap-1 mt-2 px-1">
        {onAqlQueryDetected && (
          <button
            onClick={handleImportLastMessage}
            className="w-full rounded bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            title="Import AQL query from the last message"
          >
            Import AQL from Last Message
          </button>
        )}
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
            /* Make paper plane button black (black icon on white background) */
            --chat--input--send--button--background: #ffffff;
            --chat--input--send--button--color: #000000;
            --chat--input--send--button--background-hover: #f5f5f5;
            --chat--input--send--button--color-hover: #000000;
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