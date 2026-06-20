import type { Asset, Collection, User, Watermark } from "./types";

function svgDataUri(text: string, fill = "#1d4ed8", width = 280, height = 100) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="700" fill="${fill}">${text}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "polina.petrova@tiu.ru",
    name: "Полина Петрова",
    registeredAt: "2024-09-12",
  },
  {
    id: "user-2",
    email: "ivan.ershov@tiu.ru",
    name: "Иван Ершов",
    registeredAt: "2023-11-18",
  },
  {
    id: "user-3",
    email: "anna.ivanova@tiu.ru",
    name: "Анна Иванова",
    registeredAt: "2022-06-01",
  },
  {
    id: "user-4",
    email: "oleg.kuznetsov@tiu.ru",
    name: "Олег Кузнецов",
    registeredAt: "2024-01-27",
  },
  {
    id: "user-5",
    email: "elena.smirnova@tiu.ru",
    name: "Елена Смирнова",
    registeredAt: "2021-12-09",
  },
  {
    id: "user-6",
    email: "maxim.belyakov@tiu.ru",
    name: "Максим Беляков",
    registeredAt: "2024-03-14",
  },
  {
    id: "user-7",
    email: "natalia.morozova@tiu.ru",
    name: "Наталья Морозова",
    registeredAt: "2022-08-30",
  },
  {
    id: "user-8",
    email: "sergey.lysenko@tiu.ru",
    name: "Сергей Лисенко",
    registeredAt: "2023-04-21",
  },
  {
    id: "user-9",
    email: "alina.koroleva@tiu.ru",
    name: "Алина Королева",
    registeredAt: "2024-05-05",
  },
  {
    id: "user-10",
    email: "dmitriy.volkov@tiu.ru",
    name: "Дмитрий Волков",
    registeredAt: "2022-02-11",
  },
];

function buildAsset(
  collectionId: string,
  index: number,
  authorId: string,
  title: string,
  watermarkState?: Asset["watermarkState"],
): Asset {
  const width = 900 - (index % 4) * 80;
  const height = 650 - (index % 3) * 60;
  return {
    id: `${collectionId}-asset-${index}`,
    collectionId,
    title: `${title} ${index + 1}`,
    fileName: `${title.toLowerCase().replace(/\s+/g, "-")}-${index + 1}.jpg`,
    sizeKB: Math.round(480 + Math.random() * 1400),
    uploadedAt: `2025-0${(index % 9) + 1}-0${(index % 27) + 1}`,
    authorId,
    width,
    height,
    imageUrl: `https://picsum.photos/seed/${collectionId}-${index}/800/600`,
    watermarkState,
  };
}

function buildAssets(
  collectionId: string,
  count: number,
  authorIds: string[],
  title: string,
  watermarkedIndices: Record<number, Asset["watermarkState"]>,
) {
  return Array.from({ length: count }, (_, index) => {
    const authorId = authorIds[index % authorIds.length];
    const watermarkState = watermarkedIndices[index] ?? undefined;
    return buildAsset(collectionId, index, authorId, title, watermarkState);
  });
}

export const mockWatermarks: Watermark[] = [
  {
    id: "wm-1",
    collectionId: "col-1",
    name: "ТИУ Авторский знак",
    addedAt: "2025-01-10",
    createdBy: "user-3",
    imageUrl: svgDataUri("ТИУ", "#2563eb", 260, 80),
  },
  {
    id: "wm-2",
    collectionId: "col-1",
    name: "TIU Energy Shield",
    addedAt: "2025-01-16",
    createdBy: "user-3",
    imageUrl: svgDataUri("TIU", "#0f172a", 260, 80),
  },
  {
    id: "wm-3",
    collectionId: "col-2",
    name: "Официальный знак ТИУ",
    addedAt: "2024-11-22",
    createdBy: "user-2",
    imageUrl: svgDataUri("ТИУ", "#1d4ed8", 260, 80),
  },
  {
    id: "wm-4",
    collectionId: "col-4",
    name: "Спорт. Бренд ТИУ",
    addedAt: "2025-02-03",
    createdBy: "user-8",
    imageUrl: svgDataUri("ТИУ", "#0ea5e9", 260, 80),
  },
  {
    id: "wm-5",
    collectionId: "col-5",
    name: "Пресс-банк TIU",
    addedAt: "2025-01-05",
    createdBy: "user-6",
    imageUrl: svgDataUri("Press TIU", "#1e3a8a", 300, 80),
  },
  {
    id: "wm-6",
    collectionId: "col-5",
    name: "TIU Press",
    addedAt: "2025-02-06",
    createdBy: "user-6",
    imageUrl: svgDataUri("TIU", "#3b82f6", 260, 80),
  },
];

