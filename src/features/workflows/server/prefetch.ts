import { inferInput } from "@trpc/tanstack-react-query"; // similar to returntype but for input types instead of return types
import { trpc, prefetch } from "@/trpc/server";

type Input = inferInput<typeof trpc.workflows.getMany>;

export const prefetchWorkflows = (params: Input) => {
  prefetch(trpc.workflows.getMany.queryOptions(params));
};

export const prefetchWorkflow = (id: string) => {
  prefetch(trpc.workflows.getOne.queryOptions({ id }));
};
