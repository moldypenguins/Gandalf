'use strict';
/**
 * Gandalf
 * Copyright (c) 2020 Gandalf Planetarion Tools
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @name frodo.js
 * @version 2023-01-16
 * @summary Ticker
 * @param {string} -h,--havoc start Frodo in havoc mode
 * @param {flag} -f,--force force to start now
 * @param {flag} -o,--overwrite overwrite current tick
 **/


import Bree from 'bree';
import minimist from 'minimist';
import dayjs from 'dayjs';


let argv = minimist(process.argv.slice(2), {
  string: [],
  boolean: ['havoc', 'force', 'overwrite'],
  alias: {c:'havoc', f:'force', o:'overwrite'},
  default: {'havoc':false, 'force':false, 'overwrite':false},
  unknown: false
});

if(argv.havoc) { console.log("Havoc enabled."); }
if(argv.force) { console.log("Force enabled."); }
if(argv.overwrite) { console.log("Overwrite enabled."); }

const bree = new Bree({
  root: __dirname,
  doRootCheck: false,
  closeWorkerAfterMs: 60000 * 55, // 55 minutes
  hasSeconds: true,
  worker: {
    workerData: {'havoc': !!argv.havoc, 'overwrite': !!argv.overwrite}
  },
  outputWorkerMetadata: true,
  jobs: [
    {
      name: 'Frodo',
      path: 'quest',
      cron: argv.havoc ? '30 0,15,30,45 * * * *' : '30 0 * * * *'
    }
  ],
  errorHandler: (error, workerMetadata) => { console.error(error); },
  workerMessageHandler: (message, workerMetadata) => { console.log(message.message); }
});

if(argv.force) {
  bree.config.jobs.push({
    name: 'Frodo-force',
    path: 'quest',
    date: dayjs().add(5, 'seconds').toDate()
  });
}

bree.on('worker created', (name) => {
  console.log(`Frodo embarking on The Quest Of The Ring.`);
  //console.log(bree.workers.get(name));
});

bree.on('worker deleted', (name) => {
  console.log('Quest completed. To the Undying Lands!');
  //console.log(!bree.worker.has(name));
});

await bree.start();
