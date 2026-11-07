import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  // Pinned to sandbox: the available POLAR_ACCESS_TOKEN is a sandbox token.
  // Switch to "production" only together with a production token AND
  // production product IDs in src/lib/auth.ts.
  server: "sandbox",
});
