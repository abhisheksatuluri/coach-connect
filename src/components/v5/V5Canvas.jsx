import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import V5Node from './V5Node';
import V5ClientNode from './V5ClientNode';
import V5SessionNode from './V5SessionNode';
import V5JourneyNode from './V5JourneyNode';
import V5TaskNode from './V5TaskNode';
import V5StepNode from './V5StepNode';
import V5NotebookNode from './V5NotebookNode';
import V5KnowledgeBaseNode from './V5KnowledgeBaseNode';
import V5PaymentNode from './V5PaymentNode';
import V5PractitionerNode from './V5PractitionerNode';
import V5Connection from './V5Connection';
import V5ContextMenu from './V5ContextMenu';

export default function V5Canvas({ nodes, connections, onNodeSelect, onNodeDoubleClick, onNodeMove, onContextMenu, contextMenu, onCloseContextMenu, onContextAction, zoom }) {
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    // Dragging Logic
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    // --- Interaction Handlers ---

    const handleMouseDown = (e) => {
        // If left click on canvas background, start Panning
        if (e.button === 0 && e.target === canvasRef.current) {
            setIsPanning(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
            if (contextMenu) onCloseContextMenu(); // Close menu if open
        }
    };

    const handleNodeMouseDown = (e, nodeId, nodeX, nodeY) => {
        // Start dragging a node
        if (e.button === 0) {
            e.stopPropagation(); // Prevent canvas pan
            setDraggingNodeId(nodeId);

            // Calculate offset from node top-left to mouse position to keep it relative
            // But for simplicity in this coord system, we can just track mouse delta
            setLastMousePos({ x: e.clientX, y: e.clientY });
            onNodeSelect(nodeId); // Auto select on drag start
            if (contextMenu) onCloseContextMenu();
        }
    };

    const handleMouseMove = (e) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        } else if (draggingNodeId) {
            const dx = (e.clientX - lastMousePos.x) / zoom; // Adjust for zoom
            const dy = (e.clientY - lastMousePos.y) / zoom;

            // Update node position via parent callback
            const node = nodes.find(n => n.id === draggingNodeId);
            if (node) {
                onNodeMove(draggingNodeId, node.x + dx, node.y + dy);
            }

            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setDraggingNodeId(null);
    };

    const handleWheel = (e) => {
        if (!e.ctrlKey) {
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        // Right click on canvas - maybe general menu? For now ignore or standard
    };

    // --- Rendering ---

    const gridStyle = {
        backgroundImage: 'radial-gradient(#E2E8F0 2px, transparent 2px)',
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        backgroundColor: '#F8FAFC'
    };

    const renderNode = (node) => {
        const commonProps = {
            key: node.id,
            id: node.id,
            x: node.x,
            y: node.y,
            selected: node.selected,
            onSelect: onNodeSelect,
            onDoubleClick: onNodeDoubleClick,
            // Pass drag handler
            onMouseDown: (e) => handleNodeMouseDown(e, node.id, node.x, node.y),
            onContextMenu: (e) => {
                e.preventDefault();
                e.stopPropagation();
                onContextMenu(e, node.id, node.type);
            }
        };

        const SpecificNode = {
            client: V5ClientNode,
            session: V5SessionNode,
            journey: V5JourneyNode,
            task: V5TaskNode,
            step: V5StepNode,
            note: V5NotebookNode,
            knowledge: V5KnowledgeBaseNode,
            payment: V5PaymentNode,
            practitioner: V5PractitionerNode
        }[node.type] || V5Node;

        return <SpecificNode {...commonProps} data={node.data || node} />;
    };

    return (
        <div
            className={cn("w-full h-full overflow-hidden relative", isPanning ? "cursor-grabbing" : "cursor-grab")}
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
            style={gridStyle}
        >
            {/* Transform Container */}
            <div
                className="absolute origin-top-left will-change-transform"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
            >
                {/* Connections */}
                <svg className="absolute overflow-visible pointer-events-none z-0" style={{ left: 0, top: 0 }}>
                    {/* Using SVG for better lines than div-layer if we wanted, but keeping div structure for now to match previous V5Connection style if it's div-based. 
                         Actually V5Connection is likely SVG based or absolute div. Let's keep previous loop structure but inside a container suitable for z-index
                     */}
                </svg>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {connections.map(conn => {
                        const startNode = nodes.find(n => n.id === conn.from);
                        const endNode = nodes.find(n => n.id === conn.to);
                        if (!startNode || !endNode) return null;

                        const getDimensions = (type) => {
                            switch (type) {
                                case 'client': return { w: 200, h: 100 };
                                case 'session': return { w: 180, h: 80 };
                                case 'journey': return { w: 220, h: 90 };
                                case 'task': return { w: 160, h: 60 };
                                case 'step': return { w: 120, h: 40 };
                                case 'note': return { w: 160, h: 70 };
                                case 'knowledge': return { w: 180, h: 80 };
                                case 'payment': return { w: 160, h: 70 };
                                case 'practitioner': return { w: 200, h: 90 };
                                default: return { w: 220, h: 100 };
                            }
                        };
                        const startDim = getDimensions(startNode.type);
                        const endDim = getDimensions(endNode.type);

                        return (
                            <V5Connection
                                key={conn.id}
                                startX={startNode.x + startDim.w}
                                startY={startNode.y + (startDim.h / 2)}
                                endX={endNode.x}
                                endY={endNode.y + (endDim.h / 2)}
                            />
                        );
                    })}
                </div>

                {/* Nodes */}
                <div className="z-10 relative">
                    {nodes.map(node => renderNode(node))}
                </div>
            </div>

            {/* Context Menu Overlay */}
            {contextMenu && (
                <V5ContextMenu
                    {...contextMenu}
                    onClose={onCloseContextMenu}
                    onAction={onContextAction}
                />
            )}

            {/* Debug Info */}
            <div className="absolute bottom-4 right-4 text-[10px] text-stone-300 pointer-events-none select-none">
                Pan: {Math.round(pan.x)}, {Math.round(pan.y)} | Zoom: {zoom.toFixed(2)}
            </div>
        </div>
    );
}
