import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/services/supabase/supabase.server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const formData = await req.formData();

    const autorNome = formData.get("autorNome") as string;
    const autorInstagram = formData.get("autorInstagram") as string | null;
    const autorLendarioNumero = formData.get("autorLendarioNumero") as string | null;
    const homenageadoNome = formData.get("homenageadoNome") as string;
    const homenageadoParentesco = formData.get("homenageadoParentesco") as string;
    const homenageadoInstagram = formData.get("homenageadoInstagram") as string | null;
    const homenageadoLegendario = formData.get("homenageadoLegendario") === "true";
    const texto = formData.get("texto") as string;
    const fotoCapa = Number(formData.get("fotoCapa") ?? 0);

    if (!autorNome || !homenageadoNome || !homenageadoParentesco || !texto) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
    }
    if (texto.length > 2000) {
      return NextResponse.json({ error: "Texto ultrapassa 2.000 caracteres." }, { status: 400 });
    }

    const fotoUrls: string[] = [];
    for (let i = 0; i < 2; i++) {
      const file = formData.get(`foto${i}`) as File | null;
      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `homenagens/${user.id}/${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("public-assets")
          .upload(path, file, { contentType: file.type, upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("public-assets").getPublicUrl(path);
          fotoUrls.push(urlData.publicUrl);
        }
      }
    }

    const { error: dbError } = await supabase.from("homenagens").insert({
      user_id: user.id,
      autor_nome: autorNome,
      autor_instagram: autorInstagram || null,
      autor_legendario_numero: autorLendarioNumero ? Number(autorLendarioNumero) : null,
      homenageado_nome: homenageadoNome,
      homenageado_parentesco: homenageadoParentesco,
      homenageado_instagram: homenageadoInstagram || null,
      homenageado_legendario: homenageadoLegendario,
      texto,
      fotos: fotoUrls,
      foto_capa_index: fotoCapa,
      status: "pending",
    });

    if (dbError) {
      console.error("Erro ao salvar homenagem:", dbError);
      return NextResponse.json({ error: "Erro ao salvar homenagem." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro na API homenagens:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
