import { createLoader } from "nuqs/server";
// createLoader is a utility function that takes a params object and returns a loader function that can be used to load the params from  the request context. The loader function will parse the params from the request context and return them as an object.

import { workflowsParams } from "../params";

export const workflowsParamsLoader = createLoader(workflowsParams);
