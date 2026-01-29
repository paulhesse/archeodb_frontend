import React, { useState } from 'react';
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

  return (
    <div className="space-y-4 h-full flex flex-col">
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

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'aql' ? (
          <QueryInterface
            onQuerySubmit={onQuerySubmit}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <ChatContainer />
        )}
      </div>
    </div>
  );
};

export default QueryPanel;