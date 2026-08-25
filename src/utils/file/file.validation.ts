import { Visibility } from "@prisma/client";
import AppError from "../AppError.js";
import { GetUserFilesFilter } from "./file.db.js";

export function validateGetMyFilesQuery(query: unknown): GetUserFilesFilter {
  if (!query || typeof query !== "object") {
    return {};
  }

  const {
    visibility,
    minSize,
    minSizeMB,
    min,
    maxSize,
    maxSizeMB,
    max,
    search,
    sortBySize,
    sort,
    order,
  } = query as Record<string, unknown>;

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

  const minSizeQuery = minSize ?? minSizeMB ?? min;
  const maxSizeQuery = maxSize ?? maxSizeMB ?? max;

  let minSizeBytes: number | undefined;
  let maxSizeBytes: number | undefined;

  if (minSizeQuery !== undefined && minSizeQuery !== "") {
    const minMB = Number(minSizeQuery);
    if (isNaN(minMB) || minMB < 0) {
      throw new AppError(
        "Minimum file size must be a valid non-negative number in MB.",
        400,
      );
    }
    minSizeBytes = Math.round(minMB * 1024 * 1024);
  }

  if (maxSizeQuery !== undefined && maxSizeQuery !== "") {
    const maxMB = Number(maxSizeQuery);
    if (isNaN(maxMB) || maxMB < 0) {
      throw new AppError(
        "Maximum file size must be a valid non-negative number in MB.",
        400,
      );
    }
    maxSizeBytes = Math.round(maxMB * 1024 * 1024);
  }

  if (
    minSizeBytes !== undefined &&
    maxSizeBytes !== undefined &&
    minSizeBytes > maxSizeBytes
  ) {
    throw new AppError(
      "Minimum file size cannot be greater than maximum file size.",
      400,
    );
  }

  // Search filter (file name contains)
  const searchFilter =
    typeof search === "string" && search.trim() ? search.trim() : undefined;

  // Sort by size (MBs)
  let sortBySizeFilter: "asc" | "desc" | undefined;
  const rawSort = sortBySize ?? sort ?? order;
  if (rawSort && typeof rawSort === "string") {
    sortBySizeFilter = rawSort.trim().toLowerCase() === "asc" ? "asc" : "desc";
  }

  return {
    visibility: targetVisibility,
    minSizeBytes,
    maxSizeBytes,
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

