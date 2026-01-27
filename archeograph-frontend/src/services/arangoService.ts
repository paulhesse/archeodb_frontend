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
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: `Query failed with status ${response.status}`,
          code: response.status.toString(),
          details: errorData,
        } as QueryError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw {
          message: error.message,
          code: 'NETWORK_ERROR',
        } as QueryError;
      }
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

export type { GraphNode, GraphEdge, ArangoQueryResponse, QueryError };
export default ArangoService;