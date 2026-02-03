import React from 'react';

interface DatabaseItem {
  id: string;
  name: string;
  type: string;
  source: string;
  properties: Record<string, any>;
}

interface DatabaseResultsProps {
  onItemSelect: (item: DatabaseItem) => void;
  results?: Record<string, DatabaseItem[]>;
  selectedSources?: string[];
}

const DatabaseResults: React.FC<DatabaseResultsProps> = ({ 
  onItemSelect, 
  results: propResults,
  selectedSources: propSelectedSources
}) => {
  // Use props if provided, otherwise use mock data
  const defaultResults: Record<string, DatabaseItem[]> = {
    arango: [
      { id: '1', name: 'Ancient Pottery', type: 'Artifact', source: 'arango', properties: { period: 'Bronze Age', location: 'Crete' } },
      { id: '2', name: 'Roman Coin', type: 'Artifact', source: 'arango', properties: { period: 'Roman Empire', material: 'Bronze' } },
      { id: '3', name: 'Egyptian Papyrus', type: 'Document', source: 'arango', properties: { period: 'Ptolemaic', language: 'Greek' } }
    ],
    neo4j: [
      { id: '4', name: 'Greek Vase', type: 'Artifact', source: 'neo4j', properties: { period: 'Classical', location: 'Athens' } },
      { id: '5', name: 'Medieval Manuscript', type: 'Document', source: 'neo4j', properties: { period: 'Middle Ages', language: 'Latin' } }
    ]
  };

  const databaseResults: Record<string, DatabaseItem[]> = propResults || defaultResults;
  const selectedSources = propSelectedSources || Object.keys(databaseResults);

  const getSourceName = (id: string) => {
    switch (id) {
      case 'arango': return 'ArangoDB';
      case 'neo4j': return 'Neo4j';
      case 'postgres': return 'PostgreSQL';
      case 'mongodb': return 'MongoDB';
      case 'perseus': return 'Perseus';
      case 'arachne': return 'Arachne';
      default: return id.charAt(0).toUpperCase() + id.slice(1);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 border border-slate-200 rounded overflow-hidden">
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">Database Results</h3>
        <p className="text-xs text-slate-500">
          Showing results from: {selectedSources.map(s => getSourceName(s)).join(', ')}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {selectedSources.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No sources selected
          </div>
        ) : selectedSources.map((source) => {
          const items = databaseResults[source] || [];
          if (items.length === 0) return null;

          return (
            <div key={source} className="border-b border-slate-200 last:border-b-0">
              <div className="px-3 py-2 bg-slate-100 text-xs font-medium text-slate-700 border-b border-slate-200">
                {getSourceName(source)} ({items.length} items)
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((item: DatabaseItem) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer group"
                    onClick={() => onItemSelect(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                            {item.type}
                          </span>
                          <h4 className="text-sm font-medium text-slate-900 truncate">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {Object.entries(item.properties)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' • ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatabaseResults;
