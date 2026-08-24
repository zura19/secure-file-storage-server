import prisma from "../../lib/prisma.js";
import { File, Visibility } from "@prisma/client";

export interface CreateFileInput {
  ownerId: string;
  originalName: string;
  cloudinaryId: string;
  url: string;
  mimeType: string;
  size: number;
  visibility?: Visibility;
  shareToken?: string | null;
}

export async function createFileRecord(data: CreateFileInput): Promise<File> {
  return prisma.file.create({
    data: {
      ownerId: data.ownerId,
      originalName: data.originalName,
      cloudinaryId: data.cloudinaryId,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      visibility: data.visibility || Visibility.PRIVATE,
      shareToken: data.shareToken ?? null,
    },
  });
}

export async function getFileById(id: string): Promise<File | null> {
  return prisma.file.findUnique({
    where: { id },
  });
}

export async function getUserFiles(ownerId: string): Promise<File[]> {
  return prisma.file.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateFileVisibility(
  id: string,
  ownerId: string,
  visibility: Visibility,
  shareToken?: string | null,
): Promise<File | null> {
  const file = await prisma.file.findFirst({
    where: { id, ownerId },
  });

  if (!file) {
    return null;
  }

  return prisma.file.update({
    where: { id },
    data: {
      visibility,
      ...(shareToken !== undefined ? { shareToken } : {}),
    },
  });
}

export async function updateFileShareToken(
  id: string,
  ownerId: string,
  shareToken: string | null,
  visibility?: Visibility,
): Promise<File | null> {
  const file = await prisma.file.findFirst({
    where: { id, ownerId },
  });

  if (!file) {
    return null;
  }

  return prisma.file.update({
    where: { id },
    data: {
      shareToken,
      ...(visibility ? { visibility } : {}),
    },
  });
}

export async function deleteFileRecord(
  id: string,
  ownerId: string,
): Promise<File | null> {
  const file = await prisma.file.findFirst({
    where: { id, ownerId },
  });

  if (!file) {
    return null;
  }

  return prisma.file.delete({
    where: { id },
  });
}

export async function getFileByShareToken(shareToken: string) {
  return prisma.file.findUnique({
    where: { shareToken },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
}
