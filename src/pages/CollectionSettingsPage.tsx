import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCollectionById,
  getCollectionMembers,
  assignRole,
  deleteCollection,
  renameCollection,
} from "../mocks/api";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "../components/RoleBadge";
import { LoadingFallback } from "../components/LoadingFallback";

const roleOptions = [
  { value: "participant", label: "Участник" },
  { value: "moderator", label: "Модератор" },
  { value: "creator", label: "Создатель" },
];

export function CollectionSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCollectionById(id), getCollectionMembers(id)])
      .then(([collectionData, membersData]) => {
        setCollection(collectionData);
        setMembers(membersData);
        setTitle(collectionData.title);
        setDescription(collectionData.description);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingFallback />;

  if (!collection || !user) {
    return (
      <p className="text-sm text-slate-500">
        Коллекция не найдена или доступ ограничен.
      </p>
    );
  }

  const currentRole = collection.members.find(
    (m: any) => m.userId === user.id,
  )?.role;
  const canManageRoles =
    currentRole === "creator" || currentRole === "moderator";
  const isCreator = currentRole === "creator";

  const handleRoleChange = async (targetId: string, role: string) => {
    if (!id || !currentRole) return;
    setSaving(true);
    setError(null);
    try {
      await assignRole(user.id, id, targetId, role as any);
      setMembers((prev) =>
        prev.map((m) => (m.id === targetId ? { ...m, role } : m)),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await renameCollection(user.id, id, title, description);
      setCollection(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Удалить коллекцию? Это необратимо.")) return;
    setSaving(true);
    try {
      await deleteCollection(user.id, id);
      navigate("/collections");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(`/collections/${id}`)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        {collection.title}
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Настройки
          </span>
          <RoleBadge role={currentRole} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {collection.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Управляйте параметрами и участниками коллекции.
        </p>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        {/* Settings panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Параметры коллекции
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Название
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleRename}
              disabled={!isCreator || saving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              Сохранить
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition-colors"
              >
                Удалить коллекцию
              </button>
            )}
          </div>
        </div>

        {/* Members panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Участники</h2>
            <span className="text-xs text-slate-400">{members.length}</span>
          </div>
          <div className="space-y-3">
            {members.map((member) => {
              const isActor = member.id === user.id;
              return (
                <div
                  key={member.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {member.email}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400 transition-colors"
                    value={member.role}
                    disabled={
                      !canManageRoles ||
                      (member.role === "creator" &&
                        currentRole !== "creator") ||
                      isActor
                    }
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value)
                    }
                  >
                    {roleOptions.map((opt) => {
                      if (
                        currentRole === "moderator" &&
                        opt.value === "creator"
                      )
                        return null;
                      return (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
