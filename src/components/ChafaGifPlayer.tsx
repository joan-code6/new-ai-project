import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Text, useStdout} from 'ink';
import {spawn, spawnSync, type ChildProcess} from 'node:child_process';
import {existsSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

export type ChafaGifPlayerProps = {
  gifPath?: string;
  fps?: number;
  width?: number;
  height?: number;
  position?: {
    left?: number;
    top?: number;
  };
  onExit?: (exitCode: number) => void;
};

function resolveGifPath(requestedPath?: string): string | undefined {
  if (requestedPath && existsSync(requestedPath) && statSync(requestedPath).isFile()) {
    return requestedPath;
  }

  const gifsDir = 'gifs';
  if (!existsSync(gifsDir) || !statSync(gifsDir).isDirectory()) {
    return undefined;
  }

  const gifFiles = readdirSync(gifsDir, {withFileTypes: true})
    .filter(entry => entry.isFile() && /\.gif$/i.test(entry.name))
    .map(entry => join(gifsDir, entry.name))
    .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

  return gifFiles[0];
}

function hasChafaBinary(): boolean {
  const result = spawnSync('chafa', ['--version'], {
    stdio: 'ignore',
    shell: false,
  });

  return !result.error && result.status === 0;
}

// Render the chafa output into a centered region and avoid clearing the entire terminal.
const ChafaGifPlayer: React.FC<ChafaGifPlayerProps> = ({
  gifPath,
  fps = 30,
  width,
  height,
  position,
  onExit
}) => {
  const {stdout} = useStdout();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const childRef = useRef<ChildProcess | null>(null);

  const resolvedGifPath = useMemo(() => resolveGifPath(gifPath), [gifPath]);
  const normalizedFps = Math.max(1, Math.min(120, Math.floor(fps)));

  useEffect(() => {
    if (!resolvedGifPath) {
      setErrorMessage('No GIF found. Provide one via prop or add a .gif file to gifs/.');
      return;
    }

    if (!hasChafaBinary()) {
      setErrorMessage('chafa was not found in PATH. Install chafa to use ChafaGifPlayer.');
      return;
    }

    const terminalColumns = Math.max(20, process.stdout.columns ?? 80);
    const terminalRows = Math.max(10, process.stdout.rows ?? 24);
    const renderCols = Math.max(
      4,
      width !== undefined ? Math.floor(width) : Math.floor(terminalColumns * 0.6)
    );
    const renderRows = Math.max(
      4,
      height !== undefined ? Math.floor(height) : Math.floor(terminalRows * 0.7)
    );
    const offsetCalibrationCols = 0;
    const offsetCalibrationRows = 0;
    const centeredLeft = Math.max(0, Math.floor((terminalColumns - renderCols) / 2) + offsetCalibrationCols);
    const centeredTop = Math.max(0, Math.floor((terminalRows - renderRows) / 2) + offsetCalibrationRows);
    const offsetLeft = Math.max(
      0,
      position?.left !== undefined ? Math.floor(position.left) : centeredLeft
    );
    const offsetTop = Math.max(
      0,
      position?.top !== undefined ? Math.floor(position.top) : centeredTop
    );
    const args = [
      '--format',
      'symbols',
      '--colors',
      'full',
      '--color-space',
      'din99d',
      '--work',
      '9',
      '--relative',
      'on',
      '--view-size',
      `${renderCols}x${renderRows}`,
      '--align',
      'hcenter,vcenter',
      '--size',
      `${renderCols}x${renderRows}`,
      '--animate=on',
      '--speed',
      `${normalizedFps}fps`,
      resolvedGifPath,
    ];

    const child = spawn('chafa', args, {
      stdio: ['ignore', 'inherit', 'pipe'],
      shell: false,
    });
    childRef.current = child;

    // Hide the cursor while animating.
    try {
      stdout.write('\x1b[?25l');
    } catch (e) {
      // ignore if writing fails
    }

    // Anchor a centered viewport once; chafa draws relative to this origin.
    try {
      stdout.write(`\x1b[${offsetTop + 1};${offsetLeft + 1}H`);
    } catch {
      // ignore if writing fails
    }

    child.stderr.on('data', chunk => {
      const message = chunk.toString('utf8').trim();
      if (message.length > 0) {
        setErrorMessage(message);
      }
    });

    child.on('close', code => {
      childRef.current = null;
      onExit?.(code ?? 0);
    });

    return () => {
      if (childRef.current) {
        childRef.current.kill('SIGTERM');
        childRef.current = null;
      }
      // Reset attributes and show cursor back.
      try {
        stdout.write('\x1b[0m');
        stdout.write('\x1b[?25h');
      } catch (e) {
        // ignore
      }
    };
  }, [resolvedGifPath, normalizedFps, width, height, position, onExit, stdout]);

  if (errorMessage) {
    return <Text color="red">{errorMessage}</Text>;
  }

  return null;
};

export default ChafaGifPlayer;
