import React, { useState } from 'react';
import type { GraphNode } from '../services/arangoService';

interface NodeDetailPanelProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  selectedNode,
  onClose,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'basic-info': true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <span className="text-sm">Select a node to view details</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Node Details</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Basic Information Section */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('basic-info')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100"
            >
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Basic Information</span>
              <span className="text-slate-400">
                {openSections['basic-info'] ? '▼' : '▶'}
              </span>
            </button>

            {openSections['basic-info'] && (
              <div className="p-4 border-t border-slate-200">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">ID:</span>
                    <span className="ml-2 font-mono text-slate-600">{selectedNode.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Type:</span>
                    <span className="ml-2 text-slate-600">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-slate-100 border border-slate-200">
                        {selectedNode.type}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Label:</span>
                    <span className="ml-2 text-slate-600">{selectedNode.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Properties Section */}
          {Object.keys(selectedNode.properties).length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('properties')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100"
              >
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Properties</span>
                <span className="text-slate-400">
                  {openSections['properties'] ? '▼' : '▶'}
                </span>
              </button>

              {openSections['properties'] && (
                <div className="p-4 border-t border-slate-200">
                  <div className="space-y-3 text-sm">
                    {Object.entries(selectedNode.properties).map(([key, value]) => {
                      const displayValue = typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value);

                      return (
                        <div key={key} className="flex gap-3">
                          <span className="w-32 font-semibold text-slate-900">{key}:</span>
                          <span className="flex-1 font-mono text-xs text-slate-600 break-all">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description Section (if available) */}
          {selectedNode.properties.description && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('description')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100"
              >
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Description</span>
                <span className="text-slate-400">
                  {openSections['description'] ? '▼' : '▶'}
                </span>
              </button>

              {openSections['description'] && (
                <div className="p-4 border-t border-slate-200">
                  <div className="prose text-sm text-slate-700 max-w-none">
                    {String(selectedNode.properties.description)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
