import sharp from "sharp";
import fs from "fs/promises";
import process from "process";
import config from "./config.mjs";

const base = 0x2800;
const brailleMap = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

async function processFrame(frame, w) {
  const image = await sharp(`frames/${frame}`);
  const { width, height } = await image.metadata();

  const data = await image
    .toColourspace("b-w")
    .resize({
      width: w,
      height: Math.floor((w / width * height) / 2) * 2,
      fit: "fill",
    })
    .raw()
    .toBuffer();

  const map = [];
  for (const index in [...data]) {
    const y = Math.floor(index / w);
    const x = Math.floor(index % w);
    const row = Math.floor(y / 4);
    const col = Math.floor(x / 2);
    const braille = brailleMap[Math.floor(y % 4)][Math.floor(x % 2)];

    map[row] ??= [];
    if (!!Math.round(data[index] / 255))
      map[row][col] |= braille;
    else
      map[row][col] &= ~braille;
  }

  return map.map((line) => line.map((b) => String.fromCharCode(base | b)).join("")).join("\n");
}

const files = (await fs.readdir("frames")).sort((a, b) => a.split(".")[0] - b.split(".")[0]);
const frames = [];
for (const frame of files) {
  const processed = await processFrame(frame, config.width);
  frames.push(processed);

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`${frame} processed`);
}

process.stdout.write("\n");

await fs.writeFile("frames.json", JSON.stringify(frames));
console.log("done");
