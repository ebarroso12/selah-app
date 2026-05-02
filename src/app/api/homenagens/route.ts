import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const formData = await req.formData();

    const nomeHomenageante = formData.get("nomeHomenageante") as string;
    const igHomenageante = formData.get("igHomenageante") as string;
    const nomeHomenageado = formData.get("nomeHomenageado") as string;
    const parentesco = formData.get("parentesco") as string;
    const igHomenageado = formData.get("igHomenageado") as string;
    const ehLegendario = formData.get("ehLegendario") as string;
    const numeroLegendario = formData.get("numeroLegendario") as string;
    const texto = formData.get("texto") as string;
    const fotoCapa = Number(formData.get("fotoCapa") ?? 0);

    if (texto.length > 2000) {
      return NextResponse.json({ error: "Texto ultrapassa 2.000 caracteres." }, { status: 400 });
    }

    // Upload das fotos para o Supabase Storage
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

    // Salvar no banco
    const { error: dbError } = await supabase.from("homenagens").insert({
      user_id: user.id,
      nome_homenageante: nomeHomenageante,
      instagram_homenageante: igHomenageante,
      nome_homenageado: nomeHomenageado,
      parentesco,
      instagram_homenageado: igHomenageado || null,
      eh_legendario: ehLegendario === "sim",
      numero_legendario: numeroLegendario ? Number(numeroLegendario) : null,
      texto,
      fotos: fotoUrls,
      foto_capa: fotoCapa,
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
