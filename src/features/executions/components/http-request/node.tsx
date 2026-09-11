"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { HTTP_REQUEST_CHANNEL_NAME } from "@/inngest/channels/http-request";
import { fetchHttpRequestRealtimeToken } from "./actions";
import { HttpRequestDialog, HttpRequestFormValues } from "./dialog";
import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";

type HttpRequestNodeData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

/*
 * ===== Node<T> kya hai? =====
 * Node ek generic type hai (ReactFlow ka). T ek khaali jagah hai jo sirf `data` ka type decide karti hai.
 * Ye sirf TypeScript type hai, runtime pe koi value add nahi hoti.
 *
 * WITHOUT T  ->  Node
 *   {
 *     id: string;
 *     position: { x: number; y: number };
 *     type?: string;
 *     data: Record<string, unknown>;   // data kuch bhi ho sakta hai, autocomplete nahi milega
 *   }
 *
 * WITH T  ->  Node<HttpRequestNodeData>
 *   {
 *     id: string;
 *     position: { x: number; y: number };
 *     type?: string;
 *     data: {                          // T ki jagah HttpRequestNodeData aa gaya
 *       variableName?: string;
 *       endpoint?: string;
 *       method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
 *       body?: string;
 *     };
 *   }
 */
type HttpRequestNodeType = Node<HttpRequestNodeData>;

/*
 * ===== props kaha se aata hai? =====
 * `props` koi keyword nahi, bas function ke parameter ka naam hai (kuch bhi naam de sakte ho).
 * Ye props hum khud nahi dete, ReactFlow deta hai:
 *
 *   DB (Prisma) -> workflows/server/router.ts (getOne, nodes.map)
 *     -> useSuspenseWorkflow -> editor.tsx: useState(nodes)
 *     -> <ReactFlow nodes={nodes} nodeTypes={nodeComponents} />
 *     -> config/node-components.ts: nodeComponents[node.type]
 *     -> HttpRequestNode(props)
 *
 * ReactFlow andar se aisa call karta hai:
 *   <HttpRequestNode id={node.id} data={node.data} type={node.type} selected={...} dragging={...} />
 *
 * props.id   = nodes array mein us node ki id (DB wali id)
 * props.data = us node ka data (HttpRequestNodeData shape)
 *
 * props read-only hai. Data badalna ho toh setNodes se `nodes` state update karo,
 * phir ReactFlow naye props ke saath component dobara render karega.
 * Note: HttpRequestNode ko config/node-components.ts mein register karna zaroori hai, warna ye render nahi hoga.
 */
export const HttpRequestNode = (props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow(); //useReactFlow hook to get the setNodes function, which allows us to update the nodes in the flow.

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HTTP_REQUEST_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken, //fetchHttpRequestRealtimeToken function to get a new subscription token for the HTTP request channel and status topic.
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: HttpRequestFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not configured";

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
};
