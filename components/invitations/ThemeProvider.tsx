import type { ReactNode } from "react";
import type { InvitationTheme } from "@/services/invitations";
import { getThemePalette } from "./theme";

interface ThemeProviderProps {
  theme: InvitationTheme;
  children: ReactNode;
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const palette = getThemePalette(theme);

  return (
    <div
      style={
        {
          "--inv-primary": palette.primary,
          "--inv-accent": palette.accent,
          "--inv-surface": palette.surface,
          "--inv-border": palette.border,
          "--inv-ribbon": palette.ribbon,
          "--inv-button": palette.button,
          "--inv-button-hover": palette.buttonHover,
          "--inv-icon": palette.icon,
          "--inv-overlay": palette.overlay,
          "--inv-background": palette.background,
          "--inv-text": palette.text,
        } as React.CSSProperties
      }
      className="invitation-theme"
    >
      {children}
    </div>
  );
}
