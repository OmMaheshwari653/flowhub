"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useMemo, useState } from "react";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useSetAtom } from "jotai";
import { editorAtom } from "@/features/editor/store/atoms";
import {
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  ReactFlow,
  Background,
  Controls,
  Panel,
  MiniMap,
} from "@xyflow/react";
import { NodeType } from "@/generated/prisma/browser";
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { ExecuteWorkflowButton } from "./execute-workflow-button";

export const EditorLoading = () => {
  return <LoadingView message="Loading workflow..." />;
};

export const EditorError = () => {
  return <ErrorView message="Failed to load workflow" />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const setEditor = useSetAtom(editorAtom);

  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    // useCallback is used to memoize the function and prevent unnecessary re-renders. here useCallback renders the function only when the setNodes function changes which is never because setNodes is a stable function provided by React's useState hook.
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    // [] means that the function will only be created once and will not change on re-renders.
    [],
  );

  const onConnect = useCallback((params: Connection) => {
    setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
  }, []);

  const hasManualTrigger = useMemo(() => {
    // useMemo is used to memoize the result of the function and prevent unnecessary re-computations. here useMemo will only recompute the value when the nodes array changes.
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        onInit={setEditor} //onInit is a callback function that is called when the ReactFlow component is initialized. here we are setting the editorAtom to the instance of the ReactFlow component so that we can access it from other components.
        fitView // fitview ka matlab ki zoom level automatically adjust ho jaye taki saare nodes screen pe fit ho jaye.
        snapGrid={[10, 10]} // snapGrid ka matlab ki jab bhi koi node ko move karein to wo grid ke according move ho. yaha 10,10 ka matlab ki 10px ke grid pe snap hoga.
        snapToGrid
        panOnScroll // panOnScroll ka matlab ki jab bhi user scroll karein to canvas bhi move ho jaye
        panOnDrag={false}
        selectionOnDrag // selectionOnDrag ka matlab ki jab bhi user drag karein to wo select ho jaye.
      >
        <Background />
        {/* Background ka matlab ki canvas ke background me grid dikhaye. ye optional hai.*/}
        <Controls />
        {/* Controls ka matlab ki canvas ke upar zoom in, zoom out,
        fit view, etc. ke buttons dikhaye. ye optional hai. */}
        <MiniMap />
        <Panel position="top-right">
          {/* Panel ka matlab ki canvas ke upar ek panel dikhaye jisme hum
          buttons ya koi bhi custom components dikhaye. ye optional hai. */}
          <AddNodeButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecuteWorkflowButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
