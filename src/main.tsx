import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import { TextInput } from "@inkjs/ui";
import ChafaGifPlayer from "./components/ChafaGifPlayer.js";

const gifConfig = {
  gifPath: undefined as string | undefined,
  fps: 30,
  width: undefined as number | undefined,
  height: undefined as number | undefined,
  position: undefined as { top?: number; left?: number } | undefined,
};

const MainApp: React.FC = () => {
  const colors = {
    main: "#0cbddb",
    black: "#000000",
    secondary: "",
  };
  const [userInput, setUserInput] = useState("");
  const { stdout } = useStdout();
  const { exit } = useApp();
  const username = "Bennet";
  const [renderKey, setRenderKey] = useState(0);

  // Handle terminal resize events
  useEffect(() => {
    const handleResize = () => {
      setRenderKey((prev) => prev + 1);
    };

    process.stdout.on("resize", handleResize);

    return () => {
      process.stdout.off("resize", handleResize);
    };
  }, []);

  useInput((input) => {
    if (input === "q") {
      exit();
    }
  });

  const welcomeBoxWidth = Math.max(40, Math.floor(stdout.columns * 0.8));
  const welcomeBoxHeight = Math.max(8, Math.floor(stdout.rows * 0.32));
  const boxLeftOffset = Math.floor((stdout.columns - welcomeBoxWidth) / 2);
  const maxGifHeight = Math.max(4, welcomeBoxHeight - 2);
  const gifWidth = maxGifHeight * 2;
  const gifLeft = Math.max(0, boxLeftOffset + welcomeBoxWidth - gifWidth - 4);
  const gifTop = 3;
  const today = new Date().toLocaleString("default", { weekday: "long" });

  const handleSubmit = (input: string) => {
    setUserInput(input);
    // Handle the submitted input here
  };

  // Force recalculation on resize
  const currentDimensions = useMemo(
    () => ({ columns: stdout.columns, rows: stdout.rows }),
    [stdout.columns, stdout.rows, renderKey],
  );

  return (
    <Box
      width={currentDimensions.columns}
      height={currentDimensions.rows}
      borderStyle="single"
      borderColor={colors.main}
      backgroundColor={colors.black}
      flexDirection="column"
    >
      <ChafaGifPlayer
        gifPath={gifConfig.gifPath}
        fps={gifConfig.fps}
        width={gifConfig.width ?? gifWidth}
        height={gifConfig.height ?? maxGifHeight}
        position={{ ...gifConfig.position, top: gifTop, left: gifLeft }}
        onExit={() => exit()}
      />
      <Box flexDirection="column" alignItems="center" gap={1} paddingTop={1}>
        <Box
          borderColor={colors.main}
          borderStyle="round"
          width={welcomeBoxWidth}
          height={welcomeBoxHeight}
          paddingX={2}
          paddingY={1}
          flexDirection="row"
        >
          <Box width="70%" flexDirection="column" justifyContent="center">
            <Text>Hello {username},</Text>
            <Text>what are you cooking today?</Text>
          </Box>
          <Box width="30%" alignItems="center" justifyContent="center">
            <Text> </Text>
          </Box>
        </Box>

        <Box width={welcomeBoxWidth} borderColor={colors.main} borderStyle="round">
          <TextInput placeholder=">" onSubmit={handleSubmit} />
        </Box>
      </Box>
    </Box>
  );
};

export default MainApp;
