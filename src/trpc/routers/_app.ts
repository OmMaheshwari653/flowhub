import { createTRPCRouter } from "../init";
import { WorkflowsRouter } from "@/features/workflows/server/router";
import { credentialsRouter } from "@/features/credentials/server/router";
import { executionsRouter } from "@/features/executions/server/router";

export const appRouter = createTRPCRouter({
  workflows: WorkflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
