import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // The base URL of your auth server
  baseURL: "http://localhost:3000",
});
