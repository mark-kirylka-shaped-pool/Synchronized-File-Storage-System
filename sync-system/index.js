const {SpiderSyncEngine} = require('./spider-sync-engine')
const directorypath = process.argv[2];
const engine = new SpiderSyncEngine(directorypath);
engine.start();
