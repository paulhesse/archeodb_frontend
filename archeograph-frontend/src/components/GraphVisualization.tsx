import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import type { GraphNode, GraphEdge } from '../services/arangoService';

interface GraphVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeClick,
  onNodeHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert nodes to vis format
    const visNodes = nodes.map(node => ({
      id: node.id,
      label: node.label || node.id,
      title: `${node.type}\n${Object.entries(node.properties)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}`,
      color: getNodeColor(node.type),
      shape: 'dot',
      size: 20,
    }));

    // Convert edges to vis format
    const visEdges = edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: edge.label,
      title: `${edge.label}\n${Object.entries(edge.properties)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}`,
      color: {
        color: '#9ca3af',
        highlight: '#6b7280',
      },
      width: 1,
    }));

    // Create network
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        nodes: {
          font: {
            size: 12,
            face: 'Inter',
          },
          borderWidth: 1,
          borderWidthSelected: 2,
        },
        edges: {
          font: {
            size: 10,
            face: 'Inter',
          },
          smooth: {
            enabled: true,
            type: 'dynamic',
            roundness: 0.5,
          },
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -80000,
            springConstant: 0.04,
            springLength: 200,
            avoidOverlap: 0.5,
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50,
          },
        },
        interaction: {
          hover: true,
          navigationButtons: true,
          keyboard: true,
        },
      }
    );

    // Store network reference
    networkRef.current = network;

    // Event handlers
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        onNodeClick?.(params.nodes[0]);
      }
    });

    network.on('hoverNode', (params) => {
      onNodeHover?.(params.node);
    });

    network.on('blurNode', () => {
      onNodeHover?.(null);
    });

    return () => {
      network.destroy();
    };
  }, [nodes, edges, onNodeClick, onNodeHover]);

  return (
    <div
      ref={containerRef}
      className="graph-container w-full h-full"
    />
  );
};

// Helper function to get node color based on type
function getNodeColor(type: string): string {
  const typeColors: Record<string, string> = {
    'E22_HumanMadeObject': '#4f46e5', // Artifacts
    'E53_Place': '#10b981',          // Places
    'E39_Actor': '#f59e0b',          // People/Actors
    'E65_Creation': '#ef4444',       // Events
    'E31_Document': '#8b5cf6',       // Documents
    'default': '#6b7280',            // Default color
  };

  return typeColors[type] || typeColors.default;
}

export default GraphVisualization;