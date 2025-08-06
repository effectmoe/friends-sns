'use client';

import { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';

interface FriendMapProps {
  nodes: Array<{
    id: string;
    label: string;
    x?: number;
    y?: number;
    size?: number;
    color?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    addedAt?: string;
  }>;
  currentUserId: string;
}

export default function FriendMap({ nodes, edges, currentUserId }: FriendMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create graph
    const graph = new Graph();

    // Add nodes
    nodes.forEach((node) => {
      graph.addNode(node.id, {
        label: node.label,
        x: node.x || Math.random(),
        y: node.y || Math.random(),
        size: node.id === currentUserId ? 15 : 10,
        color: node.id === currentUserId ? '#3b82f6' : '#6b7280',
      });
    });

    // Add edges
    edges.forEach((edge) => {
      try {
        graph.addEdge(edge.source, edge.target, {
          size: 2,
          color: '#e5e7eb',
        });
      } catch (e) {
        // Edge already exists or nodes don't exist
      }
    });

    // Apply layout
    circular.assign(graph);
    forceAtlas2.assign(graph, {
      iterations: 50,
      settings: {
        gravity: 1,
        scalingRatio: 10,
        barnesHutOptimize: true,
      },
    });

    // Create Sigma instance
    sigmaRef.current = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
    });

    // Cleanup
    return () => {
      sigmaRef.current?.kill();
      graph.clear();
    };
  }, [nodes, edges, currentUserId]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-white rounded-lg shadow-sm"
      style={{ minHeight: '600px' }}
    />
  );
}