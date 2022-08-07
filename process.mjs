import sharp from "sharp";
import fs from "fs/promises";
import process from "process";
import config from "./config.mjs";

const chars = "░▒▓█";
const charScale = 3 / (255 * 3);
const getChar = (c) => chars[Math.floor(c.reduce((a, b) => a + b) * charScale)];

// observe me slowly getting closer to madness by looking at the nested comments
// const getChar = (c) => chars[Math.floor(c * charScale)];

// async function processFrame(frame, w) {
//   const image = await sharp(`frames/${frame}`);
//   const { width, height } = await image.metadata();

//   const data = await image
//     .toColourspace("b-w")
//     .resize({
//       width: w,
//       height: Math.floor((w / width * height) / 2),
//       fit: "fill",
//     })
//     .raw()
//     .toBuffer();

//   // const mapped = [];
//   // for (const index of data) {
//   //   const i = Math.floor(index / w);
//   //   mapped[i] ??= [];
//   //   mapped[i][index % w] = getChar(data[index]);
//   // }

//   // return mapped;

//   // // this is horrid
//   // return [...data]
//   //   .map(getChar)
//   //   .reduce((acc, curr, index) => acc + curr + (index % w === w - 1 ? "\n" : ""), "");
// }

// this is actually faster than the above
async function processFrame(frame, w) {
  const image = await sharp(`frames/${frame}`);
  const { width, height } = await image.metadata();
  const resized = await image.resize({
    width: w,
    height: Math.floor(((w / width) * height) / 2),
    fit: "fill",
    kernel: "nearest",
  });

  const data = await resized.raw().toBuffer();

  const pixels = [];
  for (const index in data) {
    const i = Math.floor(index / 3);
    pixels[i] ??= [];
    pixels[i][index % 3] = data[index];
  }
  const converted = pixels.map(getChar);

  const mapped = [];
  for (const index in converted) {
    const i = Math.floor(index / w);
    mapped[i] ??= [];
    mapped[i][index % w] = converted[index];
  }

  return mapped.map((line) => line.join("")).join("\n");
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
