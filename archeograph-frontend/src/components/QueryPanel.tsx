import React, { useState, useCallback } from 'react';
import QueryInterface from './QueryInterface';
import ChatContainer from './ChatContainer';
import NodeDetailPanel from './NodeDetailPanel';
import type { ArangoQueryResponse, QueryError, GraphNode } from '../services/arangoService';

interface QueryPanelProps {
  onQuerySubmit: (query: string) => Promise<ArangoQueryResponse>;
  isLoading: boolean;
  error: QueryError | null;
  activeTab: 'aql' | 'node' | 'ai';
  onActiveTabChange: (tab: 'aql' | 'node' | 'ai') => void;
  selectedNode: GraphNode | null;
  onCloseNodeDetails?: () => void;
}

const QueryPanel: React.FC<QueryPanelProps> = ({
  onQuerySubmit,
  isLoading,
  error,
  activeTab,
  onActiveTabChange,
  selectedNode,
  onCloseNodeDetails,
}) => {
  const [detectedAqlQuery, setDetectedAqlQuery] = useState<string | null>(null);

  const handleAqlQueryDetected = useCallback((query: string) => {
    setDetectedAqlQuery(query);
    // Switch to AQL tab when a query is detected
    onActiveTabChange('aql');
  }, [onActiveTabChange]);

  const handleUseAqlQuery = () => {
    if (detectedAqlQuery) {
      // This will be handled by the QueryInterface component
      onActiveTabChange('aql');
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
            onActiveTabChange('aql');
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
            onActiveTabChange('node');
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'node'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Node Details
        </button>
        <button
          onClick={() => {
            onActiveTabChange('ai');
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
        ) : activeTab === 'node' ? (
          <div className="flex-1 min-h-0 border border-slate-100 rounded flex flex-col overflow-hidden document-scroll-container">
            <NodeDetailPanel
              selectedNode={selectedNode}
              onClose={() => onCloseNodeDetails?.()}
            />
          </div>
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
