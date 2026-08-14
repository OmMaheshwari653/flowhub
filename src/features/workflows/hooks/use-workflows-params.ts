import { useQueryStates } from "nuqs";
//useQueryStates is a hook that takes a params object and returns a stateful object that can be used to manage the params in the component. The stateful object will have the same shape as the params object, but with additional methods for updating the params and resetting them to their default values.
import { workflowsParams } from "../params";

export const useWorkflowsParams = () => {
  return useQueryStates(workflowsParams);
};
