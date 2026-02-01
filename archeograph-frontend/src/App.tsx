import React, { useState, useEffect } from 'react';
import GraphVisualization from './components/GraphVisualization';
import QueryPanel from './components/QueryPanel';
import IngestData from './components/IngestData';
import DatabaseResults from './components/DatabaseResults';
import ProjectInfo from './components/ProjectInfo';
import ArangoService from './services/arangoService';
import type { GraphNode, GraphEdge, ArangoQueryResponse, QueryError } from './services/arangoService';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<QueryError | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [_hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [_rawResponse, setRawResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'aql' | 'node' | 'ai'>('aql');
  const [activeMainTab, setActiveMainTab] = useState<'ingest' | 'explore' | 'project'>('explore');
  const [selectedDatabaseItem, setSelectedDatabaseItem] = useState<any>(null);
  const [databaseResults, setDatabaseResults] = useState<Record<string, any[]>>({});

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

  const handleNodeClick = React.useCallback((nodeId: string) => {
    setNodes(prevNodes => {
      const clickedNode = prevNodes.find(node => node.id === nodeId) || null;
      setSelectedNode(clickedNode);
      return prevNodes;
    });
    // Automatically switch to node details tab when a node is selected
    setActiveTab('node');
  }, []);

  const handleNodeHover = React.useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

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
        <div className="flex flex-col lg:flex-row gap-2 flex-1 min-h-0">
          <section className="lg:flex-[2] min-h-0 min-w-0">
            <div className="border border-slate-200 bg-white flex flex-col h-full">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200">
                <div className="flex h-full">
                  <button
                    onClick={() => setActiveMainTab('ingest')}
                    className={`px-5 py-4 text-sm font-semibold border-r border-slate-200 transition-colors ${
                      activeMainTab === 'ingest'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Ingest Data
                  </button>
                  <button
                    onClick={() => setActiveMainTab('explore')}
                    className={`px-5 py-4 text-sm font-semibold border-r border-slate-200 transition-colors ${
                      activeMainTab === 'explore'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Explore Graph
                  </button>
                  <button
                    onClick={() => setActiveMainTab('project')}
                    className={`px-5 py-4 text-sm font-semibold border-r border-slate-200 transition-colors ${
                      activeMainTab === 'project'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Project Info
                  </button>
                </div>

                <div className="flex items-center gap-2 px-5">
                  <div className="hidden sm:block text-xs text-slate-500">
                    {isLoading ? 'Updating…' : 'Ready'}
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
                {activeMainTab === 'project' ? (
                  <ProjectInfo />
                ) : activeMainTab === 'explore' ? (
                  isLoading && !nodes.length && !edges.length ? (
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
                  )
                ) : (
                  <DatabaseResults
                    onItemSelect={(item) => {
                      setSelectedDatabaseItem(item);
                    }}
                    results={databaseResults}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="lg:flex-[1] min-h-0 min-w-0">
            <div className="border border-slate-200 bg-white flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {activeMainTab === 'project' ? 'Project Information' : activeMainTab === 'explore' ? 'Query & Document Panel' : 'Ingestion Controls'}
                  </h2>
                </div>
              </div>

              <div className="p-4 flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
                {activeMainTab === 'project' ? (
                  <div className="flex-1 min-h-0">
                    {/* Project Info content is in the left panel, this can be empty or contain related controls */}
                  </div>
                ) : activeMainTab === 'explore' ? (
                  <>
                    <div className={activeTab === 'ai' ? "flex-1 min-h-0" : "shrink-0"}>
                      <QueryPanel
                        onQuerySubmit={handleQuerySubmit}
                        isLoading={isLoading}
                        error={error}
                        activeTab={activeTab}
                        onActiveTabChange={setActiveTab}
                        selectedNode={selectedNode}
                        onCloseNodeDetails={() => setSelectedNode(null)}
                      />
                    </div>
                  </>
                ) : (
                  <IngestData
                    onAddToGraph={(item) => {
                      // Remove from database results
                      setDatabaseResults(prev => {
                        const newResults = { ...prev };
                        if (newResults[item.source]) {
                          newResults[item.source] = newResults[item.source].filter(i => i.id !== item.id);
                        }
                        return newResults;
                      });
                      // Clear selected item
                      setSelectedDatabaseItem(null);
                    }}
                    onItemSelect={(item) => {
                      console.log('Item selected in IngestData:', item);
                    }}
                    onResultsReceived={(source, items, isNewQuery) => {
                      // If it's a new query (single source or first of multiple), clear previous results
                      // If it's adding to existing results (multiple sources), accumulate
                      setDatabaseResults(prev => {
                        if (isNewQuery) {
                          // Clear all previous results for new query
                          return {
                            [source]: items
                          };
                        } else {
                          // Accumulate results for multiple sources
                          return {
                            ...prev,
                            [source]: items
                          };
                        }
                      });
                    }}
                    selectedItem={selectedDatabaseItem}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;