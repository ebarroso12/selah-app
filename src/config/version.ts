/**
 * Versão do app — fonte única de verdade.
 *
 * REGRA: toda atualização publicada em produção DEVE incrementar esta versão.
 * Esquema: v1.0 → v1.1 → ... → v1.9 → v2.0 → v2.1 → ...
 *
 * O cliente compara a versão embutida no bundle com a do servidor
 * (/api/version). Quando divergem, o menu mostra o botão de atualização.
 */
export const APP_VERSION = "1.6";
