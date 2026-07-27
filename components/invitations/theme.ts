import type { InvitationTheme } from "@/services/invitations";

export interface ThemePalette {
  label: string;
  primary: string;
  accent: string;
  surface: string;
  border: string;
  ribbon: string;
  button: string;
  buttonHover: string;
  icon: string;
  overlay: string;
  background: string;
  text: string;
}

export const themePalettes: Record<InvitationTheme, ThemePalette> = {
  classic: {
    label: "Classic Blue",
    primary: "#2563EB",
    accent: "#1D4ED8",
    surface: "#FFFFFF",
    border: "#CBD5E1",
    ribbon: "#1D4ED8",
    button: "#2563EB",
    buttonHover: "#1E40AF",
    icon: "#1E3A8A",
    overlay: "rgba(37,99,235,0.08)",
    background: "#F3F7FF",
    text: "#0F172A",
  },
  modern: {
    label: "Royal Gold",
    primary: "#B45309",
    accent: "#92400E",
    surface: "#FFFFFF",
    border: "#F3E5AB",
    ribbon: "#B45309",
    button: "#B45309",
    buttonHover: "#92400E",
    icon: "#78350F",
    overlay: "rgba(180,83,9,0.08)",
    background: "#FFFAF0",
    text: "#111827",
  },
  pastel: {
    label: "Rose Pink",
    primary: "#DB2777",
    accent: "#BE185D",
    surface: "#FFFFFF",
    border: "#FBCFE8",
    ribbon: "#DB2777",
    button: "#DB2777",
    buttonHover: "#BE185D",
    icon: "#831843",
    overlay: "rgba(219,39,119,0.08)",
    background: "#FFF1F7",
    text: "#111827",
  },
  dark: {
    label: "Elegant Dark",
    primary: "#0F172A",
    accent: "#475569",
    surface: "#111827",
    border: "#334155",
    ribbon: "#475569",
    button: "#0F172A",
    buttonHover: "#1E293B",
    icon: "#CBD5E1",
    overlay: "rgba(15,23,42,0.12)",
    background: "#0B1120",
    text: "#F8FAFC",
  },
  forest: {
    label: "Forest Green",
    primary: "#15803D",
    accent: "#166534",
    surface: "#FFFFFF",
    border: "#A7F3D0",
    ribbon: "#15803D",
    button: "#15803D",
    buttonHover: "#166534",
    icon: "#14532D",
    overlay: "rgba(21,128,61,0.08)",
    background: "#EFFCF6",
    text: "#0F172A",
  },
};

export function getThemePalette(theme: InvitationTheme): ThemePalette {
  return themePalettes[theme] ?? themePalettes.classic;
}
