// Build situs statis ORBIT MATH (Mode Demo) untuk GitHub Pages → folder out/
// Pemakaian: npm run build:pages   (opsional: PAGES_BASE_PATH=/nama-repo)
// Middleware & route handler auth hanya untuk mode Supabase (butuh server),
// jadi dipindahkan sementara selama build lalu dikembalikan.
import { execSync } from "node:child_process";
import { existsSync, renameSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath menangani spasi (%20) & huruf drive Windows dengan benar.
const root = fileURLToPath(new URL("..", import.meta.url));
if (!existsSync(join(root, "package.json"))) throw new Error(`Folder proyek tidak ditemukan: ${root}`);
const hold = join(root, ".pages-hold");
const moves = [
  [join(root, "src", "middleware.ts"), join(hold, "middleware.ts")],
  [join(root, "src", "app", "auth"), join(hold, "auth")],
];

rmSync(hold, { recursive: true, force: true });
mkdirSync(hold, { recursive: true });
const moved = [];
try {
  for (const [from, to] of moves) {
    if (existsSync(from)) {
      renameSync(from, to);
      moved.push([from, to]);
    }
  }
  execSync(`"${process.execPath}" "${join(root, "node_modules", "next", "dist", "bin", "next")}" build`, {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      STATIC_EXPORT: "true",
      PAGES_BASE_PATH: process.env.PAGES_BASE_PATH ?? "/orbit-math",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });
  // GitHub Pages: jangan proses dengan Jekyll (folder _next harus ikut).
  writeFileSync(join(root, "out", ".nojekyll"), "");
  console.log("\n✔ Situs statis siap di folder out/");
} finally {
  for (const [from, to] of moved.reverse()) renameSync(to, from);
  rmSync(hold, { recursive: true, force: true });
}
