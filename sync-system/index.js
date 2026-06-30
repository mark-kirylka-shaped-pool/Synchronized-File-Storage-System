const {SpiderSyncEngine} = require('./spider-sync-engine')
const path = require('path');
const directorypath = path.resolve(process.argv[2]);
const engine = new SpiderSyncEngine(directorypath);
engine.start();
