export { KairoChat } from "./components/KairoChat";
export { KairoHeader } from "./components/KairoHeader";
export { KairoBubble, KairoTypingIndicator } from "./components/KairoBubble";
export { useKairoChat } from "./hooks/useKairoChat";
export { KAIRO_SYSTEM_PROMPT } from "./prompts/kairo.system";
export type { KairoMessage, KairoSendResult } from "./services/kairo.service";
// sendMessage é server-only — importar diretamente de "./services/kairo.service" nas API routes
