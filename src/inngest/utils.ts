import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflow/execution.workflow",
    data,
    id: createId(),
  });
};
