const fs = require('node:fs/promises');
const {Metadata} = require('./metadata')

class Snapshot {

    constructor(directorypath) {
        this.directorypath = directorypath;
        this.filepaths = new Map();
    }

    //display all files in the snapshot
    getAllFiles() {
        return this.filepaths.forEach((value, key) => key);
    }

    //display all metadata for a specific file
    getFile(filepath) {
        return [path = filepath, metadata = this.filepaths.get(filepath).toString()];
    }

    //set the snapshot to a list of files
    async setFiles(filepaths) {
        await Promise.all(filepaths.map(async (filepath) => {
            if (filepath.startsWith('.')) {
                return;
            }
            const path = this.directorypath + '/' + filepath;
            const stats = await fs.stat(path);
            this.filepaths.set(path, new Metadata(stats.size, stats.mtime));
        }));
    }

    //compare this snapshot with another snapshot, return the differences
    compareSnapshots(other) {
        const differences = [];
        const previousFiles = new Set(this.filepaths.keys());
        other.filepaths.forEach((metadata, filename) => {
            if (!previousFiles.has(filename)) {
                differences.push(`${filename} created`);
                this.filepaths.set(filename, metadata);
                //here the file would need to be uploaded to server
            } else {
                const oldMetadata = this.filepaths.get(filename);
                if (oldMetadata.size !== metadata.size || oldMetadata.modified.getTime() !== metadata.modified.getTime()) {
                    differences.push(`${filename} modified`);
                    //here the file would need to be updated on the server
                }
            }
            previousFiles.delete(filename);
        });
        previousFiles.forEach(filename => {
            differences.push(`${filename} deleted`);
            this.files.delete(filename);
            //here the file would need to be deleted from the server
        });
        return differences;
    }
}
exports.Snapshot = Snapshot;