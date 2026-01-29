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
  const onNodeClickRef = useRef(onNodeClick);
  const onNodeHoverRef = useRef(onNodeHover);

  // Update refs when props change to avoid re-triggering the main useEffect
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  useEffect(() => {
    onNodeHoverRef.current = onNodeHover;
  }, [onNodeHover]);

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
      font: {
        color: '#333333',
      },
      chosen: {
        node: true,
        label: (values: any, _id: any, selected: boolean) => {
          if (selected) {
            values.color = '#ffffff';
          }
        },
      },
      shape: 'circle',
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
      dashes: false,
    }));

    // Create network
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      {
        nodes: {
          shape: 'circle',
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
          hover: true,
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -80000,
            centralGravity: 0.3,
            springLength: 220,
            springConstant: 0.18,
            damping: 0.4,
            avoidOverlap: 0.1,
          },
          minVelocity: 0.75,
          solver: 'barnesHut',
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 100,
            onlyDynamicEdges: false,
            fit: true,
          },
        },
      }
    );

    // Store network reference
    networkRef.current = network;

    // Event handlers
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        onNodeClickRef.current?.(params.nodes[0]);
      }
    });

    network.on('hoverNode', (params) => {
      onNodeHoverRef.current?.(params.node);
    });

    network.on('blurNode', () => {
      onNodeHoverRef.current?.(null);
    });

    return () => {
      network.destroy();
    };
  }, [nodes, edges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        id="mynetwork"
        style={{ width: '100%', height: '100%', minHeight: '400px', border: '1px solid lightgray' }}
      />
    </div>
  );
};

export default GraphVisualization;
