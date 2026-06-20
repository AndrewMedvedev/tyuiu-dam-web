import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getCollectionRole } from "../mocks/api";
import type { Role } from "../mocks/types";

export function useCollectionRole(
  collectionId: string | undefined,
): Role | undefined {
  const { user } = useAuth();
  return useMemo(() => {
    if (!collectionId || !user) {
      return undefined;
    }
    return getCollectionRole(collectionId, user.id);
  }, [collectionId, user]);
}
