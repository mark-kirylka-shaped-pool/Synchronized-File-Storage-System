const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { generateDummyTree } = require('../scripts/generate-dummy-tree');
const { FileTree } = require('../file-tree');

describe('dummy tree performance smoke test', () => {
  let tempDir;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dummy-tree-'));
    await generateDummyTree(tempDir, {
      fileCount: 2000,
      directoryCount: 80,
      depth: 2,
    });
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('builds a large dummy directory tree', async () => {
    const tree = new FileTree(tempDir);
    const started = Date.now();

    await tree.build();

    const elapsedMs = Date.now() - started;
    console.log(`Built dummy tree in ${elapsedMs}ms`);

    expect(tree.root).not.toBeNull();
    expect(tree.nodeMap.size).toBeGreaterThan(2000);
  }, 120000);
});
