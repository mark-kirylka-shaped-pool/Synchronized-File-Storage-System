const {Snapshot} = require('./snapshot')
const {Watcher} = require('./watcher')
const path = require('path');

class SpiderSyncEngine {
    constructor(directorypath) {
        this.snapshot = new Snapshot(directorypath);
        this.watcher = new Watcher(directorypath, this.snapshot);
    }

    async start() {
        await this.snapshot.build();
        await this.watcher.start();
    }
}

exports.SpiderSyncEngine = SpiderSyncEngine;