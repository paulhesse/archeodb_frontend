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
      color: {
        background: '#000000',
        border: '#000000',
        highlight: {
          background: '#333333',
          border: '#333333',
        },
      },
      shape: 'dot',
      size: 15,
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
        color: '#000000',
        highlight: '#333333',
      },
      width: 1,
      arrows: {
        to: {
          enabled: true,
          type: 'arrow',
        },
      },
    }));

    // Create network
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        nodes: {
          font: {
            size: 11,
            face: 'Arial, sans-serif',
            color: '#000000',
          },
          borderWidth: 1,
          borderWidthSelected: 1,
        },
        edges: {
          font: {
            size: 10,
            face: 'Arial, sans-serif',
            color: '#000000',
          },
          smooth: {
            enabled: true,
            type: 'dynamic',
            roundness: 0.5,
          },
          arrowStrikethrough: false,
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
        layout: {
          hierarchical: false,
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


export default GraphVisualization;