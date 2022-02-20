#!/usr/bin/env -S deno run --allow-net
export {};

const res = await fetch("https://p-at.net/index.txt");
const index = await res.text();
const numChannels = index
  .split("\n")
  .filter((line) => line.length > 0)
  .filter(
    (line) => line.split("<>")[1] !== "00000000000000000000000000000000"
  ).length;
await Deno.stdout.write(new TextEncoder().encode(`${numChannels}`));
