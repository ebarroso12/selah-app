import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
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
              Criar Conta
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
      <RegisterForm />
    </Suspense>
  );
}
