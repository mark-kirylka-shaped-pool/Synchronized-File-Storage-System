class Metadata {
    constructor(size, modified) {
        this.size = size;
        this.modified = modified;
    }
    toString() {
        return `Size: ${this.size}, Modified: ${this.modified}`;
    }
}
exports.Metadata = Metadata;