import type { Asset, Collection, Role, User, Watermark } from "./types";
import {
  mockAssets,
  mockCollections,
  mockUsers,
  mockWatermarks,
} from "./mockData";

const randomDelay = () => 300 + Math.round(Math.random() * 500);

function delay<T>(payload: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(payload), randomDelay()),
  );
}

export function getMockUsers(): Promise<User[]> {
  return delay([...mockUsers]);
}

export function getMockUserById(userId: string): Promise<User | undefined> {
  return delay(mockUsers.find((user) => user.id === userId));
}

export function login(email: string, _password: string): Promise<User> {
  const user = mockUsers.find((item) => item.email === email);
  if (!user) {
    return Promise.reject(new Error("Почта или пароль введены неверно."));
  }
  return delay(user);
}

export function register(
  email: string,
  name: string,
  _password: string,
): Promise<User> {
  if (mockUsers.some((user) => user.email === email)) {
    return Promise.reject(
      new Error("Пользователь с таким email уже существует."),
    );
  }
  const newUser: User = {
    id: `user-${mockUsers.length + 1}`,
    email,
    name,
    registeredAt: new Date().toISOString().slice(0, 10),
  };
  mockUsers.push(newUser);
  return delay(newUser);
}

export function getCollections(userId: string): Promise<Collection[]> {
  const ownCollections = mockCollections.filter((collection) =>
    collection.members.some((member) => member.userId === userId),
  );
  return delay(ownCollections);
}

export function getCollectionById(collectionId: string): Promise<Collection> {
  const collection = mockCollections.find((item) => item.id === collectionId);
  if (!collection) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  return delay(collection);
}

export function getCollectionMembers(
  collectionId: string,
): Promise<(User & { role: Role })[]> {
  const collection = mockCollections.find((item) => item.id === collectionId);
  if (!collection) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  const members = collection.members.map((member) => {
    const user = mockUsers.find((item) => item.id === member.userId);
    return {
      ...user!,
      role: member.role,
    };
  });
  return delay(members);
}

export function getCollectionRole(
  collectionId: string,
  userId: string,
): Role | undefined {
  return mockCollections
    .find((collection) => collection.id === collectionId)
    ?.members.find((member) => member.userId === userId)?.role;
}

export function getAssetsByCollection(collectionId: string): Promise<Asset[]> {
  const assets = mockAssets.filter(
    (asset) => asset.collectionId === collectionId,
  );
  return delay(assets);
}

export function getAssetById(
  collectionId: string,
  assetId: string,
): Promise<Asset> {
  const asset = mockAssets.find(
    (item) => item.id === assetId && item.collectionId === collectionId,
  );
  if (!asset) {
    return Promise.reject(new Error("Файл не найден."));
  }
  return delay(asset);
}

export function getCollectionWatermarks(
  collectionId: string,
): Promise<Watermark[]> {
  const watermarks = mockWatermarks.filter(
    (wm) => wm.collectionId === collectionId,
  );
  return delay(watermarks);
}

function canAssignRole(
  actorRole: Role,
  requestedRole: Role,
  targetRole?: Role,
) {
  if (actorRole === "participant") {
    return false;
  }
  if (actorRole === "moderator") {
    if (requestedRole === "creator") {
      return false;
    }
    if (targetRole === "creator") {
      return false;
    }
  }
  return true;
}

export async function assignRole(
  actorId: string,
  collectionId: string,
  targetUserId: string,
  role: Role,
): Promise<void> {
  const actorRole = getCollectionRole(collectionId, actorId);
  const targetCurrentRole = getCollectionRole(collectionId, targetUserId);
  if (!actorRole) {
    return Promise.reject(new Error("Вы не состоите в этой коллекции."));
  }
  if (!canAssignRole(actorRole, role, targetCurrentRole)) {
    return Promise.reject(
      new Error("У вас недостаточно прав для этой операции."),
    );
  }
  const collection = mockCollections.find((item) => item.id === collectionId);
  if (!collection) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  const member = collection.members.find(
    (item) => item.userId === targetUserId,
  );
  if (member) {
    member.role = role;
  } else {
    collection.members.push({ userId: targetUserId, role });
  }
  return delay(undefined);
}

export async function renameCollection(
  actorId: string,
  collectionId: string,
  title: string,
  description: string,
): Promise<Collection> {
  const actorRole = getCollectionRole(collectionId, actorId);
  if (actorRole !== "creator") {
    return Promise.reject(
      new Error("Только создатель может переименовывать коллекцию."),
    );
  }
  const collection = mockCollections.find((item) => item.id === collectionId);
  if (!collection) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  collection.title = title;
  collection.description = description;
  return delay(collection);
}

