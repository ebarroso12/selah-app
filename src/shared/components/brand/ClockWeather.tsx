"use client";

import { useEffect, useState } from "react";

const FRANCA_LAT = -20.5386;
const FRANCA_LON = -47.4008;
const WEATHER_REFRESH_MS = 20 * 60 * 1000;
const CLOCK_TICK_MS = 30 * 1000;

/** Códigos WMO (Open-Meteo) reduzidos a emoji + rótulo em pt-BR */
function describeWeather(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Céu limpo" };
  if (code <= 2) return { icon: "🌤️", label: "Poucas nuvens" };
  if (code === 3) return { icon: "☁️", label: "Nublado" };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Neblina" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", label: "Garoa" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", label: "Chuva" };
  if (code >= 71 && code <= 77) return { icon: "❄️", label: "Neve" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", label: "Pancadas de chuva" };
  if (code >= 85 && code <= 86) return { icon: "❄️", label: "Pancadas de neve" };
  if (code >= 95) return { icon: "⛈️", label: "Trovoada" };
  return { icon: "🌡️", label: "" };
}

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

interface WeatherState {
  temp: number;
  icon: string;
  label: string;
}

export function ClockWeather({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherState | null>(null);

  useEffect(() => {
    setTime(timeFormatter.format(new Date()));
    const tick = setInterval(() => setTime(timeFormatter.format(new Date())), CLOCK_TICK_MS);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${FRANCA_LAT}&longitude=${FRANCA_LON}&current=temperature_2m,weather_code&timezone=America%2FSao_Paulo`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const temp = data.current?.temperature_2m;
        const code = data.current?.weather_code;
        if (!cancelled && typeof temp === "number" && typeof code === "number") {
          const { icon, label } = describeWeather(code);
          setWeather({ temp: Math.round(temp), icon, label });
        }
      } catch {
        // sem internet ou serviço fora do ar — widget simplesmente não mostra o clima
      }
    }

    loadWeather();
    const interval = setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!time) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs ${className}`}
      style={{ color: "var(--text-subtle)", fontFamily: "var(--font-inter)" }}
      title="Franca, São Paulo"
    >
      <span style={{ color: "var(--gold-label)" }}>{time}</span>
      {weather && (
        <>
          <span aria-hidden style={{ opacity: 0.5 }}>·</span>
          <span>
            {weather.icon} {weather.temp}°C
          </span>
          <span aria-hidden style={{ opacity: 0.5 }}>·</span>
          <span>Franca-SP</span>
        </>
      )}
    </div>
  );
}
