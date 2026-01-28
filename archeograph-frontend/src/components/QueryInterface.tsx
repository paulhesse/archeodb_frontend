import React, { useState } from 'react';
import type { ArangoQueryResponse, QueryError } from '../services/arangoService';

interface QueryInterfaceProps {
  onQuerySubmit: (query: string) => Promise<ArangoQueryResponse>;
  isLoading: boolean;
  error: QueryError | null;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  onQuerySubmit,
  isLoading,
  error,
}) => {
  const [query, setQuery] = useState<string>('');
  const [queryExamples] = useState<string[]>([
    'FOR v, e, p IN 1..2 ANY "root" GRAPH "cidoc_graph" RETURN {nodes: [v], edges: [e]}',
    'FOR node IN cidoc_graph RETURN node',
    'FOR v, e IN 1..1 OUTBOUND "E22_Artifact_001" GRAPH "cidoc_graph" RETURN {v, e}',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onQuerySubmit(query);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-h-[100px] resize-y rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            rows={3}
            placeholder="FOR v, e, p IN 1..2 ANY 'nodeId' GRAPH 'cidoc_graph' RETURN {nodes: [v], edges: [e]}"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {queryExamples.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Ex {index + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center justify-center rounded bg-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block h-2 w-2 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                Exec
              </>
            ) : (
              'Execute'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-700">{error.message}</p>
          {error.code && <p className="mt-1 text-xs text-red-600">Code: {error.code}</p>}
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
