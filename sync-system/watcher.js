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
            .on('add', (filePath) => {
                console.log(`[WATCHER] File added: ${filePath}`);
                this.snapshot.add(filePath).catch((error) => console.error(error));
            })
            .on('addDir', (dirPath) => {
                console.log(`[WATCHER] Directory added: ${dirPath}`);
                this.snapshot.add(dirPath).catch((error) => console.error(error));
            })
            .on('change', (filePath) => {
                console.log(`[WATCHER] File changed: ${filePath}`);
                this.snapshot.update(filePath, filePath).catch((error) => console.error(error));
            })
            .on('unlink', (filePath) => {
                console.log(`[WATCHER] File removed: ${filePath}`);
                this.snapshot.remove(filePath);
            })
            .on('unlinkDir', (dirPath) => {
                console.log(`[WATCHER] Directory removed: ${dirPath}`);
                this.snapshot.remove(dirPath);
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