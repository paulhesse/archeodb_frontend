import React, { useState, useEffect } from 'react';
import GraphVisualization from './components/GraphVisualization';
import QueryPanel from './components/QueryPanel';
import NodeDetailPanel from './components/NodeDetailPanel';
import ArangoService from './services/arangoService';
import type { GraphNode, GraphEdge, ArangoQueryResponse, QueryError } from './services/arangoService';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<QueryError | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [showDataPanel, setShowDataPanel] = useState<boolean>(false);
  const [showNodePanel, setShowNodePanel] = useState<boolean>(true);

  const arangoService = new ArangoService();

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Example initial query - adjust as needed
        const initialQuery = 'FOR v, e, p IN 1..1 ANY "root" GRAPH "cidoc_graph" RETURN {nodes: [v], edges: [e]}';
        const result = await arangoService.queryGraph(initialQuery);

        setNodes(result.nodes || []);
        setEdges(result.edges || []);
      } catch (err) {
        setError(err as QueryError);
        setNodes([]);
        setEdges([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleQuerySubmit = async (query: string): Promise<ArangoQueryResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await arangoService.queryGraph(query);
      setNodes(result.nodes || []);
      setEdges(result.edges || []);
      setRawResponse(result.raw);
      return result;
    } catch (err) {
      setError(err as QueryError);
      // Don't clear existing data on error
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    const clickedNode = nodes.find(node => node.id === nodeId) || null;
    setSelectedNode(clickedNode);
  };

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
  };

  return (
    // Root must be a flex column so the main area can take the remaining viewport height
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="max-w-8xl mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              ArchaeoGraph
            </h1>
            <p className="text-xs text-slate-500">
              CIDOC CRM Knowledge Graph explorer
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              {nodes.length} nodes • {edges.length} edges
            </span>
          </div>
        </div>
      </header>

      {/*
        Layout note:
        - body/#root are overflow-hidden; therefore the app must provide its own scroll containers.
        - main is flex-1 so it always fits the remaining viewport height under the header.
      */}
      <main className="max-w-8xl mx-auto w-full px-2 py-2 pb-6 flex flex-col flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 min-h-0">
          <section className="lg:col-span-2 h-full">
            <div className="border border-slate-200 bg-white flex flex-col h-full">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Knowledge Graph
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-xs text-slate-500">
                    {isLoading ? 'Updating…' : 'Ready'}
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 min-h-0 overflow-hidden">
                {isLoading && !nodes.length && !edges.length ? (
                  <div className="flex flex-col justify-center items-center h-full">
                    <div className="loading-spinner" />
                    <p className="mt-4 text-sm text-slate-600">Loading graph data…</p>
                  </div>
                ) : (
                  <GraphVisualization
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={handleNodeClick}
                    onNodeHover={handleNodeHover}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="lg:col-span-1 min-h-0">
            <div className="border border-slate-200 bg-white flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Query & Document Panel
                  </h2>
                </div>
              </div>

              <div className="p-4 flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
                <div className="shrink-0">
                  <QueryPanel
                    onQuerySubmit={handleQuerySubmit}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>

                <div className="flex-1 min-h-0 border border-slate-100 rounded flex flex-col overflow-hidden document-scroll-container">
                  <NodeDetailPanel
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNode(null)}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;