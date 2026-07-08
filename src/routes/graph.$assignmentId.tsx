import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { AppShell } from "@/components/app/shell";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { getSyllabusGraph } from "@/lib/api";
import type { SyllabusGraph } from "@/lib/api";
import ForceGraph2D from "react-force-graph-2d";

export const Route = createFileRoute("/graph/$assignmentId")({
  head: () => ({ meta: [{ title: "Knowledge Graph — TAAI" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    syllabusId: Number(search.syllabusId) || null,
  }),
  component: GraphPage,
});

type GraphNode = {
  id: string;
  name: string;
  entity_type: string;
  description: string;
  difficulty_level: string;
  week_or_unit: string;
  val: number;
};

const ENTITY_COLORS: Record<string, string> = {
  module: "#7c3aed",
  topic: "#22c55e",
  subtopic: "#34d399",
  concept: "#3b82f6",
  skill: "#f59e0b",
  default: "#8b5cf6",
};

function getNodeColor(entityType: string): string {
  return ENTITY_COLORS[entityType.toLowerCase()] || ENTITY_COLORS.default;
}

function GraphPage() {
  const { assignmentId } = Route.useParams();
  const { syllabusId: searchSyllabusId } = Route.useSearch();
  const id = Number(assignmentId);

  const [graph, setGraph] = useState<SyllabusGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<any>(null);

  // Get syllabus ID from search params or localStorage fallback
  const syllabusId = searchSyllabusId || (() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`taai_syllabus_${id}`);
    return stored ? Number(stored) : null;
  })();

  useEffect(() => {
    async function load() {
      if (!syllabusId) {
        setError("No course outline found. Please upload one first.");
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await getSyllabusGraph(id, syllabusId);
      if (result.error) setError(result.error);
      else if (result.data) setGraph(result.data.data);
      setLoading(false);
    }
    load();
  }, [syllabusId, id]);

  const entityTypes = graph ? [...new Set(graph.nodes.map((n) => n.entity_type))] : [];

  const filteredNodes = graph
    ? filter === "all"
      ? graph.nodes
      : graph.nodes.filter((n) => n.entity_type.toLowerCase() === filter.toLowerCase())
    : [];

  const filteredNodeNames = new Set(filteredNodes.map((n) => n.name));

  const filteredEdges = graph
    ? graph.edges.filter((e) => filteredNodeNames.has(e.source) && filteredNodeNames.has(e.target))
    : [];

  const graphData = {
    nodes: filteredNodes.map((n) => ({
      id: n.name,
      name: n.name,
      entity_type: n.entity_type,
      description: n.description,
      difficulty_level: n.difficulty_level,
      week_or_unit: n.week_or_unit,
      val: n.difficulty_level === "advanced" ? 8 : n.difficulty_level === "intermediate" ? 6 : 4,
    })),
    links: filteredEdges.map((e) => ({
      source: e.source,
      target: e.target,
      relationship_type: e.relationship_type,
      strength: e.strength,
      reason: e.reason,
    })),
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(2, 500);
    }
  }, []);

  const resetView = useCallback(() => {
    setSelectedNode(null);
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  }, []);

  if (loading) {
    return (
      <AppShell title="Knowledge Graph">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (error || !graph) {
    return (
      <AppShell title="Knowledge Graph">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-muted-foreground">{error || "No graph data available."}</p>
          <Link
            to="/assignments/$assignmentId"
            params={{ assignmentId: String(id) }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm hover:bg-accent transition cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Back to Assignment
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Knowledge Graph" subtitle={`${graph.nodes.length} topics · ${graph.edges.length} relationships`}>
      <div className="w-full h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link
              to="/assignments/$assignmentId"
              params={{ assignmentId: String(id) }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition cursor-pointer"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter:</span>
              <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All
                </button>
                {entityTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer capitalize ${filter === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Drag nodes · Scroll to zoom · Click to pin</span>
            <button onClick={resetView} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-accent transition cursor-pointer">
              <RotateCcw className="size-3" /> Reset view
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 rounded-lg border border-border bg-[#0f0f14] overflow-hidden relative">
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeLabel="name"
              nodeColor={(node: any) => getNodeColor(node.entity_type)}
              nodeVal={(node: any) => node.val}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name.length > 20 ? node.name.slice(0, 18) + "..." : node.name;
                const fontSize = 11 / globalScale;
                const nodeR = Math.sqrt(node.val) * 3;
                const color = getNodeColor(node.entity_type);

                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeR, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();

                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = "#e2e8f0";
                ctx.fillText(label, node.x, node.y + nodeR + 2);
              }}
              linkColor={() => "rgba(139, 92, 246, 0.3)"}
              linkWidth={(link: any) => Math.max(1, link.strength * 0.5)}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              backgroundColor="#0f0f14"
              cooldownTicks={100}
              warmupTicks={50}
            />
          </div>

          {selectedNode && (
            <div className="w-72 shrink-0 rounded-lg border border-border bg-card p-4 overflow-y-auto">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-sm">{selectedNode.name}</h3>
                <button onClick={() => setSelectedNode(null)} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                {selectedNode.entity_type && (
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize" style={{ backgroundColor: getNodeColor(selectedNode.entity_type) + "20", color: getNodeColor(selectedNode.entity_type) }}>
                      {selectedNode.entity_type}
                    </span>
                  </div>
                )}
                {selectedNode.difficulty_level && (
                  <div>
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="ml-2 capitalize">{selectedNode.difficulty_level}</span>
                  </div>
                )}
                {selectedNode.week_or_unit && (
                  <div>
                    <span className="text-muted-foreground">Week/Unit:</span>
                    <span className="ml-2">{selectedNode.week_or_unit}</span>
                  </div>
                )}
                {selectedNode.description && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Description:</span>
                    <p className="text-foreground/80 leading-relaxed">{selectedNode.description}</p>
                  </div>
                )}

                {filteredEdges.filter((e) => e.source === selectedNode.name || e.target === selectedNode.name).length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-1.5">Connections:</span>
                    <div className="space-y-1.5">
                      {filteredEdges
                        .filter((e) => e.source === selectedNode.name || e.target === selectedNode.name)
                        .map((e, i) => (
                          <div key={i} className="px-2 py-1.5 rounded bg-muted/50 text-[10px]">
                            <div className="font-medium">
                              {e.source === selectedNode.name ? `→ ${e.target}` : `← ${e.source}`}
                            </div>
                            <div className="text-muted-foreground capitalize">{e.relationship_type.replace(/_/g, " ")}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
