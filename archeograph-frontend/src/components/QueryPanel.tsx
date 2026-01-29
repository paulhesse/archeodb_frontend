import React, { useState, useCallback } from 'react';
import QueryInterface from './QueryInterface';
import ChatContainer from './ChatContainer';
import type { ArangoQueryResponse, QueryError } from '../services/arangoService';

interface QueryPanelProps {
  onQuerySubmit: (query: string) => Promise<ArangoQueryResponse>;
  isLoading: boolean;
  error: QueryError | null;
  onActiveTabChange?: (tab: 'aql' | 'ai') => void;
}

const QueryPanel: React.FC<QueryPanelProps> = ({
  onQuerySubmit,
  isLoading,
  error,
  onActiveTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'aql' | 'ai'>('aql');
  const [detectedAqlQuery, setDetectedAqlQuery] = useState<string | null>(null);

  const handleAqlQueryDetected = useCallback((query: string) => {
    setDetectedAqlQuery(query);
    // Switch to AQL tab when a query is detected
    setActiveTab('aql');
    onActiveTabChange?.('aql');
  }, [onActiveTabChange]);

  const handleUseAqlQuery = () => {
    if (detectedAqlQuery) {
      // This will be handled by the QueryInterface component
      setActiveTab('aql');
      onActiveTabChange?.('aql');
    }
  };

  const handleQueryUsed = () => {
    setDetectedAqlQuery(null);
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('aql');
            onActiveTabChange?.('aql');
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'aql'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          AQL Query
        </button>
        <button
          onClick={() => {
            setActiveTab('ai');
            onActiveTabChange?.('ai');
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          AI Assistant
        </button>
      </div>



      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'aql' ? (
          <QueryInterface
            onQuerySubmit={onQuerySubmit}
            isLoading={isLoading}
            error={error}
            initialQuery={detectedAqlQuery || ''}
            onQueryUsed={handleQueryUsed}
          />
        ) : null}

        {/* Keep ChatContainer mounted but hidden to preserve chat state */}
        <div className={`${activeTab === 'ai' ? 'block' : 'hidden'} flex-1 min-h-0 h-full`}>
          <div className="h-full">
            <ChatContainer onAqlQueryDetected={handleAqlQueryDetected} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryPanel;
