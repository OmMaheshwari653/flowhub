import Login from "@/features/auth/components/Login";
import { requireUnauth } from "@/lib/auth-utils";

const page = async () => {
  await requireUnauth();
  return <Login />;
};

export default page;
