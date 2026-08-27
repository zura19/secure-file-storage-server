import prisma from "../../lib/prisma.js";
import { Folder, Prisma } from "@prisma/client";

export interface CreateFolderInput {
  ownerId: string;
  name: string;
}

export async function createFolderRecord(
  data: CreateFolderInput,
): Promise<Folder> {
  return prisma.folder.create({
    data: {
      ownerId: data.ownerId,
      name: data.name.trim(),
    },
  });
}

export async function getFolderById(
  id: string,
  ownerId?: string,
) {
  return prisma.folder.findFirst({
    where: {
      id,
      ...(ownerId ? { ownerId } : {}),
    },
    include: {
      files: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { files: true },
      },
    },
  });
}

export async function getUserFolders(ownerId: string) {
  return prisma.folder.findMany({
    where: { ownerId },
    include: {
      _count: {
        select: { files: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateFolderName(
  id: string,
  ownerId: string,
  name: string,
): Promise<Folder | null> {
  const folder = await prisma.folder.findFirst({
    where: { id, ownerId },
  });

  if (!folder) {
    return null;
  }

  return prisma.folder.update({
    where: { id },
    data: {
      name: name.trim(),
    },
  });
}

export async function getFolderWithFilesForDeletion(
  id: string,
  ownerId: string,
) {
  return prisma.folder.findFirst({
    where: { id, ownerId },
    include: {
      files: {
        select: {
          id: true,
          cloudinaryId: true,
          mimeType: true,
        },
      },
    },
  });
}

export async function deleteFolderRecord(
  id: string,
  ownerId: string,
): Promise<Folder | null> {
  const folder = await prisma.folder.findFirst({
    where: { id, ownerId },
  });

  if (!folder) {
    return null;
  }

  return prisma.folder.delete({
    where: { id },
  });
}

