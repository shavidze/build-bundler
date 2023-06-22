const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

let ID = 0;

function createAsset(filename) {
  const content = fs.readFileSync(filename, "utf-8");
  const ast = babelParser.parse(content, {
    sourceType: "module",
  });
  const dependencies = [];
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });
  const id = ID++;
  return {
    id,
    filename,
    dependencies,
  };
}

function buildDepsTree(entry) {
  const mainAsset = createAsset(entry);
  const queue = [mainAsset];
  queue.forEach((asset) => {
    const dirname = path.dirname(asset.filename);
    // save dependencies to its path
    asset.mapping = {};
    asset.dependencies.forEach((relativePath) => {
      const absolutePath = path.join(dirname, relativePath);
      const childAsset = createAsset(absolutePath);
      asset.mapping[relativePath] = childAsset.id;
      queue.push(childAsset);
    });
  });
  return queue;
}

const tree = buildDepsTree("./src/entry.js");
console.log(JSON.stringify(tree, null, 3));
