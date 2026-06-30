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
        this.root = await this._buildNode(path.resolve(nodePath));
        console.log(`[TREE] Built: ${nodePath}`);
    }
    // helper function to recursively build the file tree
    async _buildNode(currentPath) {
        const resolvedPath = path.resolve(currentPath);
        if (path.basename(resolvedPath).startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const stats = await fs.stat(resolvedPath);
        const metadata = new Metadata(stats.size, stats.mtime);
        const isDirectory = stats.isDirectory();
        const node = new Node(path.basename(resolvedPath), isDirectory, metadata);
        node.path = resolvedPath;

        this.nodeMap.set(resolvedPath, node);

        if (isDirectory) {
            const entries = await fs.readdir(resolvedPath);
            for (const entry of entries) {
                const entryPath = path.join(resolvedPath, entry);
                const childNode = await this._buildNode(entryPath);
                if (childNode) {
                    childNode.parent = node;
                    node.children.set(entry, childNode);
                }
            }
        }
        return node;
    }

    async add(filePath) {
        const resolvedPath = path.resolve(filePath);
        if (path.basename(resolvedPath).startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const dirPath = path.dirname(resolvedPath);
        const name = path.basename(resolvedPath);
        const parentNode = this.nodeMap.get(dirPath);

        // check if the parent directory exists in the tree, if not, throw an error
        if (!parentNode || !parentNode.isDirectory) {
            throw new Error(`[TREE] Parent directory does not exist for path: ${filePath}`);
        }

        const node = await this._buildNode(resolvedPath);

        // warn if the file already exists in the tree
        if (parentNode.children.has(name)) {
            console.warn(`[TREE] File already exists: ${resolvedPath}`);
        }
        parentNode.children.set(name, node);
        this.nodeMap.set(resolvedPath, node);
        console.log(`[TREE] Added: ${resolvedPath}`);

        return node;
    }

    //update a file's metadata in the tree, this requires deboucing, and will save time by moving instead of deleting and recreating the node
    async update(filePathFrom, filePathTo) {
        const resolvedFrom = path.resolve(filePathFrom);
        const resolvedTo = path.resolve(filePathTo);
        if (path.basename(resolvedFrom).startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const node = this.nodeMap.get(resolvedFrom);

        if (!node) {
            throw new Error(`[TREE] File does not exist: ${resolvedFrom}`);
        }

        const stats = await fs.stat(resolvedTo);
        node.metadata.size = stats.size;
        node.metadata.modified = stats.mtime;
        node.parent.children.delete(node.name);
        node.parent = this.nodeMap.get(path.dirname(resolvedTo));
        node.name = path.basename(resolvedTo);
        node.parent.children.set(node.name, node);
        node.path = resolvedTo;
        this.nodeMap.delete(resolvedFrom);
        this.nodeMap.set(resolvedTo, node);
        console.log(`[TREE] Updated: ${resolvedTo}`);

    }

    remove(filePath) {
        const resolvedPath = path.resolve(filePath);
        if (path.basename(resolvedPath).startsWith('.')) {
            return null; // skip hidden files and directories
        }
        const node = this.nodeMap.get(resolvedPath);

        if (!node) {
            throw new Error(`[TREE] File does not exist: ${resolvedPath}`);
        }

        if (node.isDirectory) {
            this._removeDirectory(node);
            return;
        }
        node.parent.children.delete(node.name);
        this.nodeMap.delete(resolvedPath);
        console.log(`[TREE] Removed: ${resolvedPath}`);
    }

    _removeDirectory(node) {
    if (!node || !node.isDirectory) return;

    // recursively delete all descendants from the Map
    const prefix = node.getPath() + path.sep;
    for (const [key] of this.nodeMap) {
      if (key === node.getPath() || key.startsWith(prefix)) {
        this.nodeMap.delete(key);
      }
    }

    // detach from parent
    if (node.parent) {
      node.parent.children.delete(node.name);
    }
    console.log(`[TREE] Directory Removed: ${node.getPath()}`);
  }
}
exports.FileTree = FileTree;