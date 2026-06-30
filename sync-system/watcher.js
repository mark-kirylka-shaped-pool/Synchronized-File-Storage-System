const chokidar = require('chokidar');

class Watcher {
    constructor(directorypath, snapshot) {
        this.directorypath = directorypath;
        this.snapshot = snapshot;
        this.watcher = null;
    }

    async start(timeout = 100000) {
        this.watcher = chokidar.watch(this.directorypath,
            {
                persistent: true,
                ignoreInitial: true,
                usePolling: true,
                // interval: 1000
            }
        )
        // this.watcher.on('all', (event, path) => {
        //     console.log(`[ALL] ${event} on ${path}`);
        // });
        this.watcher
            .on('add', (path) => {
                console.log(`[WATCHER] File added: ${path}`);
                this.snapshot.add(path);
            })
            .on('addDir', (path) => {
                console.log(`[WATCHER] Directory added: ${path}`);
                this.snapshot.add(path);
            })
            .on('change', (path) => {
                console.log(`[WATCHER] File changed: ${path}`);
                this.snapshot.update(path, path);
            })
            .on('unlink', (path) => {
                console.log(`[WATCHER] File removed: ${path}`);
                this.snapshot.remove(path);
            })
            .on('unlinkDir', (path) => {
                console.log(`[WATCHER] Directory removed: ${path}`);
                this.snapshot.remove(path);
            })
            .on('error', (error) => console.error('Watcher error:', error))
            .on('ready', () => {
                console.log('Initial scan complete. Watching for changes...');
            });

        if (timeout > 0) {
            setTimeout(() => {
                this.stop();
            }, timeout);
        }
        return this.watcher;
    }
    async stop() {
        if (this.watcher) {
            await this.watcher.close();
            console.log('Watcher stopped.');
            this.watcher = null;
        }
    }
}

exports.Watcher = Watcher;