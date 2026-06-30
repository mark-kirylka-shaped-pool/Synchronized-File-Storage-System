const fs = require('node:fs/promises');
const {FileTree} = require('./file-tree');
const path = require('node:path');

//this is a wrapper snapshot class that will create a file tree, store it, update it, and perform any higher level logic regarding it.
class Snapshot {

    constructor(directorypath) {
        this.fileTree = new FileTree(directorypath);
    }

    async build() {
        await this.fileTree.build();
        console.log(`[SNAPSHOT] Built snapshot for: ${this.fileTree.rootPath}`);
    }

    async add(filePath) {
        await this.fileTree.add(filePath);
    }

    async update(filePathFrom, filePathTo) {
        await this.fileTree.update(filePathFrom, filePathTo);
    }

    remove(filePath) {
        this.fileTree.remove(filePath);
    }
}
exports.Snapshot = Snapshot;