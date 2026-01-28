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
        background: '#ffffff',
        border: '#d6d9d8',
        highlight: {
          background: '#333333',
          border: '#333333',
        },
      },
      shape: 'dot',
      size: 25,
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
        inherit: 'both',
      },
      width: 0.15,
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
          shape: 'dot',
          scaling: {
            min: 10,
            max: 30,
          },
          font: {
            size: 12,
            face: 'Tahoma',
          },
        },
        edges: {
          color: { inherit: 'both' },
          width: 0.15,
          smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0.5,
          },
        },
        interaction: {
          hideEdgesOnDrag: true,
          tooltipDelay: 200,
        },
        physics: false,
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
    <div>
      <h2>Static smooth curves - World Cup Network</h2>

      <div
        ref={containerRef}
        id="mynetwork"
        style={{ width: 800, height: 800, border: '1px solid lightgray' }}
      />
    </div>
  );
};

export default GraphVisualization;