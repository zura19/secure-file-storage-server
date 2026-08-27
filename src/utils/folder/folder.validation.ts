import AppError from "../AppError.js";

export interface CreateFolderValidatedInput {
  name: string;
}

export interface UpdateFolderNameValidatedInput {
  name: string;
}

export interface BulkDeleteFoldersInput {
  ids: string[];
}

export function validateCreateFolderInput(body: unknown): CreateFolderValidatedInput {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is missing or invalid.", 400);
  }

  const { name } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new AppError("Folder name is required and cannot be empty.", 400);
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 255) {
    throw new AppError("Folder name cannot exceed 255 characters.", 400);
  }

  return {
    name: trimmedName,
  };
}

export function validateUpdateFolderNameInput(
  body: unknown,
): UpdateFolderNameValidatedInput {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is missing or invalid.", 400);
  }

  const { name } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new AppError("Folder name is required and cannot be empty.", 400);
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 255) {
    throw new AppError("Folder name cannot exceed 255 characters.", 400);
  }

  return {
    name: trimmedName,
  };
}

