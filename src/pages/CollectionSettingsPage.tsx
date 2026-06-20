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
import { GlassButton } from "../components/GlassButton";
import { GlassSurface } from "../components/GlassSurface";
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

  if (loading) {
    return <LoadingFallback />;
  }

  if (!collection || !user) {
    return (
      <p className="text-slate-700">
        Коллекция не найдена или доступ ограничен.
      </p>
    );
  }

  const currentRole = collection.members.find(
    (member: any) => member.userId === user.id,
  )?.role;

  const handleRoleChange = async (targetId: string, role: string) => {
    if (!id || !currentRole) return;
    setSaving(true);
    setError(null);
    try {
      await assignRole(user.id, id, targetId, role as any);
      const updatedMembers = members.map((member) =>
        member.id === targetId ? { ...member, role } : member,
      );
      setMembers(updatedMembers);
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
    if (!window.confirm("Удалить коллекцию? Это действие необратимо.")) return;
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

  const canManageRoles =
    currentRole === "creator" || currentRole === "moderator";
  const isCreator = currentRole === "creator";

  return (
    <div className="space-y-8">
      <div className="flex gap-3">
        <GlassButton
          variant="secondary"
          onClick={() => navigate(`/collections/${id}`)}
          className="w-auto"
        >
          ← Вернуться в коллекцию
        </GlassButton>
      </div>
      <GlassSurface className="p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm uppercase tracking-[0.24em] text-sky-700">
              Настройки коллекции
            </span>
            <RoleBadge role={currentRole} />
          </div>
          <h2 className="text-3xl font-semibold text-slate-950">
            {collection.title}
          </h2>
          <p className="text-slate-600">
            Здесь вы можете переименовать коллекцию и управлять ролями
            участников.
          </p>
        </div>
      </GlassSurface>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <GlassSurface className="p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-950">
              Параметры коллекции
            </h3>
            <label className="block">
              <span className="text-sm font-medium text-slate-800">
                Название
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-800">
                Описание
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <GlassButton
                onClick={handleRename}
                disabled={!isCreator || saving}
              >
                Сохранить изменения
              </GlassButton>
              {isCreator ? (
                <GlassButton
                  variant="secondary"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Удалить коллекцию
                </GlassButton>
              ) : null}
            </div>
          </div>
        </GlassSurface>
        <GlassSurface className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-slate-950">
                Участники
              </h3>
              <span className="text-sm text-slate-500">
                {members.length} пользователей
              </span>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <div className="space-y-4">
              {members.map((member) => {
                const isActor = member.id === user.id;
                return (
                  <div
                    key={member.id}
                    className="rounded-3xl border border-slate-200 bg-white/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                      <RoleBadge role={member.role} />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Роль
                      </label>
                      <select
                        className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-400"
                        value={member.role}
                        disabled={
                          !canManageRoles ||
                          (member.role === "creator" &&
                            currentRole !== "creator") ||
                          isActor
                        }
                        onChange={(event) =>
                          handleRoleChange(member.id, event.target.value)
                        }
                      >
                        {roleOptions.map((option) => {
                          if (
                            currentRole === "moderator" &&
                            option.value === "creator"
                          )
                            return null;
                          return (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}
