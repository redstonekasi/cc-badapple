import { injectCSS } from "@cumcord/patcher";
import { id } from "@cumcord/pluginData";
import { installed, togglePlugin } from "@cumcord/plugins";
import { sleep } from "@cumcord/utils";
import config from "./config.mjs";

const originalDesc = installed.ghost[id].manifest.description;
let running = false;
let audio;
let uninjectStyles;

const wait = () => sleep(1000 / config.framerate);

async function run() {
  if (running) return;
  running = true;

  uninjectStyles = injectCSS(`.cumcord-card-description{font-size:${config.textsize};}`);

  audio = new Audio("http://localhost:8080/audio.opus");
  const frames = await fetch("http://localhost:8080/frames.json", { cache: "no-cache" }).then((r) =>
    r.json(),
  );

  await audio.play();

  let waitP = wait();
  for (let i = 0; i < frames.length && running; i++) {
    if (installed.ghost[id]) installed.store[id].manifest.description = frames[i];
    await waitP;
    waitP = wait();
  }

  if (installed.ghost[id]?.enabled) togglePlugin(id);
  else stop();
}

function stop() {
  running = false;
  audio?.pause();
  uninjectStyles?.();
  if (installed.ghost[id]) installed.store[id].manifest.description = originalDesc;
}

run();
export const onUnload = stop;
