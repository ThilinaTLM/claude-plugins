import { cpSync } from "node:fs";
import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

// Copy static assets into dist/
cpSync("manifest.json", "dist/manifest.json");
cpSync("icons", "dist/icons", { recursive: true });

const buildOptions: esbuild.BuildOptions = {
	entryPoints: {
		background: "src/index.ts",
		content: "src/content.ts",
	},
	bundle: true,
	outdir: "dist",
	format: "iife",
	target: "esnext",
	logLevel: "info",
};

if (watch) {
	const ctx = await esbuild.context(buildOptions);
	await ctx.watch();
	console.log("Watching for changes...");
} else {
	await esbuild.build(buildOptions);
}
