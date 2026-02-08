import React, { useState } from 'react';
import type { ArangoQueryResponse, QueryError } from '../services/arangoService';

interface QueryInterfaceProps {
  onQuerySubmit: (query: string) => Promise<ArangoQueryResponse>;
  isLoading: boolean;
  error: QueryError | null;
  initialQuery?: string;
  onQueryUsed?: () => void;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({
  onQuerySubmit,
  isLoading,
  error,
  initialQuery = '',
  onQueryUsed,
}) => {
  const [query, setQuery] = useState<string>(initialQuery);

  // Reset the query when initialQuery changes
  React.useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      // Call the callback to indicate the query has been used
      if (onQueryUsed) {
        onQueryUsed();
      }
    }
  }, [initialQuery, query, onQueryUsed]);
  const [queryExamples] = useState<{ label: string; query: string }[]>([
    {
      label: 'Show whole Graph',
      query: `/** 
 * 1. Collect a sample of nodes from ALL valid collections 
 * (Removed E1_CRM_Entity)
 */
LET seed_nodes = UNION(
  (FOR x IN E22_HumanMadeObject LIMIT 10 RETURN x),
  (FOR x IN E33_LinguisticObject LIMIT 10 RETURN x),
  (FOR x IN E36_VisualItem LIMIT 10 RETURN x),
  (FOR x IN E53_Place LIMIT 10 RETURN x),
  (FOR x IN E39_Actor LIMIT 10 RETURN x),
  (FOR x IN E5_Event LIMIT 10 RETURN x),
  (FOR x IN E52_TimeSpan LIMIT 10 RETURN x),
  (FOR x IN E55_Type LIMIT 10 RETURN x),
  (FOR x IN E42_Identifier LIMIT 10 RETURN x)
)

/** 
 * 2. Find edges connected to these nodes using valid Traversal syntax 
 */
LET edges_raw = (
  FOR n IN seed_nodes
    FOR neighbor, edge IN 1..1 ANY n._id
      P1_is_identified_by,
      P2_has_type,
      P4_has_time_span,
      P7_took_place_at,
      P45_consists_of,
      P53_has_former_or_current_location,
      P70_documents,
      P94i_was_created_by,
      P108i_was_produced_by,
      P128_carries,
      P138i_has_representation,
      P148_has_component
    RETURN edge
)

/** 
 * 3. Deduplicate edges 
 */
LET unique_edges = (
  FOR e IN edges_raw
    RETURN DISTINCT e
)

/** 
 * 4. Collect all Node IDs involved (Start nodes + From/To of edges)
 * We do this to ensure we have the visual data for nodes found via traversal
 * that weren't in the initial seed list.
 */
LET all_node_ids = UNIQUE(
  UNION(
    seed_nodes[*]._id,
    unique_edges[*]._from,
    unique_edges[*]._to
  )
)

/** 
 * 5. Fetch full node documents safely using DOCUMENT() 
 */
LET final_nodes = (
  FOR id IN all_node_ids
    LET doc = DOCUMENT(id)
    FILTER doc != null
    RETURN doc
)

RETURN {
  nodes: (
    FOR n IN final_nodes
    RETURN {
      id: n._id,
      label: n.label || n.title || n.name || 'Unnamed',
      type: PARSE_IDENTIFIER(n._id).collection,
      properties: UNSET(n, 'vector_data')
    }
  ),
  edges: (
    FOR e IN unique_edges
    RETURN {
      id: e._id,
      from: e._from,
      to: e._to,
      label: PARSE_IDENTIFIER(e._id).collection,
      properties: e
    }
  )
}`,
    },
    {
      label: 'Ex 2',
      query: 'FOR node IN cidoc_graph RETURN node',
    },
    {
      label: 'Ex 3',
      query: 'FOR v, e IN 1..1 OUTBOUND "E22_Artifact_001" GRAPH "cidoc_graph" RETURN {v, e}',
    },
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
              onClick={() => handleExampleClick(example.query)}
              className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              {example.label}
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
