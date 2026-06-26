const chokidar = require('chokidar');

class Watcher {
    constructor(directorypath) {
        this.directorypath = directorypath;
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
            .on('add', (path) => console.log(`File added: ${path}`))
            .on('addDir', (path) => console.log(`Directory added: ${path}`))
            .on('change', (path) => console.log(`File changed: ${path}`))
            .on('unlink', (path) => console.log(`File removed: ${path}`))
            .on('unlinkDir', (path) => console.log(`Directory removed: ${path}`))
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