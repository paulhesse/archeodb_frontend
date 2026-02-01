import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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
  onResultsReceived?: (source: string, items: DatabaseItem[], isNewQuery: boolean) => void;
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
    { id: 'opencontext', name: 'Open Context', checked: false },
    { id: 'arango', name: 'ArangoDB', checked: false },
    { id: 'neo4j', name: 'Neo4j', checked: false },
    { id: 'postgres', name: 'PostgreSQL', checked: false },
    { id: 'mongodb', name: 'MongoDB', checked: false }
  ]);
  const [activeTab, setActiveTab] = useState<'query' | 'details'>('query');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DatabaseItem | null>(null);
  
  // Spatial filter state
  const [useSpatialFilter, setUseSpatialFilter] = useState<boolean>(false);
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);

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
    if (useSpatialFilter && bbox) {
      console.log('Spatial filter (bbox):', bbox);
    }

    if (selectedSources.includes('arachne') || selectedSources.includes('perseus') || selectedSources.includes('opencontext')) {
      setIsIngesting(true);

      // Track if this is the first source being processed (new query)
      let isFirstSource = true;

      // Process each selected source individually
      for (const sourceId of selectedSources) {
        if (sourceId === 'perseus' || sourceId === 'opencontext' || sourceId === 'arachne') {
<task_progress>
- [x] Analyze the query interface and data source selection logic
- [x] Examine how results from different sources are combined
- [x] Identify the root cause of the issue
- [x] Implement a fix for the problem
- [x] Update parsing logic for new unified data format
- [x] Fix result count calculation
- [x] Test the solution
- [x] Investigate result accumulation issue
- [x] Fix result clearing between queries
- [ ] Handle both single and multiple source scenarios correctly
</task_progress>
          const isPerseus = sourceId === 'perseus';
          const isOpenContext = sourceId === 'opencontext';
          const sourceName = isPerseus ? 'Perseus' : isOpenContext ? 'Open Context' : 'Arachne';
          const endpoint = isPerseus
            ? 'https://n8n.paulserver.dpdns.org/webhook/perseus/search'
            : isOpenContext
              ? 'https://n8n.paulserver.dpdns.org/webhook/opencontext/search'
              : 'https://n8n.paulserver.dpdns.org/webhook/3feff6fc-49e5-407d-91eb-9ceeed08aac7';

          console.log(`Sending request to ${sourceName} webhook...`);
          try {
            const url = new URL(endpoint);
            url.searchParams.append('query', query);
            url.searchParams.append('count', resultCount.toString());

            if (useSpatialFilter && bbox) {
              url.searchParams.append('minLat', bbox[0].toString());
              url.searchParams.append('minLng', bbox[1].toString());
              url.searchParams.append('maxLat', bbox[2].toString());
              url.searchParams.append('maxLng', bbox[3].toString());
            }

            const response = await fetch(url.toString(), {
              method: 'GET',
              mode: 'cors',
            });

            console.log('Response status:', response.status);
            if (response.ok) {
              const data = await response.json().catch(() => ({}));
              console.log(`${sourceName} ingestion started successfully:`, data);

              // Parse results based on the unified data format (same for all sources)
              let results: DatabaseItem[] = [];

              // All sources now return the same format as OpenContext
              if (data && Array.isArray(data) && data.length > 0) {
                results = data.map((item: any) => {
                  // Get the first property as the display name
                  const firstKey = Object.keys(item)[0];
                  const displayName = item[firstKey] || 'Unknown Item';

                  // Create properties object from all item data
                  const properties: Record<string, any> = {...item};

                  // Determine source for the item
                  const itemSource = isPerseus ? 'perseus' : isOpenContext ? 'opencontext' : 'arachne';

                  return {
                    id: item.uri || item.href || Math.random().toString(),
                    name: displayName,
                    type: item['item category'] || 'Document',
                    source: itemSource,
                    properties: {
                      ...properties,
                      original_data: item
                    }
                  };
                });
              }

              if (results.length > 0 && onResultsReceived) {
                onResultsReceived(isPerseus ? 'perseus' : isOpenContext ? 'opencontext' : 'arachne', results, isFirstSource);
              }

              // After processing the first source, subsequent sources should accumulate
              isFirstSource = false;

              const resultCount = Array.isArray(data) ? data.length : 0;
              alert(`${sourceName} query successful! Found ${resultCount} items.`);
            } else {
              const errorText = await response.text().catch(() => 'No error detail');
              console.error(`${sourceName} ingestion failed to start:`, response.status, errorText);
              alert(`Failed to start ingestion: ${response.status} ${errorText}`);
            }
          } catch (error) {
            console.error(`Error starting ${sourceName} ingestion:`, error);
            alert(`Error starting ingestion: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      setIsIngesting(false);
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

  // Internal component to handle map events
  const MapEvents = ({ onBoundsChange }: { onBoundsChange: (bounds: [number, number, number, number]) => void }) => {
    const map = useMapEvents({
      moveend: () => {
        const bounds = map.getBounds();
        onBoundsChange([
          bounds.getSouth(),
          bounds.getWest(),
          bounds.getNorth(),
          bounds.getEast()
        ]);
      },
    });

    // Initialize bounds on mount
    useEffect(() => {
      const bounds = map.getBounds();
      onBoundsChange([
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast()
      ]);
    }, [map, onBoundsChange]);

    return null;
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
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {activeTab === 'query' ? (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <form onSubmit={handleQuerySubmit} className="space-y-4">
              <div>
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

              <div className="flex gap-4">
                <div className="flex-1">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={useSpatialFilter}
                      onChange={(e) => setUseSpatialFilter(e.target.checked)}
                      className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Spatial Filter</span>
                  </label>
                </div>
              </div>

              {useSpatialFilter && (
                <div className="space-y-2">
                  <div className="h-80 rounded-md overflow-hidden border border-slate-300 z-0">
                    <MapContainer 
                      center={[37.9838, 23.7275]} // Athens as default
                      zoom={5} 
                      scrollWheelZoom={true}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapEvents onBoundsChange={setBbox} />
                      {bbox && (
                        <Rectangle 
                          bounds={[[bbox[0], bbox[1]], [bbox[2], bbox[3]]]} 
                          pathOptions={{ color: 'rgb(15, 23, 42)', weight: 2, fillOpacity: 0.1 }}
                        />
                      )}
                    </MapContainer>
                  </div>
                  {bbox && (
                    <div className="text-[10px] text-slate-500 flex justify-between px-1">
                      <span>Lat: {bbox[0].toFixed(4)} to {bbox[2].toFixed(4)}</span>
                      <span>Lng: {bbox[1].toFixed(4)} to {bbox[3].toFixed(4)}</span>
                    </div>
                  )}
                </div>
              )}

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
          <div className="flex-1 min-h-0 border border-slate-200 rounded flex flex-col">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Item Details</h3>
              <p className="text-xs text-slate-500">Details of the selected item</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar">
              {selectedItem ? (
                <div className="space-y-4">
                  {/* Thumbnail Image - displayed if available */}
                  {selectedItem.properties.thumbnail && (
                    <div className="mb-4">
                      <img
                        src={selectedItem.properties.thumbnail}
                        alt={selectedItem.name}
                        className="max-w-full h-auto max-h-[500px] object-contain border border-slate-200 rounded-md grayscale"
                        style={{ filter: 'grayscale(100%) brightness(0.9) contrast(1.1)' }}
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

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
