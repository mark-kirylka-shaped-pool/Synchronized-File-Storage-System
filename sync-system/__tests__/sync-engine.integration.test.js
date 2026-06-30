const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { generateDummyTree } = require('../scripts/generate-dummy-tree');
const { SpiderSyncEngine } = require('../spider-sync-engine');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const nodeExists = (tree, absolutePath) => tree.nodeMap.has(path.resolve(absolutePath));

describe('SpiderSyncEngine integration', () => {
  let tempDir;
  let engine;
  let tree;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-engine-'));
    await generateDummyTree(tempDir, {
      fileCount: 200,
      directoryCount: 20,
      depth: 2,
    });

    engine = new SpiderSyncEngine(tempDir);
    await engine.start();
    tree = engine.snapshot.fileTree;

    // Give the watcher a moment to settle after initial scan.
    await wait(500);
  }, 120000);

  afterAll(async () => {
    if (engine && engine.watcher) {
      await engine.watcher.stop();
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('handles adding files', async () => {
    const newFile = path.join(tempDir, 'added-file.txt');
    await fs.writeFile(newFile, 'added content', 'utf8');
    await wait(500);

    expect(nodeExists(tree, newFile)).toBe(true);
  });

  it('handles updating files', async () => {
    const existingFile = path.join(tempDir, 'dir-000', 'file-00000.txt');
    await fs.writeFile(existingFile, 'updated content', 'utf8');
    await wait(500);

    expect(nodeExists(tree, existingFile)).toBe(true);
    const node = tree.nodeMap.get(path.resolve(existingFile));
    expect(node.metadata.size).toBeGreaterThan(0);
  });

  it('handles removing files', async () => {
    const removeFile = path.join(tempDir, 'dir-001', 'file-00001.txt');
    await fs.rm(removeFile, { force: true });
    await wait(500);

    expect(nodeExists(tree, removeFile)).toBe(false);
  });

  it('handles moving files', async () => {
    const sourceFile = path.join(tempDir, 'dir-002', 'file-00002.txt');
    const destFile = path.join(tempDir, 'dir-002', 'file-00002-moved.txt');
    await fs.rename(sourceFile, destFile);
    await wait(500);

    expect(nodeExists(tree, sourceFile)).toBe(false);
    expect(nodeExists(tree, destFile)).toBe(true);
  });

  it('handles directories with nested files', async () => {
    const dirPath = path.join(tempDir, 'incoming-dir');
    const childFile = path.join(dirPath, 'inner-file.txt');
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(childFile, 'inner content', 'utf8');
    await wait(500);

    expect(nodeExists(tree, dirPath)).toBe(true);
    expect(nodeExists(tree, childFile)).toBe(true);

    const movedDirPath = path.join(tempDir, 'incoming-dir-moved');
    const movedChildFile = path.join(movedDirPath, 'inner-file.txt');
    await fs.rename(dirPath, movedDirPath);
    await wait(500);

    expect(nodeExists(tree, dirPath)).toBe(false);
    expect(nodeExists(tree, movedDirPath)).toBe(true);
    expect(nodeExists(tree, movedChildFile)).toBe(true);

    await fs.rm(movedDirPath, { recursive: true, force: true });
    await wait(500);

    expect(nodeExists(tree, movedDirPath)).toBe(false);
    expect(nodeExists(tree, movedChildFile)).toBe(false);
  }, 120000);
});
