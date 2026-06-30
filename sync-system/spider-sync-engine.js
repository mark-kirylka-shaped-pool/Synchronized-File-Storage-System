const {Snapshot} = require('./snapshot')
const {Watcher} = require('./watcher')
const path = require('path');

class SpiderSyncEngine {
    constructor(directorypath) {
        this.snapshot = new Snapshot(directorypath);
        this.snapshot.build();
        this.watcher = new Watcher(directorypath, this.snapshot);
    }

    start() {
        // Start the synchronization process
        // parse and create a new watcher to monitor each directory and start them
        // Example: const watcher = new Watcher('/path/to/directory');
        // Start the watchers
        this.watcher.start();
        // if watcher reports change, create a new snapshot and compare it with the previous one
        // console.log(differences);

    }
}

exports.SpiderSyncEngine = SpiderSyncEngine;