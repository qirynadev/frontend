import type { MessageType, UserType } from "@/constants/constant.type";

export type RoleBadgeStyle = { label: string; bg: string; fg: string };

// Toute la messagerie route aujourd'hui vers un seul compte admin (voir
// MessageController::sendMessage côté backoffice) — pas de vrais fils par
// conseiller. On affiche donc un badge de rôle honnête basé sur le rôle réel
// de l'interlocuteur (RoleEnum), pas une fausse identité par conversation.
const ROLE_BADGE_STYLES: Record<string, RoleBadgeStyle> = {
  admin: { label: "Équipe Qiryna", bg: "#ede7f6", fg: "#673ab7" },
  conseiller: { label: "Conseiller", bg: "#e2fbe9", fg: "#10b981" },
  coach: { label: "Coach", bg: "#eef2f6", fg: "#4318ff" },
  mentor: { label: "Mentor", bg: "#fff3e0", fg: "#ff9800" },
  content_writer: { label: "Rédaction", bg: "#e3f2fd", fg: "#2196f3" },
  shop_manager: { label: "Boutique", bg: "#ffebee", fg: "#e91e63" },
};

export function roleBadgeFor(role?: string | null): RoleBadgeStyle | null {
  if (!role) return null;
  return ROLE_BADGE_STYLES[role] ?? { label: role, bg: "#eef2f6", fg: "#6b7280" };
}

/**
 * L'autre partie de l'échange, du point de vue de l'utilisateur courant —
 * `sender`/`receiver` sont déjà de vrais UserResource (nom/avatar/rôle),
 * il suffit de choisir celui qui n'est pas l'utilisateur connecté.
 */
export function counterpartOf(message: MessageType, currentUserId?: string | null): UserType | null {
  if (message.sender_id === currentUserId) return message.receiver;
  return message.sender ?? message.receiver;
}
