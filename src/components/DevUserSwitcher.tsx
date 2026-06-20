import { mockUsers } from "../mocks/users";

interface DevUserSwitcherProps {
  currentUserId: string | null;
  onSelect: (userId: string) => void;
}

export function DevUserSwitcher({
  currentUserId,
  onSelect,
}: DevUserSwitcherProps) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/35 bg-slate-950/10 p-3 text-sm text-slate-800 shadow-glow backdrop-blur-xl md:inline-flex">
      <span className="mr-3 font-medium text-slate-700">DEV пользователь:</span>
      <select
        className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-400"
        value={currentUserId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
      >
        {mockUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
