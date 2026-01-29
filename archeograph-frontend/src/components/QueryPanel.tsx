import React, { useState, useCallback } from 'react';
import QueryInterface from './QueryInterface';
import ChatContainer from './ChatContainer';
import type { ArangoQueryResponse, QueryError } from '../services/arangoService';

interface QueryPanelProps {
  onQuerySubmit: (query: string) => Promise<ArangoQueryResponse>;
  isLoading: boolean;
  error: QueryError | null;
}

const QueryPanel: React.FC<QueryPanelProps> = ({
  onQuerySubmit,
  isLoading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'aql' | 'ai'>('aql');
  const [detectedAqlQuery, setDetectedAqlQuery] = useState<string | null>(null);

  const handleAqlQueryDetected = useCallback((query: string) => {
    setDetectedAqlQuery(query);
    // Switch to AQL tab when a query is detected
    setActiveTab('aql');
  }, []);

  const handleUseAqlQuery = () => {
    if (detectedAqlQuery) {
      // This will be handled by the QueryInterface component
      setActiveTab('aql');
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
          onClick={() => setActiveTab('aql')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'aql'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          AQL Query
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          AI Assistant
        </button>
      </div>

      {/* Detected AQL Query Notification */}
      {detectedAqlQuery && (
        <div className="rounded border border-blue-300 bg-blue-50 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-700">AQL Query detected from AI Assistant</span>
            <code className="text-xs bg-blue-100 px-1 rounded">{detectedAqlQuery.substring(0, 50)}{detectedAqlQuery.length > 50 ? '...' : ''}</code>
          </div>
          <button
            onClick={handleUseAqlQuery}
            className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Use AQL Query
          </button>
        </div>
      )}

      {/* Test button for manual testing */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            // Test with a sample AQL query
            const testQuery = 'FOR v, e, p IN 1..2 ANY "root" GRAPH "cidoc_graph" RETURN {nodes: [v], edges: [e]}';
            handleAqlQueryDetected(testQuery);
          }}
          className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 transition-colors"
        >
          🧪 Test AQL Detection
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
        <div className={`${activeTab === 'ai' ? 'block' : 'hidden'} flex-1 min-h-0`}>
          <ChatContainer onAqlQueryDetected={handleAqlQueryDetected} />
        </div>
      </div>
    </div>
  );
};

export default QueryPanel;
