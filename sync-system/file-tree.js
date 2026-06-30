const fs = require('node:fs/promises');
const path = require('path');
const { Metadata } = require('./metadata');
const { Node } = require('./node');


class FileTree {
    constructor(rootPath) {
        this.rootPath = path.resolve(rootPath);
        this.root = null;
        this.nodeMap = new Map(); // add logic for this later for quick lookup of nodes by their paths if needed
    }
    // Build the file tree starting from the root path, or can be called with a specific path to build a subtree
    async build(nodePath = this.rootPath) {
        this.root = await this._buildNode(nodePath);
        console.log(`[TREE] Built: ${nodePath}`);
    }
    // helper function to recursively build the file tree
    async _buildNode(currentPath) {
        if (currentPath.basename.startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const stats = await fs.stat(currentPath);
        const metadata = new Metadata(stats.size, stats.mtime);
        const isDirectory = stats.isDirectory(); //does this work??
        const node = new Node(path.basename(currentPath), isDirectory, metadata);

        this.nodeMap.set(currentPath, node);

        if (isDirectory) {
            const entries = await fs.readdir(currentPath);
            for (const entry of entries) {
                const entryPath = path.join(currentPath, entry);
                const childNode = await this._buildNode(entryPath);
                childNode.parent = node;
                node.children.set(entry, childNode);
            }
        }
        return node;
    }

    async add(filePath) {
        if (filePath.basename.startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const dirPath = path.dirname(filePath);
        const name = path.basename(filePath);
        const parentNode = this.nodeMap.get(dirPath);

        // check if the parent directory exists in the tree, if not, throw an error
        if (!parentNode || !parentNode.isDirectory) {
            throw new Error(`[TREE] Parent directory does not exist for path: ${filePath}`);
        }

        const node = await this._buildNode(filePath);

        // warn if the file already exists in the tree
        if (parentNode.children.has(name)) {
            console.warn(`[TREE] File already exists: ${filePath}`);
        }
        parentNode.children.set(name, node);
        this.nodeMap.set(filePath, node);
        console.log(`[TREE] Added: ${filePath}`);

        return node;
    }

    //update a file's metadata in the tree, this requires deboucing, and will save time by moving instead of deleting and recreating the node
    async update(filePathFrom, filePathTo) {
        if (filePathFrom.basename.startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const node = this.nodeMap.get(filePathFrom);

        if (!node) {
            throw new Error(`[TREE] File does not exist: ${filePathFrom}`);
        }

        const stats = await fs.stat(filePathTo);
        node.metadata.size = stats.size;
        node.metadata.modified = stats.mtime;
        node.parent.children.delete(node.name);
        node.parent = this.nodeMap.get(path.dirname(filePathTo));
        node.name = path.basename(filePathTo);
        node.parent.children.set(node.name, node);
        this.nodeMap.delete(filePathFrom);
        this.nodeMap.set(filePathTo, node);
        console.log(`[TREE] Updated: ${filePathTo}`);

    }

    remove(filePath) {
        if (filePath.basename.startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const node = this.nodeMap.get(filePath);

        if (!node) {
            throw new Error(`[TREE] File does not exist: ${filePath}`);
        }

        if (node.isDirectory) {
            this._removeDirectory(node);
            return;
        }
        node.parent.children.delete(node.name);
        this.nodeMap.delete(filePath);
        console.log(`[TREE] Removed: ${filePath}`);
    }

    _removeDirectory(node) {
    if (!node || !node.isDirectory) return;

    // recursively delete all descendants from the Map
    const prefix = node.path + path.sep;
    for (const [key] of this.nodeMap) {
      if (key === node.path || key.startsWith(prefix)) {
        this.nodeMap.delete(key);
      }
    }

    // detach from parent
    if (node.parent) {
      node.parent.children.delete(node.name);
    }
    console.log(`[TREE] Directory Removed: ${node.path}`);
  }
}
exports.FileTree = FileTree;