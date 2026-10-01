import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".scss", ".sass", ".less",
  ".json", ".md", ".mdx", ".html",
  ".yml", ".yaml", ".prisma", ".txt", ".toml",
]);

const SKIP_DIRS = new Set([
  ".git", "node_modules", ".next", ".turbo", "coverage", "dist", "build",
]);

const SOURCE_IMAGE_RE = /\.(png|jpe?g)$/i;

const toPosix = (value) => value.split(path.sep).join("/");

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function convertImage(inputPath, outputPath = inputPath.replace(SOURCE_IMAGE_RE, ".webp")) {
  const inputStat = await fs.stat(inputPath);
  const image = sharp(inputPath, { failOn: "warning" });
  const metadata = await image.metadata();

  if (await fileExists(outputPath)) {
    const outputStat = await fs.stat(outputPath);
    return {
      inputPath,
      outputPath,
      before: inputStat.size,
      after: outputStat.size,
      hasAlpha: Boolean(metadata.hasAlpha),
      reusedExisting: true,
    };
  }

  const options = metadata.hasAlpha
    ? {
        quality: 90,
        alphaQuality: 100,
        effort: 6,
        smartSubsample: true,
        nearLossless: true,
      }
    : {
        quality: 88,
        effort: 6,
        smartSubsample: true,
      };

  await image.webp(options).toFile(outputPath);
  const outputStat = await fs.stat(outputPath);

  return {
    inputPath,
    outputPath,
    before: inputStat.size,
    after: outputStat.size,
    hasAlpha: Boolean(metadata.hasAlpha),
    reusedExisting: false,
  };
}

async function updateTextReferences(conversions) {
  const files = await walk(root);
  const textFiles = files.filter((file) =>
    TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );

  const replacements = [];
  for (const item of conversions) {
    const publicRelativeSource = toPosix(path.relative(publicDir, item.inputPath));
    const publicRelativeWebp = toPosix(path.relative(publicDir, item.outputPath));
    const repoRelativeSource = `public/${publicRelativeSource}`;
    const repoRelativeWebp = `public/${publicRelativeWebp}`;
    const webSource = `/${publicRelativeSource}`;
    const webWebp = `/${publicRelativeWebp}`;

    const sourceBase = path.basename(publicRelativeSource);
    const webpBase = path.basename(publicRelativeWebp);
    const escapedSourceBase = sourceBase.replace(/\./g, "\\.");
    const escapedWebpBase = webpBase.replace(/\./g, "\\.");

    replacements.push(
      [repoRelativeSource, repoRelativeWebp],
      [webSource, webWebp],
      [publicRelativeSource, publicRelativeWebp],
      [encodeURI(repoRelativeSource), encodeURI(repoRelativeWebp)],
      [encodeURI(webSource), encodeURI(webWebp)],
      [encodeURI(publicRelativeSource), encodeURI(publicRelativeWebp)],
      [sourceBase, webpBase],
      [escapedSourceBase, escapedWebpBase],
    );
  }

  let changedFiles = 0;
  for (const file of textFiles) {
    let original;
    try {
      original = await fs.readFile(file, "utf8");
    } catch {
      continue;
    }

    let next = original;
    for (const [from, to] of replacements) {
      if (from === to || !next.includes(from)) continue;
      next = next.split(from).join(to);
    }

    if (next !== original) {
      await fs.writeFile(file, next, "utf8");
      changedFiles += 1;
    }
  }

  return changedFiles;
}

const publicFiles = await walk(publicDir);
const publicSourceImages = publicFiles
  .filter((file) => SOURCE_IMAGE_RE.test(file))
  .sort((a, b) => a.localeCompare(b));

const appIconPng = path.join(root, "app", "icon.png");
const sourceJobs = publicSourceImages.map((inputPath) => ({
  inputPath,
  outputPath: inputPath.replace(SOURCE_IMAGE_RE, ".webp"),
}));

if (await fileExists(appIconPng)) {
  sourceJobs.push({
    inputPath: appIconPng,
    // Next.js app/icon file convention does not support WebP, so keep the
    // converted favicon in public/ and reference it through Metadata.icons.
    outputPath: path.join(publicDir, "icon.webp"),
  });
}

if (sourceJobs.length === 0) {
  console.log("No PNG/JPG/JPEG assets found to normalize. Nothing to convert.");
  process.exit(0);
}

console.log(`Converting ${sourceJobs.length} raster assets to WebP...\n`);

const conversions = [];
for (const { inputPath, outputPath } of sourceJobs) {
  const result = await convertImage(inputPath, outputPath);
  conversions.push(result);

  const beforeMb = (result.before / 1024 / 1024).toFixed(2);
  const afterMb = (result.after / 1024 / 1024).toFixed(2);
  const rel = toPosix(path.relative(root, inputPath));
  const out = toPosix(path.relative(root, outputPath));
  const note = result.reusedExisting ? " (existing WebP reused)" : "";
  console.log(`✓ ${rel} → ${out}  ${beforeMb} MB → ${afterMb} MB${note}`);
}

const publicConversions = conversions.filter((item) =>
  item.inputPath.startsWith(publicDir + path.sep),
);
const changedFiles = await updateTextReferences(publicConversions);

for (const item of conversions) {
  await fs.unlink(item.inputPath);
}

const beforeTotal = conversions.reduce((sum, item) => sum + item.before, 0);
const afterTotal = conversions.reduce((sum, item) => sum + item.after, 0);
const saved = beforeTotal - afterTotal;
const percent = beforeTotal > 0 ? (saved / beforeTotal) * 100 : 0;

console.log("\nConversion complete.");
console.log(`Assets normalized: ${conversions.length}`);
console.log(`Text files updated: ${changedFiles}`);
console.log(
  `Asset size: ${(beforeTotal / 1024 / 1024).toFixed(2)} MB → ${(
    afterTotal /
    1024 /
    1024
  ).toFixed(2)} MB (${percent.toFixed(1)}% smaller)`,
);