export async function deleteCollection(
  actorId: string,
  collectionId: string,
): Promise<void> {
  const role = getCollectionRole(collectionId, actorId);
  if (role !== "creator") {
    return Promise.reject(
      new Error("Только создатель может удалять коллекцию."),
    );
  }
  const index = mockCollections.findIndex((item) => item.id === collectionId);
  if (index === -1) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  mockCollections.splice(index, 1);
  for (let i = mockAssets.length - 1; i >= 0; i--) {
    if (mockAssets[i].collectionId === collectionId) {
      mockAssets.splice(i, 1);
    }
  }
  for (let i = mockWatermarks.length - 1; i >= 0; i--) {
    if (mockWatermarks[i].collectionId === collectionId) {
      mockWatermarks.splice(i, 1);
    }
  }
  return delay(undefined);
}

export async function uploadWatermark(
  actorId: string,
  collectionId: string,
  name: string,
  imageUrl: string,
): Promise<Watermark> {
  const actorRole = getCollectionRole(collectionId, actorId);
  if (!actorRole || actorRole === "participant") {
    return Promise.reject(
      new Error("У вас нет доступа к библиотеке водяных знаков."),
    );
  }
  const collection = mockCollections.find((item) => item.id === collectionId);
  if (!collection) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  const watermark: Watermark = {
    id: `wm-${mockWatermarks.length + 1}`,
    collectionId,
    name,
    addedAt: new Date().toISOString().slice(0, 10),
    createdBy: actorId,
    imageUrl,
  };
  mockWatermarks.push(watermark);
  collection.watermarkIds.push(watermark.id);
  return delay(watermark);
}

export async function deleteWatermark(
  actorId: string,
  collectionId: string,
  watermarkId: string,
): Promise<void> {
  const actorRole = getCollectionRole(collectionId, actorId);
  if (!actorRole || actorRole === "participant") {
    return Promise.reject(
      new Error("У вас нет доступа для удаления водяного знака."),
    );
  }
  const index = mockWatermarks.findIndex(
    (item) => item.id === watermarkId && item.collectionId === collectionId,
  );
  if (index === -1) {
    return Promise.reject(new Error("Водяной знак не найден."));
  }
  mockWatermarks.splice(index, 1);
  const collection = mockCollections.find((item) => item.id === collectionId);
  collection?.watermarkIds.splice(
    collection?.watermarkIds.indexOf(watermarkId),
    1,
  );
  return delay(undefined);
}

export async function saveWatermarkState(
  actorId: string,
  collectionId: string,
  assetId: string,
  state: Asset["watermarkState"],
): Promise<Asset> {
  const actorRole = getCollectionRole(collectionId, actorId);
  if (!actorRole || actorRole === "participant") {
    return Promise.reject(
      new Error("У вас нет доступа к редактору водяных знаков."),
    );
  }
  const asset = mockAssets.find(
    (item) => item.id === assetId && item.collectionId === collectionId,
  );
  if (!asset) {
    return Promise.reject(new Error("Файл не найден."));
  }
  asset.watermarkState = state;
  return delay(asset);
}

export async function uploadAsset(
  actorId: string,
  collectionId: string,
  title: string,
  fileName: string,
  imageUrl: string,
): Promise<Asset> {
  const actorRole = getCollectionRole(collectionId, actorId);
  if (!actorRole || actorRole === "participant") {
    return Promise.reject(
      new Error("Только модераторы и создатели могут добавлять файлы."),
    );
  }
  const collection = mockCollections.find((item) => item.id === collectionId);
  if (!collection) {
    return Promise.reject(new Error("Коллекция не найдена."));
  }
  const asset: Asset = {
    id: `${collectionId}-asset-${mockAssets.length + 1}`,
    collectionId,
    title,
    fileName,
    sizeKB: Math.round(480 + Math.random() * 1400),
    uploadedAt: new Date().toISOString().slice(0, 10),
    authorId: actorId,
    width: 900,
    height: 650,
    imageUrl,
  };
  mockAssets.push(asset);
  collection.assetIds.push(asset.id);
  collection.assetCount = (collection.assetCount || 0) + 1;
  return delay(asset);
}

export async function getUserCollections(
  userId: string,
): Promise<Collection[]> {
  return getCollections(userId);
}

export async function createCollection(
  actorId: string,
  title: string,
  description: string,
): Promise<Collection> {
  const collection: Collection = {
    id: `col-${mockCollections.length + 1}`,
    title,
    description,
    coverImage: `https://picsum.photos/seed/${encodeURIComponent(title)}/900/700`,
    createdAt: new Date().toISOString().slice(0, 10),
    assetCount: 0,
    members: [{ userId: actorId, role: "creator" }],
    assetIds: [],
    watermarkIds: [],
  };
  mockCollections.unshift(collection);
  return delay(collection);
}

export function getCurrentCollectionRole(
  collectionId: string,
  userId: string,
): Role | undefined {
  return getCollectionRole(collectionId, userId);
}
