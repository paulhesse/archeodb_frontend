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
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">ArangoDB Query</h2>
        <p className="mt-1 text-xs text-slate-500">Paste an AQL query or pick an example.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label htmlFor="query" className="mb-2 block text-xs font-semibold text-slate-700">
            Enter your AQL query:
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-h-[120px] resize-y rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
            rows={4}
            placeholder="FOR v, e, p IN 1..2 ANY 'nodeId' GRAPH 'cidoc_graph' RETURN {nodes: [v], edges: [e]}"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {queryExamples.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              className="rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Example {index + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center justify-center rounded bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                Executing...
              </>
            ) : (
              'Execute Query'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mx-5 mb-5 rounded border border-red-300 bg-red-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-red-800">Query Error</h3>
          <p className="mt-1 text-xs text-red-700">{error.message}</p>
          {error.code && <p className="mt-1 text-xs text-red-600">Error code: {error.code}</p>}
        </div>
      )}

      <div className="border-t border-slate-200 px-5 py-4">
        <h3 className="mb-2 text-xs font-semibold text-slate-700">Tips</h3>
        <ul className="space-y-1 text-xs text-slate-600">
          <li>
            • Use{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">
              FOR v, e, p IN 1..depth ANY 'nodeId' GRAPH 'graphName'
            </code>{' '}
            for traversals
          </li>
          <li>
            •{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">
              RETURN {'{nodes: [v], edges: [e]}' }
            </code>{' '}
            format works best
          </li>
          <li>
            • Limit depth (e.g. <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">1..2</code>) for performance
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QueryInterface;
