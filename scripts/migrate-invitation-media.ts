import { constants as fsConstants } from "node:fs";
import { copyFile, mkdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma";
import {
  privateInvitationAssetPath,
  privateInvitationAssetUrl,
  replaceStoredMediaUrlReferences,
} from "../lib/storage/private-media";

type LegacyAsset = {
  id: string;
  invitationId: string;
  type: "IMAGE" | "AUDIO";
  url: string;
};

const apply = process.argv.includes("--apply");

function legacyExtension(asset: LegacyAsset) {
  if (asset.type === "IMAGE") {
    const expectedPrefix = `/uploads/images/${asset.invitationId}/`;
    if (!asset.url.startsWith(expectedPrefix)) return null;
    const filename = asset.url.slice(expectedPrefix.length);
    return /^[0-9a-f-]{36}\.webp$/.test(filename) ? ".webp" : null;
  }

  const match = /^\/uploads\/music\/[0-9a-f-]{36}(\.(?:mp3|wav|ogg|aac|m4a|mp4))$/.exec(asset.url);
  return match?.[1]?.toLowerCase() ?? null;
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function migrateAsset(asset: LegacyAsset) {
  const extension = legacyExtension(asset);
  if (!extension) {
    return { status: "skipped" as const, reason: "legacy URL shape is not recognized" };
  }

  const source = path.join(process.cwd(), "public", asset.url.slice(1));
  const assetKey = `${asset.id}${extension}`;
  const destination = privateInvitationAssetPath(asset.invitationId, assetKey);
  const nextUrl = privateInvitationAssetUrl(assetKey);

  const sourceExists = await exists(source);
  const destinationExists = await exists(destination);

  if (!sourceExists && !destinationExists) {
    return { status: "missing" as const, reason: source };
  }

  if (!apply) {
    return { status: "planned" as const, reason: `${asset.url} -> ${nextUrl}` };
  }

  await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });

  if (!destinationExists) {
    await copyFile(source, destination, fsConstants.COPYFILE_EXCL);
  }

  await prisma.$transaction(async (tx) => {
    await tx.invitationAsset.update({
      where: { id: asset.id },
      data: { url: nextUrl },
    });

    // Most photo selections persist stable asset IDs, but older design state may
    // contain a direct media URL in decor= (URL-encoded) or another legacy token.
    // Rewrite those references before the public source file is removed.
    const invitation = await tx.invitation.findUnique({
      where: { id: asset.invitationId },
      select: { templateKey: true },
    });
    if (invitation) {
      const migratedTemplateKey = replaceStoredMediaUrlReferences(
        invitation.templateKey,
        asset.url,
        nextUrl,
      );
      if (migratedTemplateKey !== invitation.templateKey) {
        await tx.invitation.update({
          where: { id: asset.invitationId },
          data: { templateKey: migratedTemplateKey },
        });
      }
    }

    if (asset.type === "AUDIO") {
      await tx.invitation.updateMany({
        where: { id: asset.invitationId, musicUrl: asset.url },
        data: { musicUrl: nextUrl },
      });
    }
  });

  if (sourceExists) {
    await unlink(source);
  }

  return { status: "migrated" as const, reason: nextUrl };
}

async function main() {
  const assets = await prisma.invitationAsset.findMany({
    where: {
      OR: [
        { url: { startsWith: "/uploads/images/" } },
        { url: { startsWith: "/uploads/music/" } },
      ],
    },
    select: {
      id: true,
      invitationId: true,
      type: true,
      url: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(
    apply
      ? `Migrating ${assets.length} legacy invitation media record(s)...`
      : `Dry run: ${assets.length} legacy invitation media record(s). Re-run with --apply to migrate.`,
  );

  let failures = 0;
  for (const asset of assets as LegacyAsset[]) {
    try {
      const result = await migrateAsset(asset);
      console.log(`[${result.status}] ${asset.id}: ${result.reason}`);
      if (result.status === "missing") failures += 1;
    } catch (error) {
      failures += 1;
      console.error(`[failed] ${asset.id}`, error);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Invitation media migration failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
