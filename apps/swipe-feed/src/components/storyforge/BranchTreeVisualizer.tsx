/**
 * Branch Tree Visualizer - Interactive visualization of story branches
 */

import React, { useEffect, useRef, useState } from 'react';
import type { StoryBranch } from '../../lib/storyforge/types';

interface BranchTreeVisualizerProps {
  branches: StoryBranch[];
  selectedBranch: StoryBranch | null;
  onSelectBranch: (branch: StoryBranch) => void;
  onCreateBranch: () => void;
}

interface TreeNode {
  branch: StoryBranch;
  x: number;
  y: number;
  children: TreeNode[];
}

export const BranchTreeVisualizer: React.FC<BranchTreeVisualizerProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  onCreateBranch
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    buildTree();
  }, [branches]);

  useEffect(() => {
    drawTree();
  }, [treeData, selectedBranch, hoveredNode, zoom, pan]);

  const buildTree = () => {
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create nodes
    branches.forEach(branch => {
      const node: TreeNode = {
        branch,
        x: 0,
        y: 0,
        children: []
      };
      nodeMap.set(branch.id, node);
    });

    // Build tree structure
    branches.forEach(branch => {
      const node = nodeMap.get(branch.id)!;
      if (branch.parentId) {
        const parent = nodeMap.get(branch.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Calculate positions
    const levelHeight = 120;
    const nodeWidth = 200;
    
    const calculatePositions = (node: TreeNode, x: number, y: number, level: number) => {
      node.x = x;
      node.y = y;

      if (node.children.length > 0) {
        const totalWidth = node.children.length * nodeWidth;
        const startX = x - totalWidth / 2 + nodeWidth / 2;

        node.children.forEach((child, index) => {
          calculatePositions(
            child,
            startX + index * nodeWidth,
            y + levelHeight,
            level + 1
          );
        });
      }
    };

    // Position root nodes
    const totalRootWidth = roots.length * nodeWidth * 2;
    const startX = 400;
    roots.forEach((root, index) => {
      calculatePositions(root, startX + index * nodeWidth * 2, 50, 0);
    });

    setTreeData(roots);
  };

  const drawTree = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    const drawConnections = (node: TreeNode) => {
      node.children.forEach(child => {
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y + 40);
        ctx.lineTo(child.x, child.y - 40);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(child.y - node.y - 80, child.x - node.x);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(child.x, child.y - 40);
        ctx.lineTo(
          child.x - arrowLength * Math.cos(angle - Math.PI / 6),
          child.y - 40 - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(child.x, child.y - 40);
        ctx.lineTo(
          child.x - arrowLength * Math.cos(angle + Math.PI / 6),
          child.y - 40 - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();

        drawConnections(child);
      });
    };

    treeData.forEach(drawConnections);

    // Draw nodes
    const drawNode = (node: TreeNode) => {
      const isSelected = selectedBranch?.id === node.branch.id;
      const isHovered = hoveredNode?.branch.id === node.branch.id;

      // Node background
      ctx.fillStyle = isSelected 
        ? '#a855f720' 
        : isHovered 
          ? '#ffffff10' 
          : '#ffffff05';
      ctx.strokeStyle = isSelected 
        ? '#a855f7' 
        : isHovered 
          ? '#ffffff40' 
          : '#ffffff20';
      ctx.lineWidth = isSelected ? 2 : 1;

      // Draw rounded rectangle
      const width = 180;
      const height = 80;
      const radius = 12;
      const x = node.x - width / 2;
      const y = node.y - height / 2;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Title (truncate if too long)
      const title = node.branch.title.length > 20 
        ? node.branch.title.substring(0, 20) + '...' 
        : node.branch.title;
      ctx.fillText(title, node.x, node.y - 10);

      // Metadata
      ctx.fillStyle = '#ffffff60';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`${node.branch.metadata.genre} • ${node.branch.metadata.wordCount} words`, node.x, node.y + 10);

      // Quality indicator
      const quality = node.branch.continuityState.consistency_score;
      ctx.fillStyle = quality > 80 ? '#10b981' : quality > 60 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(x + 5, y + height - 10, (width - 10) * (quality / 100), 3);

      // Draw children
      node.children.forEach(drawNode);
    };

    treeData.forEach(drawNode);

    ctx.restore();

    // Draw minimap
    drawMinimap(ctx);
  };

  const drawMinimap = (ctx: CanvasRenderingContext2D) => {
    const minimapWidth = 200;
    const minimapHeight = 150;
    const margin = 20;
    const scale = 0.1;

    // Minimap background
    ctx.fillStyle = '#00000080';
    ctx.fillRect(
      ctx.canvas.width - minimapWidth - margin,
      margin,
      minimapWidth,
      minimapHeight
    );

    // Draw mini nodes
    ctx.save();
    ctx.translate(ctx.canvas.width - minimapWidth - margin, margin);
    ctx.scale(scale, scale);

    const drawMiniNode = (node: TreeNode) => {
      ctx.fillStyle = selectedBranch?.id === node.branch.id ? '#a855f7' : '#ffffff40';
      ctx.fillRect(node.x - 5, node.y - 5, 10, 10);
      node.children.forEach(drawMiniNode);
    };

    treeData.forEach(drawMiniNode);

    // Draw viewport indicator
    ctx.strokeStyle = '#ffffff60';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -pan.x / zoom / scale,
      -pan.y / zoom / scale,
      ctx.canvas.width / zoom / scale,
      ctx.canvas.height / zoom / scale
    );

    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Check for node hover
    let foundNode: TreeNode | null = null;
    const checkNode = (node: TreeNode) => {
      const nodeWidth = 180;
      const nodeHeight = 80;
      if (
        x >= node.x - nodeWidth / 2 &&
        x <= node.x + nodeWidth / 2 &&
        y >= node.y - nodeHeight / 2 &&
        y <= node.y + nodeHeight / 2
      ) {
        foundNode = node;
      }
      node.children.forEach(checkNode);
    };

    treeData.forEach(checkNode);
    setHoveredNode(foundNode);

    // Change cursor
    canvas.style.cursor = foundNode ? 'pointer' : isDragging ? 'grabbing' : 'grab';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      onSelectBranch(hoveredNode.branch);
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  return (
    <div className="relative h-full bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-black/80 border border-white/10 rounded-xl p-3 space-y-2">
        <button
          onClick={() => setZoom(1)}
          className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
        >
          Reset Zoom
        </button>
        <button
          onClick={() => setPan({ x: 0, y: 0 })}
          className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
        >
          Center View
        </button>
        <div className="text-xs text-white/40 pt-2 border-t border-white/10">
          <p>Scroll: Zoom</p>
          <p>Drag: Pan</p>
          <p>Click: Select</p>
        </div>
      </div>

      {/* Selected Branch Info */}
      {selectedBranch && (
        <div className="absolute bottom-4 left-4 right-4 max-w-md bg-black/80 border border-white/10 rounded-xl p-4">
          <h3 className="font-medium mb-2">{selectedBranch.title}</h3>
          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {selectedBranch.content.substring(0, 150)}...
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateBranch}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm transition-all"
            >
              Branch from here
            </button>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>{selectedBranch.metadata.wordCount} words</span>
              <span>Quality: {selectedBranch.continuityState.consistency_score}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/80 border border-white/10 rounded-xl p-3 text-xs">
        <p className="text-white/60 mb-2">Quality Indicators:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"/>
            <span>High (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"/>
            <span>Medium (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"/>
            <span>Low (&lt;60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
