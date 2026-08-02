import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const page = async () => {
  await requireAuth();

  const data = await caller.getUsers();
  return (
    <div className="min-h-screen flex items-center justify-center">
      Protected
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default page;
