export type Role = "participant" | "moderator" | "creator";

export interface User {
  id: string;
  email: string;
  name: string;
  registeredAt: string;
}

export interface CollectionMember {
  userId: string;
  role: Role;
}

export interface WatermarkState {
  watermarkId: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotate: number;
}

export interface Asset {
  id: string;
  collectionId: string;
  title: string;
  fileName: string;
  sizeKB: number;
  uploadedAt: string;
  authorId: string;
  width: number;
  height: number;
  imageUrl: string;
  watermarkState?: WatermarkState;
}

export interface Watermark {
  id: string;
  collectionId: string;
  name: string;
  addedAt: string;
  createdBy: string;
  imageUrl: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  createdAt: string;
  assetCount: number;
  members: CollectionMember[];
  assetIds: string[];
  watermarkIds: string[];
}
