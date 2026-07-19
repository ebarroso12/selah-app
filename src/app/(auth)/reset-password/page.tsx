import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 glow-gold">
          <div className="text-center mb-8">
            <p className="selah-wordmark mb-1">SELAH</p>
          </div>
          <div className="flex justify-center py-8">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(201,162,39,0.3)", borderTopColor: "#c9a227" }}
            />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
