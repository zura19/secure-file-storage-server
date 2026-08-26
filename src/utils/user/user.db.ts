import prisma from "../../lib/prisma.js";
import { Prisma, User, Visibility } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

export interface UserStats {
  totalFiles: number;
  totalSizeBytes: number;
  totalSharedFiles: number;
  totalPrivateFiles: number;
}

export const userSafeSelect = {
  id: true,
  email: true,
  username: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function getUserById(id: string): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userSafeSelect,
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { username: username.trim() },
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  username?: string | null;
}): Promise<SafeUser> {
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      username: data.username ? data.username.trim() : null,
    },
    select: userSafeSelect,
  });
}

export async function getUserFileStats(userId: string): Promise<UserStats> {
  const [totalFiles, sizeAggregate, totalSharedFiles, totalPrivateFiles] =
    await Promise.all([
      prisma.file.count({
        where: { ownerId: userId },
      }),
      prisma.file.aggregate({
        where: { ownerId: userId },
        _sum: {
          size: true,
        },
      }),
      prisma.file.count({
        where: {
          ownerId: userId,
          visibility: Visibility.PUBLIC,
        },
      }),
      prisma.file.count({
        where: {
          ownerId: userId,
          visibility: Visibility.PRIVATE,
        },
      }),
    ]);

  return {
    totalFiles,
    totalSizeBytes: sizeAggregate._sum.size ?? 0,
    totalSharedFiles,
    totalPrivateFiles,
  };
}

export async function getUserTotalFileSize(userId: string): Promise<number> {
  const aggregate = await prisma.file.aggregate({
    where: { ownerId: userId },
    _sum: {
      size: true,
    },
  });

  return aggregate._sum.size ?? 0;
}

