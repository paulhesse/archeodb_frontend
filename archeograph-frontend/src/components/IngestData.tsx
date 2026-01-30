import React, { useState } from 'react';

interface DatabaseSource {
  id: string;
  name: string;
  checked: boolean;
}

interface DatabaseItem {
  id: string;
  name: string;
  type: string;
  source: string;
  properties: Record<string, any>;
}

interface IngestDataProps {
  onAddToGraph: (item: DatabaseItem) => void;
  onItemSelect: (item: DatabaseItem) => void;
  onResultsReceived?: (source: string, items: DatabaseItem[]) => void;
  selectedItem?: DatabaseItem | null;
}

const IngestData: React.FC<IngestDataProps> = ({ 
  onAddToGraph, 
  onItemSelect, 
  onResultsReceived,
  selectedItem: propSelectedItem 
}) => {
  const [query, setQuery] = useState<string>('');
  const [resultCount, setResultCount] = useState<number>(10);
  const [databaseSources, setDatabaseSources] = useState<DatabaseSource[]>([
    { id: 'perseus', name: 'Perseus', checked: true },
    { id: 'arachne', name: 'Arachne', checked: false },
    { id: 'arango', name: 'ArangoDB', checked: false },
    { id: 'neo4j', name: 'Neo4j', checked: false },
    { id: 'postgres', name: 'PostgreSQL', checked: false },
    { id: 'mongodb', name: 'MongoDB', checked: false }
  ]);
  const [activeTab, setActiveTab] = useState<'query' | 'details'>('query');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);

  // Update local state when prop changes
  React.useEffect(() => {
    setSelectedItem(propSelectedItem || null);
    if (propSelectedItem) {
      setActiveTab('details');
    }
  }, [propSelectedItem]);

  const handleSourceToggle = (sourceId: string) => {
    setDatabaseSources(prevSources =>
      prevSources.map(source =>
        source.id === sourceId ? { ...source, checked: !source.checked } : source
      )
    );
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSources = databaseSources.filter(s => s.checked).map(s => s.id);
    
    console.log('Query submitted:', query);
    console.log('Selected sources:', selectedSources);
    console.log('Result count:', resultCount);

    if (selectedSources.includes('arachne') || selectedSources.includes('perseus')) {
      setIsIngesting(true);
      const isPerseus = selectedSources.includes('perseus');
      const sourceName = isPerseus ? 'Perseus' : 'Arachne';
      const endpoint = isPerseus 
        ? 'https://n8n.paulserver.dpdns.org/webhook/perseus/search'
        : 'https://n8n.paulserver.dpdns.org/webhook/3feff6fc-49e5-407d-91eb-9ceeed08aac7';

      console.log(`Sending request to ${sourceName} webhook...`);
      try {
        const url = new URL(endpoint);
        url.searchParams.append('query', query);
        url.searchParams.append('count', resultCount.toString());

        const response = await fetch(url.toString(), {
          method: 'GET',
          mode: 'cors',
        });

        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          console.log(`${sourceName} ingestion started successfully:`, data);
          
          // Parse results if they exist in the response
          if (data && Array.isArray(data) && data.length > 0 && data[0].result) {
            const results: DatabaseItem[] = data[0].result.map((r: any) => ({
              id: r._id || r._key || Math.random().toString(),
              name: r.title || r.author || 'Unknown Item',
              type: r.author ? 'Literature' : 'Document',
              source: isPerseus ? 'perseus' : 'arachne',
              properties: {
                author: r.author,
                title: r.title,
                text_preview: r.text_content ? r.text_content.substring(0, 150) + '...' : undefined,
                chunk_id: r.chunk_id,
                ...r.metadata,
                original_data: r
              }
            }));
            
            if (onResultsReceived) {
              onResultsReceived(isPerseus ? 'perseus' : 'arachne', results);
            }
          }
          
          alert(`${sourceName} query successful! Found ${data[0]?.result?.length || 0} items.`);
        } else {
          const errorText = await response.text().catch(() => 'No error detail');
          console.error(`${sourceName} ingestion failed to start:`, response.status, errorText);
          alert(`Failed to start ingestion: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.error(`Error starting ${sourceName} ingestion:`, error);
        alert(`Error starting ingestion: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsIngesting(false);
      }
    }
  };

  const handleAddToGraph = async (item: DatabaseItem) => {
    console.log('Add to Graph clicked for item:', item);
    
    try {
      setIsIngesting(true);
      const response = await fetch('https://n8n.paulserver.dpdns.org/webhook/perseus/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.properties.original_data || item),
        mode: 'cors'
      });

      if (response.ok) {
        alert('Item successfully sent to ingestion!');
        onAddToGraph(item);
      } else {
        const errorText = await response.text().catch(() => 'No error detail');
        console.error('Ingestion failed:', response.status, errorText);
        alert(`Failed to send item to ingestion: ${response.status}`);
      }
    } catch (error) {
      console.error('Error in handleAddToGraph:', error);
      alert(`Error sending item to ingestion: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleItemSelect = (item: DatabaseItem) => {
    setSelectedItem(item);
    setActiveTab('details');
    onItemSelect(item);
  };

  const checkedSources = databaseSources.filter(source => source.checked);

  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('query')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'query'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Query
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'border-b-2 border-slate-600 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Item Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === 'query' ? (
          <div className="p-4 border-b border-slate-200 h-full">
            <form onSubmit={handleQuerySubmit} className="space-y-4 h-full flex flex-col">
              <div className="flex-1">
                <label htmlFor="ingest-query" className="block text-sm font-medium text-slate-700 mb-1">
                  Query
                </label>
                <textarea
                  id="ingest-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm h-24"
                  placeholder="Enter your query here..."
                />
              </div>

              <div>
                <label htmlFor="result-count" className="block text-sm font-medium text-slate-700 mb-1">
                  Count of Results
                </label>
                <input
                  id="result-count"
                  type="number"
                  min="1"
                  max="1000"
                  value={resultCount}
                  onChange={(e) => setResultCount(parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Data Sources</p>
                <div className="flex flex-wrap gap-4">
                  {databaseSources.map((source) => (
                    <label key={source.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={source.checked}
                        onChange={() => handleSourceToggle(source.id)}
                        className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                      />
                      <span className="text-sm text-slate-700">{source.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isIngesting}
                className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 self-end transition-colors ${
                  isIngesting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isIngesting ? 'Ingesting...' : 'Execute Ingestion'}
              </button>
            </form>
          </div>
        ) : null}

        {activeTab === 'details' ? (
          <div className="flex-1 min-h-0 border border-slate-200 rounded overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Item Details</h3>
              <p className="text-xs text-slate-500">Details of the selected item</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {selectedItem ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Basic Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedItem.name}</p>
                      <p><strong>Type:</strong> {selectedItem.type}</p>
                      <p><strong>Source:</strong> {selectedItem.source}</p>
                      <p><strong>ID:</strong> {selectedItem.id}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Properties</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedItem.properties).filter(([key]) => key !== 'original_data').length > 0 ? (
                        Object.entries(selectedItem.properties)
                          .filter(([key]) => key !== 'original_data')
                          .map(([key, value]) => (
                            <p key={key} className="break-all whitespace-pre-wrap overflow-hidden">
                              <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
                            </p>
                          ))
                      ) : (
                        <p className="text-slate-400">No properties available</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToGraph(selectedItem)}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    Add to Graph
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <span className="text-sm">Select an item from the results to view details</span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IngestData;
