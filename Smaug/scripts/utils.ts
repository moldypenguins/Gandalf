

import Config from "galadriel";

import { bgCyan, black } from 'kolorist'

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const port = parseInt(process.env.PORT || '') || 3303
export const r = (...args: string[]) => path.resolve(__dirname, '..', ...args)
export const isDev = Config.web.env !== 'production'

export function log(name: string, message: string) {
  console.log(black(bgCyan(` ${name} `)), message)
}
