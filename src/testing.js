"use strict";

const cliProgress = require("cli-progress");

let fileSizeCounter = 0;
let endProgressCounter = 0;

/**
 * Set the custom upload progress tracker.
 *
 */
const onUploadProgress = (progress, { loaded, total }) => {
  let progressOutput = Math.floor((loaded * 100) / total);

  if (progressOutput === 0 && fileSizeCounter === 0) {
    process.stdout.write(" The uploading File size is " + total + " bytes.\n\n");
    process.stdout.moveCursor(0, -1);
    fileSizeCounter++;
  }

  // create new progress bar with custom token "speed"
  const bar = new cliProgress.Bar({
    format: "-> uploading [{bar}] " + progressOutput + "% {eta_formatted} ",
    fps: 1,
  });

  // initialize the bar - set payload token "speed" with the default value "N/A"
  bar.start(100, 0, {
    speed: "N/A",
  });
  bar.updateETA(Buffer);
  // update bar value. set custom token "speed" to 125
  bar.update(progressOutput, {
    speed: "122",
  });

  // stop the bar
  bar.stop();

  if (progressOutput === 100) {
    process.stdout.write(`\n`);
    process.stdout.moveCursor(0, -1);
    process.stdout.write(`\n`);
    endProgressCounter++;
    if (endProgressCounter === 2) {
      process.stdout.write(`\n\n`);
    }
  }
  process.stdout.moveCursor(0, -1);
};

module.exports = {
  onUploadProgress,
};
