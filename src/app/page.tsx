import { caller } from "@/trpc/server";
import { Button } from "@/components/ui/button";

const page = async () => {
  const users = await caller.getUsers();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button>Click me </Button>
      <p>{users.length} users found.</p>
    </div>
  );
};

export default page;
