import { createClient } from "@/shared/services/supabase/supabase.server";
import { PendingApprovalCard } from "@/features/auth/components/PendingApprovalCard";

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PendingApprovalCard email={user?.email} />;
}
