import type { Role } from "../mocks/types";

const roleStyles: Record<Role, string> = {
  participant: "bg-sky-100 text-sky-700 border-sky-200",
  moderator: "bg-sky-200 text-sky-800 border-sky-300",
  creator: "bg-sky-600 text-white border-sky-300",
};

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const label =
    role === "creator"
      ? "Создатель"
      : role === "moderator"
        ? "Модератор"
        : "Участник";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${roleStyles[role]}`}
    >
      {label}
    </span>
  );
}
