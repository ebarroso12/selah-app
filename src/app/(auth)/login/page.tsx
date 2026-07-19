import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 glow-gold">
          <div className="text-center mb-8">
            <p className="selah-wordmark mb-1">SELAH</p>
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)" }}
            >
              Pause · Ore · Cresça
            </p>
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
      <LoginForm />
    </Suspense>
  );
}
