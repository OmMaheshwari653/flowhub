import { polarClient } from "@/lib/polar";

/**
 * Creates the Polar customer for a user, tolerating the cases where one
 * already exists for that email (manual signup first, OAuth later) or where
 * the customer outlived its user row. Never throws: a billing hiccup must not
 * block sign-in.
 */
export async function ensurePolarCustomer(user: {
  id: string;
  email: string;
  name?: string | null;
}) {
  try {
    const existing = await polarClient.customers.list({
      email: user.email,
      limit: 1,
    });
    const match = existing.result.items[0];

    if (match) {
      if (match.externalId !== user.id) {
        await polarClient.customers.update({
          id: match.id,
          customerUpdate: { externalId: user.id },
        });
      }
      return;
    }

    await polarClient.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      externalId: user.id,
    });
  } catch (error) {
    console.error("[polar] failed to ensure customer", user.email, error);
  }
}
