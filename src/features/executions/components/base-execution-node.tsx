"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
  icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    name,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.filter((node) => node.id !== id);
        return updatedNodes;
      });

      setEdges((currentEdges) => {
        const updatedEdges = currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );
        return updatedEdges;
      });
    };

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
      >
        <NodeStatusIndicator status={status} variant="border">
          <BaseNode status={status} onDoubleClick={onDoubleClick}>
            <BaseNodeContent>
              {typeof Icon === "string" ? (
                <Image src={Icon} alt={name} width={16} height={16} />
              ) : (
                <Icon className="size-4 text-muted-foreground" />
              )}
              {children}
              <BaseHandle
                id="target-1"
                type="target"
                position={Position.Left}
              />
              <BaseHandle
                id="source-1"
                type="source"
                position={Position.Right}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

BaseExecutionNode.displayName = "BaseExecutionNode";

/*
 * ===== BaseExecutionNode kya karta hai? =====
 * Ye ek common "template" component hai jo har execution node (HTTP Request, etc.) ka
 * same UI aur behaviour deta hai, taaki har node ko ye sab dobara na likhna pade.
 * Specific node (jaise HttpRequestNode) bas icon, name, description, status aur
 * onSettings pass karta hai, baaki kaam ye karta hai.
 *
 * Andar kya hota hai:
 *   1. handleDelete:
 *      - setNodes se is node (id) ko nodes array se hata deta hai
 *      - setEdges se is node se judi saari edges (source ya target = id) hata deta hai,
 *        taaki koi edge hawa mein latki na rahe
 *      - Ye sirf browser state (ReactFlow store / editor ka useState) badalta hai,
 *        DB mein tab jaayega jab user Save karega
 *
 *   2. UI layers (bahar se andar):
 *      WorkflowNode         -> node ke upar toolbar (name/description, Settings aur Delete buttons)
 *      NodeStatusIndicator  -> status ("initial" | "loading" | "success" | "error") ke hisaab se border
 *      BaseNode             -> node ka box, double click pe onDoubleClick (usually settings dialog kholna)
 *      BaseNodeContent      -> andar ka content:
 *         - Icon: string ho toh <Image> (e.g. "/logos/xyz.svg"), warna Lucide icon component
 *         - children: specific node agar kuch extra dikhana chahe
 *         - BaseHandle target (Left)  -> yahan pichhle node ki edge aake judti hai (input)
 *         - BaseHandle source (Right) -> yahan se agle node ki taraf edge nikalti hai (output)
 *
 * memo: props same rahe toh component dobara render nahi hota (performance).
 * displayName: memo ke andar anonymous function hai, isliye React DevTools mein
 * sahi naam dikhane ke liye displayName set kiya hai.
 */
