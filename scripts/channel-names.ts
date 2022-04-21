#!/usr/bin/env -S deno run --allow-net
export {};

const res = await fetch("https://p-at.net/index.txt");
const index = await res.text();
const channelNames = index
  .split("\n")
  .filter((line) => line.length > 0)
  .map((line) => line.split("<>"))
  .filter((columns) => columns[1] !== "00000000000000000000000000000000")
  .map((columns) => columns[0])
  .join(",");
await Deno.stdout.write(new TextEncoder().encode(channelNames));
