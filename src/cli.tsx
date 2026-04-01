import React from "react";
import { render } from "ink";
import MainApp from "./main.js";

function parseArgs(argv: string[]): { gifPath?: string; fpsOverride?: number } {
  const args = new Map<string, string>();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      args.set(key, "true");
      continue;
    }

    args.set(key, value);
    i += 1;
  }

  const gifPath = args.get("gif");
  const fpsArg = args.get("fps");
  const fpsValue = fpsArg ? Number.parseInt(fpsArg, 10) : undefined;

  return {
    gifPath,
    fpsOverride: Number.isFinite(fpsValue) ? fpsValue : undefined,
  };
}

const { gifPath, fpsOverride } = parseArgs(process.argv.slice(2));

render(React.createElement(MainApp, { gifPath, fps: fpsOverride }));
