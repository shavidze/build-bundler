const fs = require("fs");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

let ID = 0;

function createAsset(filename) {
  console.log(filename);
  const content = fs.readFileSync(filename, "utf-8");
  const ast = babelParser.parse(content, {
    sourceType: "module",
  });
  const dependencies = [];
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      console.log("Node - ", JSON.stringify(node, null, 3));
      dependencies.push(node.source.value);
    },
  });
  //console.log(dependencies);
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
  console.log({ queue });
}

const tree = buildDepsTree("./src/entry.js");
console.log(tree);
