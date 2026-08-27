import { Visibility } from "@prisma/client";
import AppError from "../AppError.js";
import { GetUserFilesFilter } from "./file.db.js";

export function validateGetMyFilesQuery(query: unknown): GetUserFilesFilter {
  if (!query || typeof query !== "object") {
    return {};
  }

  const {
    folderId,
    visibility,
    search,
    sortBySize,
    sort,
    order,
  } = query as Record<string, unknown>;

  const folderIdFilter =
    typeof folderId === "string" && folderId.trim()
      ? folderId.trim()
      : undefined;

  let targetVisibility: Visibility | undefined;
  if (visibility !== undefined && visibility !== "") {
    if (typeof visibility !== "string") {
      throw new AppError(
        "Visibility filter must be either 'PUBLIC' or 'PRIVATE'.",
        400,
      );
    }

    const formattedVisibility = visibility.trim().toUpperCase();
    if (formattedVisibility === "PUBLIC") {
      targetVisibility = Visibility.PUBLIC;
    } else if (formattedVisibility === "PRIVATE") {
      targetVisibility = Visibility.PRIVATE;
    } else {
      throw new AppError(
        "Visibility filter must be either 'PUBLIC' or 'PRIVATE'.",
        400,
      );
    }
  }

  // Search filter (file name contains)
  const searchFilter =
    typeof search === "string" && search.trim() ? search.trim() : undefined;

  // Sort by size
  let sortBySizeFilter: "asc" | "desc" | undefined;
  const rawSort = sortBySize ?? sort ?? order;
  if (rawSort && typeof rawSort === "string") {
    sortBySizeFilter = rawSort.trim().toLowerCase() === "asc" ? "asc" : "desc";
  }

  return {
    folderId: folderIdFilter,
    visibility: targetVisibility,
    search: searchFilter,
    sortBySize: sortBySizeFilter,
  };
}

export interface BulkDeleteInput {
  ids: string[];
}

export function validateBulkDeleteInput(body: unknown): BulkDeleteInput {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is missing or invalid.", 400);
  }

  const { ids } = body as Record<string, unknown>;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Please provide an array of file IDs to delete.", 400);
  }

  const validIds = ids
    .filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0,
    )
    .map((id) => id.trim());

  if (validIds.length === 0) {
    throw new AppError(
      "Please provide at least one valid file ID to delete.",
      400,
    );
  }

  const uniqueIds = Array.from(new Set(validIds));

  return { ids: uniqueIds };
}

