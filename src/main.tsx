import React from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import ChafaGifPlayer from "./components/ChafaGifPlayer.js";

type MainAppProps = {
  gifPath?: string;
  fps?: number;
};

const MainApp: React.FC<MainAppProps> = ({ gifPath, fps }) => {
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

  return (
    <Box
      width={stdout.columns}
      height={stdout.rows}
      borderStyle="single"
      borderColor={colors.main}
      backgroundColor={colors.black}
      flexDirection="column"
    >
      <Box
        borderColor={colors.main}
        borderStyle="bold"
        alignSelf="center"
        padding-top="50%"
      >
        <Box>
          <Text>Hey, {username}</Text>
        </Box>
      </Box>
      <Box>
        <ChafaGifPlayer gifPath={gifPath} fps={fps} onExit={() => exit()} />
      </Box>
    </Box>
  );
};

export default MainApp;
