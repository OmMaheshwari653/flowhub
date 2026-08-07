import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";
export const authClient = createAuthClient({
  // The base URL of your auth server
  baseURL: "http://localhost:3000",
  plugins: [polarClient()],
});
