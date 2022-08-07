# cc-badapple

Play Bad Apple in Cumcord  
_This is very much WIP, don't expect any support from me._

## Usage

1. Download Bad Apple (use [yt-dlp](https://github.com/yt-dlp/yt-dlp))
2. Extract frames into folder with ffmpeg:
   ```bash
   mkdir frames
   ffmpeg -i 【東方】Bad\ Apple\!\!\ ＰＶ【影絵】\ \[FtutLA63Cp8\].webm frames/%d.png
   ```
3. Extract audio with ffmpeg:
   ```bash
   ffmpeg -i 【東方】Bad\ Apple\!\!\ ＰＶ【影絵】\ \[FtutLA63Cp8\].webm -c:a copy audio.opus
   ```
4. Configure everything (see [Configuration](#configuration))
5. Install dependencies: `pnpm i`
6. Process frames: `node process.mjs`
7. Build plugin: `sperm build`
8. Run `http-server --cors`
9. Import `http://localhost:8080/dist`

## Configuration

```js
export default {
  framerate: 30, // The framerate at which your video should run, don't set this too high
  width: 86, // The width of the converted frames
  textsize: "10px", // Adjusted card description size
};
```

## Sample sizes

| Width | Text size |
| ----- | --------- |
| 48    | 16px      |
| 86    | 10px      |
| 280   | 3px       |