const collectionAssets: Asset[] = [
  ...buildAssets("col-1", 12, ["user-3", "user-1", "user-2"], "Выпускной", {
    1: {
      watermarkId: "wm-1",
      x: 0.65,
      y: 0.78,
      scale: 0.24,
      opacity: 0.28,
      rotate: -12,
    },
    4: {
      watermarkId: "wm-2",
      x: 0.55,
      y: 0.82,
      scale: 0.3,
      opacity: 0.22,
      rotate: 6,
    },
  }),
  ...buildAssets(
    "col-2",
    14,
    ["user-2", "user-9", "user-1"],
    "День открытых дверей",
    {
      0: {
        watermarkId: "wm-3",
        x: 0.5,
        y: 0.85,
        scale: 0.28,
        opacity: 0.26,
        rotate: 0,
      },
    },
  ),
  ...buildAssets("col-3", 10, ["user-5", "user-7", "user-4"], "Инновации", {}),
  ...buildAssets("col-4", 8, ["user-8", "user-1", "user-10"], "Спорт", {}),
  ...buildAssets(
    "col-5",
    32,
    ["user-6", "user-1", "user-2", "user-9"],
    "Университетские моменты",
    {
      3: {
        watermarkId: "wm-5",
        x: 0.6,
        y: 0.7,
        scale: 0.25,
        opacity: 0.32,
        rotate: 10,
      },
      15: {
        watermarkId: "wm-6",
        x: 0.5,
        y: 0.65,
        scale: 0.22,
        opacity: 0.28,
        rotate: -8,
      },
      28: {
        watermarkId: "wm-6",
        x: 0.55,
        y: 0.75,
        scale: 0.24,
        opacity: 0.24,
        rotate: 4,
      },
    },
  ),
  ...buildAssets("col-6", 0, ["user-7"], "Архив", {}),
];

export const mockAssets = collectionAssets;

const mockCollectionsData: Collection[] = [
  {
    id: "col-1",
    title: "Выпускной 2026",
    description:
      "Незабываемые кадры с церемонии, подготовки и фотозон выпускного вечера.",
    coverImage: "https://picsum.photos/seed/grad/900/700",
    createdAt: "2025-01-09",
    assetCount: 12,
    members: [
      { userId: "user-3", role: "creator" },
      { userId: "user-1", role: "creator" },
      { userId: "user-2", role: "moderator" },
      { userId: "user-4", role: "participant" },
      { userId: "user-9", role: "participant" },
    ],
    assetIds: collectionAssets
      .filter((asset) => asset.collectionId === "col-1")
      .map((asset) => asset.id),
    watermarkIds: mockWatermarks
      .filter((wm) => wm.collectionId === "col-1")
      .map((wm) => wm.id),
  },
  {
    id: "col-2",
    title: "День открытых дверей",
    description:
      "Документальные снимки кампуса, мастер-классов и общения с абитуриентами.",
    coverImage: "https://picsum.photos/seed/openhouse/900/700",
    createdAt: "2025-01-16",
    assetCount: 14,
    members: [
      { userId: "user-2", role: "creator" },
      { userId: "user-1", role: "moderator" },
      { userId: "user-3", role: "participant" },
      { userId: "user-5", role: "participant" },
      { userId: "user-6", role: "participant" },
    ],
    assetIds: collectionAssets
      .filter((asset) => asset.collectionId === "col-2")
      .map((asset) => asset.id),
    watermarkIds: mockWatermarks
      .filter((wm) => wm.collectionId === "col-2")
      .map((wm) => wm.id),
  },
  {
    id: "col-3",
    title: "Научная конференция «Инновации в энергетике»",
    description:
      "Фотографии докладов, стендов и общения исследователей на конференции.",
    coverImage: "https://picsum.photos/seed/conference/900/700",
    createdAt: "2024-12-03",
    assetCount: 10,
    members: [
      { userId: "user-5", role: "creator" },
      { userId: "user-3", role: "participant" },
      { userId: "user-8", role: "participant" },
      { userId: "user-1", role: "participant" },
      { userId: "user-10", role: "participant" },
    ],
    assetIds: collectionAssets
      .filter((asset) => asset.collectionId === "col-3")
      .map((asset) => asset.id),
    watermarkIds: [],
  },
  {
    id: "col-4",
    title: "Спортивные мероприятия",
    description:
      "Подборка динамичных снимков спортивных соревнований и турниров.",
    coverImage: "https://picsum.photos/seed/sport/900/700",
    createdAt: "2025-02-07",
    assetCount: 8,
    members: [
      { userId: "user-8", role: "creator" },
      { userId: "user-1", role: "participant" },
      { userId: "user-3", role: "participant" },
      { userId: "user-4", role: "moderator" },
      { userId: "user-7", role: "participant" },
    ],
    assetIds: collectionAssets
      .filter((asset) => asset.collectionId === "col-4")
      .map((asset) => asset.id),
    watermarkIds: [],
  },
  {
    id: "col-5",
    title: "Фотобанк пресс-службы",
    description:
      "Большой набор фото для пресс-релизов, анонсов и бренда университета.",
    coverImage: "https://picsum.photos/seed/press/900/700",
    createdAt: "2024-10-27",
    assetCount: 32,
    members: [
      { userId: "user-6", role: "creator" },
      { userId: "user-1", role: "moderator" },
      { userId: "user-2", role: "participant" },
      { userId: "user-9", role: "participant" },
      { userId: "user-10", role: "participant" },
    ],
    assetIds: collectionAssets
      .filter((asset) => asset.collectionId === "col-5")
      .map((asset) => asset.id),
    watermarkIds: mockWatermarks
      .filter((wm) => wm.collectionId === "col-5")
      .map((wm) => wm.id),
  },
  {
    id: "col-6",
    title: "Архив кафедры информатики",
    description:
      "Коллекция административных и учебных материалов кафедры информатики.",
    coverImage: "https://picsum.photos/seed/archive/900/700",
    createdAt: "2023-09-14",
    assetCount: 0,
    members: [
      { userId: "user-7", role: "creator" },
      { userId: "user-3", role: "participant" },
      { userId: "user-1", role: "participant" },
    ],
    assetIds: [],
    watermarkIds: [],
  },
];

export const mockCollections = mockCollectionsData;
