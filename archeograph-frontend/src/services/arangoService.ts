interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  properties: Record<string, any>;
}

interface ArangoQueryResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /**
   * Raw rows returned by the backend. This is useful for non-graph queries
   * (e.g. fulltext/search results) where there are no explicit edges.
   */
  rows?: any[];
  /** Original response payload (useful for debugging). */
  raw?: any;
  statistics?: {
    nodeCount: number;
    edgeCount: number;
    queryTime: number;
  };
}

interface QueryError {
  message: string;
  code?: string;
  details?: any;
}

class ArangoService {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://n8n.paulserver.dpdns.org/webhook-test/api/query_arango') {
    this.baseUrl = baseUrl;
  }

  async queryGraph(query: string): Promise<ArangoQueryResponse> {
    try {
      console.log('🔍 Executing query:', query);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw {
          message: `Query failed with status ${response.status}`,
          code: response.status.toString(),
          details: errorData,
        } as QueryError;
      }

      const payload = await response.json();
      console.log('📥 Raw Response (before normalization):', JSON.stringify(payload, null, 2));

      // Debug the normalization process
      console.log('🔧 Starting normalization...');
      const rows = extractRows(payload);
      console.log('📋 Extracted rows:', JSON.stringify(rows, null, 2));

      const graphFromRows = mergeGraphFromRows(rows);
      console.log('🔀 Merged from rows:', graphFromRows);

      const isGraph = isGraphPayload(payload);
      console.log('✅ Is direct graph payload?', isGraph);

      const normalized = normalizeArangoResponse(payload);
      console.log('✨ Normalized result:', JSON.stringify(normalized, null, 2));
      console.log('📊 Summary: Nodes:', normalized.nodes.length, 'Edges:', normalized.edges.length, 'Rows:', normalized.rows?.length || 0);
      return normalized;
    } catch (error) {
      if (error instanceof Error) {
        console.error('💥 Network Error:', error.message);
        throw {
          message: error.message,
          code: 'NETWORK_ERROR',
        } as QueryError;
      }
      console.error('💥 Unknown Error:', error);
      throw {
        message: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
      } as QueryError;
    }
  }

  async getNodeDetails(nodeId: string): Promise<GraphNode> {
    const query = `FOR node IN ANY SHORTEST_PATH 'root' TO '${nodeId}' GRAPH 'cidoc_graph' RETURN node`;
    const result = await this.queryGraph(query);
    return result.nodes.find(n => n.id === nodeId) || {
      id: nodeId,
      label: 'Unknown Node',
      type: 'unknown',
      properties: {},
    };
  }

  async getRelatedNodes(nodeId: string, depth: number = 1): Promise<ArangoQueryResponse> {
    const query = `
      FOR v, e, p IN 1..${depth} ANY '${nodeId}'
        GRAPH 'cidoc_graph'
        RETURN {
          nodes: UNION_DISTINCT([v]),
          edges: UNION_DISTINCT([e])
        }
    `;
    return this.queryGraph(query);
  }
}

/**
 * n8n can return a variety of payload shapes:
 * - `[{ result: [...] }]` (common for n8n webhook)
 * - `{ result: [...] }`
 * - `{ nodes: [...], edges: [...] }` (legacy)
 *
 * This function normalizes all of them into `{ nodes, edges, rows }`.
 */
function normalizeArangoResponse(payload: any): ArangoQueryResponse {
  const rows = extractRows(payload);

  // If rows already contain graph-shaped items, merge them.
  const graphFromRows = mergeGraphFromRows(rows);

  // If payload is already in graph format, accept it as well.
  const directGraph = isGraphPayload(payload)
    ? {
        nodes: (payload.nodes || []).map(toGraphNode),
        edges: (payload.edges || []).map(toGraphEdge),
      }
    : null;

  const nodes = uniqueById([...(directGraph?.nodes ?? []), ...(graphFromRows.nodes ?? [])]);
  const edges = uniqueEdges([...(directGraph?.edges ?? []), ...(graphFromRows.edges ?? [])]);

  // If no graph structure was detected but rows look like documents, represent them as nodes.
  const fallbackNodes = nodes.length === 0 && edges.length === 0
    ? rows
        .filter(r => r && typeof r === 'object')
        .map(toGraphNode)
    : [];

  return {
    nodes: fallbackNodes.length ? uniqueById(fallbackNodes) : nodes,
    edges,
    rows,
    raw: payload,
  };
}

function extractRows(payload: any): any[] {
  if (Array.isArray(payload)) {
    // Common n8n format: [{ result: [...] }]
    if (payload.length === 1 && payload[0] && typeof payload[0] === 'object' && Array.isArray(payload[0].result)) {
      return payload[0].result;
    }

    // Sometimes payload is directly an array of rows
    return payload;
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.result)) return payload.result;
    if (Array.isArray(payload.rows)) return payload.rows;
  }

  return [];
}

function isGraphPayload(payload: any): payload is { nodes: any[]; edges: any[] } {
  return Boolean(payload && typeof payload === 'object' && Array.isArray(payload.nodes) && Array.isArray(payload.edges));
}

function mergeGraphFromRows(rows: any[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const mergedNodes: GraphNode[] = [];
  const mergedEdges: GraphEdge[] = [];

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;

    // Traversal query format: { nodes: [v], edges: [e] }
    const maybeNodes = Array.isArray((row as any).nodes) ? (row as any).nodes : null;
    const maybeEdges = Array.isArray((row as any).edges) ? (row as any).edges : null;

    if (maybeNodes) mergedNodes.push(...maybeNodes.map(toGraphNode));
    if (maybeEdges) mergedEdges.push(...maybeEdges.map(toGraphEdge));
  }

  return {
    nodes: uniqueById(mergedNodes),
    edges: uniqueEdges(mergedEdges),
  };
}

function toGraphNode(doc: any): GraphNode {
  const id = doc?.id ?? doc?._id ?? String(doc?._key ?? doc?.key ?? 'unknown');
  const type = doc?.type ?? (typeof doc?._id === 'string' ? doc._id.split('/')[0] : 'unknown');
  const label =
    doc?.label ??
    doc?.P1 ??
    doc?.name ??
    doc?.title ??
    (typeof doc?.content === 'string' ? doc.content.slice(0, 80) : undefined) ??
    id;

  return {
    id,
    type,
    label,
    properties: doc && typeof doc === 'object' ? doc : { value: doc },
  };
}

function toGraphEdge(edge: any): GraphEdge {
  const from = edge?.from ?? edge?._from ?? '';
  const to = edge?.to ?? edge?._to ?? '';
  const label =
    edge?.label ??
    edge?.type ??
    (typeof edge?._id === 'string' ? edge._id.split('/')[0] : '') ??
    '';

  return {
    from,
    to,
    label,
    properties: edge && typeof edge === 'object' ? edge : { value: edge },
  };
}

function uniqueById(items: GraphNode[]): GraphNode[] {
  const map = new Map<string, GraphNode>();
  for (const item of items) {
    if (!item?.id) continue;
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
}

function uniqueEdges(items: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  const out: GraphEdge[] = [];
  for (const e of items) {
    const key = `${e.from}::${e.to}::${e.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export type { GraphNode, GraphEdge, ArangoQueryResponse, QueryError };
export default ArangoService;