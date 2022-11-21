

import { merge } from 'merge-anything';
import { copy } from 'copy-anything';
import * as util from "util";

import * as tsImport from 'ts-import';
import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';


const __dirname = dirname(fileURLToPath(import.meta.url));

const configDefault = tsImport.loadSync(path.join(__dirname, '/default.ts'));
const configLocal = tsImport.loadSync(path.join(__dirname, '/local.ts'));

const Config = copy(merge(configDefault, configLocal));

export default Config.default;
