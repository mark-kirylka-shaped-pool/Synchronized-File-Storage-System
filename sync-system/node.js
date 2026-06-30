class Node {
  constructor(name, isDirectory, metadata = null) {
    this.name = name;                 // File or folder name
    this.isDirectory = isDirectory;
    this.metadata = metadata;         // Instance of your Metadata class (size, mtime)
    this.parent = null;              // Reference to the parent Node
    this.children = isDirectory ? new Map() : null;  // Only used if isDirectory === true
  }


  // Helper to get the full absolute path of this node
  getPath() {
    if (!this.parent) return this.name; // root case
    return `${this.parent.getPath()}/${this.name}`;
  }
  
}

exports.Node = Node;