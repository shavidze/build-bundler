const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");
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
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });
  return {
    id,
    filename,
    dependencies,
    code,
  };
}

function buildDepsTree(entry) {
  const mainAsset = createAsset(entry);
  const queue = [mainAsset];
  for (const asset of queue) {
    const dirname = path.dirname(asset.filename);
    // save dependencies to its path
    asset.mapping = {};
    asset.dependencies.forEach((relativePath) => {
      const absolutePath = path.join(dirname, relativePath);
      const childAsset = createAsset(absolutePath);
      asset.mapping[relativePath] = childAsset.id;
      //console.log({ childAsset });
      queue.push(childAsset);
    });
  }
  return queue;
}
function bundle(tree) {
  let modules = "";
  tree.forEach((node) => {
    modules += `${node.ID}: [
      function(require,module,exports) {
        ${node.code}
      }
    ]`;
  });
  const result = `
    (function() {

    })({${modules}})
  `;
  return result;
}
const tree = buildDepsTree("./src/entry.js");
console.log(bundle(tree));
