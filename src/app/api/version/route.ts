import { NextResponse } from "next/server";
import { APP_VERSION } from "@/config/version";

export const dynamic = "force-dynamic";

/** Versão atual publicada — o cliente compara com a versão do bundle. */
export async function GET() {
  return NextResponse.json(
    { version: APP_VERSION },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
