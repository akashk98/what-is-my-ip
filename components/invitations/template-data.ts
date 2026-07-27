import type { EventType, InvitationTheme } from "@/services/invitations";

export const eventHeading: Record<EventType, string> = {
  Birthday: "Birthday Celebration",
  Marriage: "Wedding Invitation",
  Housewarming: "Housewarming Welcome",
  Anniversary: "Anniversary Celebration",
};

export const eventTileData: Array<{ type: EventType; subtitle: string; description: string }> = [
  {
    type: "Birthday",
    subtitle: "Joyful celebration",
    description: "Create a cheerful invitation for friends and family.",
  },
  {
    type: "Marriage",
    subtitle: "Elegant ceremony",
    description: "Send a timeless invitation for your wedding day.",
  },
  {
    type: "Housewarming",
    subtitle: "Celebrate your new home",
    description: "Invite guests to warm your home with good company.",
  },
  {
    type: "Anniversary",
    subtitle: "Special milestone",
    description: "Share a beautiful invitation for your anniversary.",
  },
];

export const themeOptions: Array<{ value: InvitationTheme; label: string; accent: string }> = [
  { value: "classic", label: "Classic Blue", accent: "bg-slate-900 text-white" },
  { value: "modern", label: "Royal Gold", accent: "bg-amber-600 text-white" },
  { value: "pastel", label: "Rose Pink", accent: "bg-rose-300 text-slate-900" },
  { value: "dark", label: "Elegant Dark", accent: "bg-slate-950 text-amber-400" },
  { value: "forest", label: "Forest Green", accent: "bg-emerald-800 text-white" },
];

export function getThemeStyles(theme: InvitationTheme) {
  switch (theme) {
    case "classic":
      return {
        container: "bg-white text-slate-900 border border-slate-200",
        accent: "text-amber-500",
        button: "bg-slate-900 text-white hover:bg-slate-800",
      };
    case "modern":
      return {
        container: "bg-emerald-50 text-slate-900 border border-emerald-200",
        accent: "text-emerald-700",
        button: "bg-emerald-600 text-white hover:bg-emerald-500",
      };
    case "pastel":
      return {
        container: "bg-rose-50 text-slate-900 border border-rose-200",
        accent: "text-rose-600",
        button: "bg-rose-400 text-slate-900 hover:bg-rose-300",
      };
    case "dark":
      return {
        container: "bg-slate-950 text-slate-100 border border-slate-800",
        accent: "text-amber-400",
        button: "bg-amber-500 text-slate-950 hover:bg-amber-400",
      };
    default:
      return {
        container: "bg-white text-slate-900 border border-slate-200",
        accent: "text-slate-900",
        button: "bg-slate-900 text-white",
      };
  }
}
