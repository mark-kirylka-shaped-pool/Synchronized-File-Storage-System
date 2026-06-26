const {Snapshot} = require('./snapshot')
const {Watcher} = require('./watcher')

class SpiderSyncEngine {
    constructor(directorypath) {
        this.directorypath = directorypath;
        this.snapshots = new Snapshot(directorypath);
        this.watcher = new Watcher(directorypath);
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