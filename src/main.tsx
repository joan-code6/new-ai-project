import React from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import ChafaGifPlayer from "./components/ChafaGifPlayer.js";

export type MainAppProps = {
  gifPath?: string;
  fps?: number;
  gifWidth?: number;
  gifHeight?: number;
  gifZIndex?: number;
  gifPosition?: {
    left: number;
    top: number;
  };
};

export function parseMainAppArgs(argv: string[]): MainAppProps {
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
  const widthArg = args.get("width");
  const heightArg = args.get("height");
  const leftArg = args.get("left");
  const topArg = args.get("top");
  const zIndexArg = args.get("z-index");

  const fpsValue = fpsArg ? Number.parseInt(fpsArg, 10) : undefined;
  const widthValue = widthArg ? Number.parseInt(widthArg, 10) : undefined;
  const heightValue = heightArg ? Number.parseInt(heightArg, 10) : undefined;
  const leftValue = leftArg ? Number.parseInt(leftArg, 10) : undefined;
  const topValue = topArg ? Number.parseInt(topArg, 10) : undefined;
  const zIndexValue = zIndexArg ? Number.parseInt(zIndexArg, 10) : undefined;
  let gifPosition: MainAppProps["gifPosition"];
  if (
    leftValue !== undefined &&
    topValue !== undefined &&
    Number.isFinite(leftValue) &&
    Number.isFinite(topValue)
  ) {
    gifPosition = {
      left: leftValue,
      top: topValue,
    };
  }

  return {
    gifPath,
    fps: Number.isFinite(fpsValue) ? fpsValue : undefined,
    gifWidth: Number.isFinite(widthValue) ? widthValue : undefined,
    gifHeight: Number.isFinite(heightValue) ? heightValue : undefined,
    gifZIndex: Number.isFinite(zIndexValue) ? zIndexValue : undefined,
    gifPosition,
  };
}

const MainApp: React.FC<MainAppProps> = ({
  gifPath,
  fps,
  gifWidth,
  gifHeight,
  gifZIndex,
  gifPosition,
}) => {
  const colors = {
    main: "#0cbddb",
    black: "#000000",
    secondary: "",
  };
  const { stdout } = useStdout();
  const { exit } = useApp();
  const username = "Bennet";

  useInput((input) => {
    if (input === "q") {
      exit();
    }
  });

  const gifLayer = (
    <Box>
      <ChafaGifPlayer
        gifPath={gifPath}
        fps={fps}
        width={gifWidth}
        height={gifHeight}
        position={gifPosition}
        onExit={() => exit()}
      />
    </Box>
  );

  const headerLayer = (
    <Box
      borderColor={colors.main}
      borderStyle="bold"
      alignSelf="center"
      width="70%"
      height="20%"
    >
      <Box width="50%">
        <Text></Text>
      </Box>
      <Box
        width="50%"
        borderStyle="single"
        borderTop={false}
        borderBottom={false}
        borderLeft={true}
        borderRight={false}
        borderColor={colors.main}
      >
        <Text>Hey, {username}</Text>
      </Box>
    </Box>
  );

  const renderGifOnTop = (gifZIndex ?? 0) > 0;

  return (
    <Box
      width={stdout.columns}
      height={stdout.rows}
      borderStyle="single"
      borderColor={colors.main}
      backgroundColor={colors.black}
      flexDirection="column"
    >
      {renderGifOnTop ? headerLayer : gifLayer}
      {renderGifOnTop ? gifLayer : headerLayer}
    </Box>
  );
};

export default MainApp;
