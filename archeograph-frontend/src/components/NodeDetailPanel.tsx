import React from 'react';
import type { GraphNode } from '../services/arangoService';

interface NodeDetailPanelProps {
  selectedNode: GraphNode | null;
  onClose: () => void;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  selectedNode,
  onClose,
}) => {
  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <span className="text-sm">Select a node to view details</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">Node Details</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
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

          {Object.keys(selectedNode.properties).length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Properties</h4>
              <div className="space-y-2 text-xs">
                {Object.entries(selectedNode.properties).map(([key, value]) => {
                  const displayValue = typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value);

                  return (
                    <div key={key} className="flex gap-2">
                      <span className="w-24 font-semibold text-slate-900">{key}:</span>
                      <span className="flex-1 font-mono text-slate-600 break-all">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
