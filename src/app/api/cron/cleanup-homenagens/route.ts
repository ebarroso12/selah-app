/**
 * Cleanup cron — homenagens com mais de 30 dias após aprovação.
 *
 * Para cada homenagem aprovada com approved_at < now() - 30d:
 *   1. Extrai os paths dos arquivos a partir das URLs em `fotos`
 *   2. Apaga os arquivos do bucket `public-assets`
 *   3. Apaga a linha do banco
 *
 * Autenticação: Bearer CRON_SECRET (Vercel Cron).
 * Agendado em vercel.json (diário).
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/shared/services/supabase/supabase.server";

export const dynamic = "force-dynamic";

const RETENTION_DAYS = 30;
const BUCKET = "public-assets";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cleanup-homenagens] CRON_SECRET não configurado");
    return false;
  }
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Dado uma URL pública do Supabase Storage, extrai o path interno do bucket.
 * Ex: https://xxx.supabase.co/storage/v1/object/public/public-assets/homenagens/abc/123.jpg
 *  -> homenagens/abc/123.jpg
 */
function urlToStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function handle(): Promise<NextResponse> {
  try {
    const supabase = await createServiceClient();
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString();

    const { data: expired, error: selectError } = await supabase
      .from("homenagens")
      .select("id, fotos, approved_at")
      .eq("status", "approved")
      .lt("approved_at", cutoff);

    if (selectError) {
      console.error("[cleanup-homenagens] select:", selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (!expired || expired.length === 0) {
      return NextResponse.json({ deleted: 0, files_removed: 0 });
    }

    const allPaths: string[] = [];
    for (const row of expired) {
      const fotos = (row.fotos ?? []) as string[];
      for (const url of fotos) {
        const path = urlToStoragePath(url);
        if (path) allPaths.push(path);
      }
    }

    let filesRemoved = 0;
    if (allPaths.length > 0) {
      const { data: removed, error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove(allPaths);
      if (storageError) {
        console.error("[cleanup-homenagens] storage.remove:", storageError);
      } else {
        filesRemoved = removed?.length ?? 0;
      }
    }

    const ids = expired.map((r) => r.id);
    const { error: deleteError } = await supabase
      .from("homenagens")
      .delete()
      .in("id", ids);

    if (deleteError) {
      console.error("[cleanup-homenagens] delete:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      deleted: ids.length,
      files_removed: filesRemoved,
      cutoff,
    });
  } catch (err) {
    console.error("[cleanup-homenagens] unexpected:", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return handle();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return handle();
}
