import { execSync } from "child_process";

console.log("Running scheduled micro-review...");

execSync("npm run lint && npm run test", { stdio: "inherit" });

