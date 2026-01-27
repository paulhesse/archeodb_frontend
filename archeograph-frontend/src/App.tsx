import React, { useState, useEffect } from 'react';
import GraphVisualization from './components/GraphVisualization';
import QueryInterface from './components/QueryInterface';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Archaeo<span className="text-indigo-600">Graph</span>
            </h1>
            <p className="text-xs text-slate-500">
              CIDOC CRM Knowledge Graph explorer
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {hoveredNode ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 ring-1 ring-inset ring-indigo-200">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Hovering: <span className="font-mono">{hoveredNode}</span>
              </span>
            ) : (
              <span className="text-slate-500">Hover a node to preview</span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-inset ring-slate-200">
              {nodes.length} nodes • {edges.length} edges
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-4">
            <QueryInterface
              onQuerySubmit={handleQuerySubmit}
              isLoading={isLoading}
              error={error}
            />
          </section>

          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur shadow-sm mb-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Knowledge Graph
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pan/zoom with mouse, use navigation buttons, click node for details.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    {showDebugPanel ? 'Hide' : 'Show'} Debug
                  </button>
                  <div className="hidden sm:block text-xs text-slate-500">
                    {isLoading ? 'Updating…' : 'Ready'}
                  </div>
                </div>
              </div>

              {showDebugPanel && rawResponse && (
                <div className="border-t border-slate-200/60 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Raw Response Data</h3>
                  <div className="bg-slate-800 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-60">
                    <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Knowledge Graph
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pan/zoom with mouse, use navigation buttons, click node for details.
                  </p>
                </div>

                <div className="hidden sm:block text-xs text-slate-500">
                  {isLoading ? 'Updating…' : 'Ready'}
                </div>
              </div>

              <div className="p-4">
                {isLoading && !nodes.length && !edges.length ? (
                  <div className="flex flex-col justify-center items-center h-96">
                    <div className="loading-spinner" />
                    <p className="mt-4 text-sm text-slate-600">Loading graph data…</p>
                  </div>
                ) : (
                  <div className="relative">
                    <GraphVisualization
                      nodes={nodes}
                      edges={edges}
                      onNodeClick={handleNodeClick}
                      onNodeHover={handleNodeHover}
                    />

                    {selectedNode && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">Node details</h3>
                            <p className="text-xs text-slate-500">Click another node to update.</p>
                          </div>
                          <button
                            onClick={() => setSelectedNode(null)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Close
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
                          <div className="space-y-1">
                            <p><span className="font-semibold">ID:</span> <span className="font-mono text-xs">{selectedNode.id}</span></p>
                            <p><span className="font-semibold">Type:</span> {selectedNode.type}</p>
                            <p><span className="font-semibold">Label:</span> {selectedNode.label}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700 mb-2">Properties</h4>
                            <ul className="space-y-1 text-xs text-slate-700">
                              {Object.entries(selectedNode.properties).map(([key, value]) => (
                                <li key={key} className="flex gap-2">
                                  <span className="min-w-28 font-semibold text-slate-900">{key}:</span>
                                  <span className="font-mono text-[11px] text-slate-600 break-all">{JSON.stringify(value)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/60 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          ArchaeoGraph • CIDOC CRM Knowledge Graph • © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default App;