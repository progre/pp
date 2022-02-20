#!/usr/bin/env node

import fs from "fs";
import zlib from "zlib";
console.log(
  zlib.brotliCompressSync(fs.readFileSync(process.argv[2])).toString("base64")
);
