import { $ } from "bun";

const isAllPlatforms = Bun.argv.includes("--all-platforms");

interface BuildTarget {
  target: string;
  outfile: string;
}

function getCurrentPlatform(): BuildTarget {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "linux" && arch === "x64") {
    return { target: "bun-linux-x64", outfile: "dist/spec-linux-x64" };
  } else if (platform === "linux" && arch === "arm64") {
    return { target: "bun-linux-arm64", outfile: "dist/spec-linux-arm64" };
  } else if (platform === "darwin" && arch === "arm64") {
    return { target: "bun-darwin-arm64", outfile: "dist/spec-darwin-arm64" };
  } else if (platform === "darwin" && arch === "x64") {
    return { target: "bun-darwin-x64", outfile: "dist/spec-darwin-x64" };
  } else if (platform === "win32") {
    return { target: "bun-windows-x64", outfile: "dist/spec-windows-x64.exe" };
  }
  // Default to current platform binary
  return { target: "bun-linux-x64", outfile: "dist/spec" };
}

const allPlatforms: BuildTarget[] = [
  { target: "bun-linux-x64", outfile: "dist/spec-linux-x64" },
  { target: "bun-linux-arm64", outfile: "dist/spec-linux-arm64" },
  { target: "bun-darwin-x64", outfile: "dist/spec-darwin-x64" },
  { target: "bun-darwin-arm64", outfile: "dist/spec-darwin-arm64" },
  { target: "bun-windows-x64", outfile: "dist/spec-windows-x64.exe" },
];

async function build(targets: BuildTarget[]) {
  // Ensure dist directory exists
  await $`mkdir -p dist`;

  for (const { target, outfile } of targets) {
    console.log(`Building for ${target}...`);

    try {
      await $`bun build ./src/index.ts --compile --minify --target=${target} --outfile=${outfile}`;
      console.log(`  ✓ ${outfile}`);
    } catch (err) {
      console.error(`  ✗ Failed to build for ${target}`);
      if (!isAllPlatforms) {
        process.exit(1);
      }
    }
  }
}

const targets = isAllPlatforms ? allPlatforms : [getCurrentPlatform()];

console.log("Building spec CLI...");
console.log();

await build(targets);

console.log();
console.log("Build complete!");
