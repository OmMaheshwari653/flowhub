import { requireAuth } from "@/lib/auth-utils";

const page = async () => {
  await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      Protected
    </div>
  );
};

export default page;
