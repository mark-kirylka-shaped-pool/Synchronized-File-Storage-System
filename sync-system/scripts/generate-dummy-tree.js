const fs = require('node:fs/promises');
const path = require('node:path');

async function generateDummyTree(rootDir, options = {}) {
  const {
    fileCount = 2000,
    directoryCount = 100,
    depth = 2,
    chunkSize = 100,
  } = options;

  await fs.mkdir(rootDir, { recursive: true });

  const dirs = [];
  for (let i = 0; i < directoryCount; i += 1) {
    const dirName = `dir-${String(i).padStart(3, '0')}`;
    const targetDir = path.join(rootDir, dirName);
    await fs.mkdir(targetDir, { recursive: true });
    dirs.push(targetDir);
  }

  for (let i = 0; i < fileCount; i += 1) {
    const parentDir = dirs[i % dirs.length];
    const filePath = path.join(parentDir, `file-${String(i).padStart(5, '0')}.txt`);
    await fs.writeFile(filePath, `dummy content ${i}\n`, 'utf8');

    if (i > 0 && i % chunkSize === 0) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  }

  if (depth > 1) {
    for (let i = 0; i < Math.min(directoryCount, 20); i += 1) {
      const nestedDir = path.join(rootDir, `dir-${String(i).padStart(3, '0')}`, 'nested');
      await fs.mkdir(nestedDir, { recursive: true });
      const nestedFile = path.join(nestedDir, `nested-${String(i).padStart(5, '0')}.txt`);
      await fs.writeFile(nestedFile, 'nested dummy', 'utf8');
    }
  }

  return rootDir;
}

if (require.main === module) {
  const targetDir = process.argv[2] || path.resolve(process.cwd(), 'dummy-tree');
  generateDummyTree(targetDir)
    .then(() => {
      console.log(`Generated dummy tree at ${targetDir}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { generateDummyTree };
