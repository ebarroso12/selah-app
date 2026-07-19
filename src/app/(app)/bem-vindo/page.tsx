import type { Metadata } from "next";
import { BemVindoClient } from "./BemVindoClient";

export const metadata: Metadata = {
  title: "Bem-vindo ao SELAH",
};

export default function BemVindoPage() {
  return <BemVindoClient />;
}
