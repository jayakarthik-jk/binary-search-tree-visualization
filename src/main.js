const container = document.getElementById("container");
const lineContainer = document.getElementById("lineContainer");
const nodeWidth = 50;
let contanerWidth = getOffset(container).width + getOffset(container).left * 2;
const gap = nodeWidth / 2;
const lineColor = "white";
let containerLeft = 0;

function getOffset(el) {
  let rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.pageXOffset,
    top: rect.top + window.pageYOffset,
    width: rect.width || el.offsetWidth,
    height: rect.height || el.offsetHeight,
  };
}

function dist(div1, div2) {
  let off1 = getOffset(div1);
  let off2 = getOffset(div2);
  let x1 = off1.left + off1.width / 2;
  let y1 = off1.top + off1.height / 2;
  let x2 = off2.left + off2.width / 2;
  let y2 = off2.top + off2.height / 2;
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function drawLineBetween(div1, div2, color = lineColor, thickness = 2) {
  let off1 = getOffset(div1);
  let off2 = getOffset(div2);
  let x1 = off1.left + off1.width / 2;
  let y1 = off1.top + off1.height / 2;
  let x2 = off2.left + off2.width / 2;
  let y2 = off2.top + off2.height / 2;
  let length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  let cx = (x1 + x2) / 2 - length / 2;
  let cy = (y1 + y2) / 2 - thickness / 2;
  let angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
  const line = document.createElement("div");
  line.style.padding = "0px";
  line.style.margin = "0px";
  line.style.height = thickness + "px";
  line.style.backgroundColor = color;
  line.style.lineHeight = "1px";
  line.style.position = "absolute";
  line.style.left = cx + "px";
  line.style.top = cy + "px";
  line.style.width = length + "px";
  line.style.transform = "rotate(" + angle + "deg)";
  line.classList.add("line");
  lineContainer.appendChild(line);
  div2.line = line;
}

function createNode(value) {
  const div = document.createElement("div");
  div.classList.add("node");
  div.innerText = value;
  div.value = value;
  div.left = null;
  div.right = null;
  return div;
}

class BST {
  constructor() {
    this.root = null;
  }
  levels = [];

  render() {
    if (!this.root) return;
    container.innerHTML = "";
    lineContainer.innerHTML = "";
    container.style.left = containerLeft + "px";
    const containerOffset = getOffset(container);
    contanerWidth = containerOffset.width + containerOffset.left * 2;
    this.levels = [];
    container.appendChild(this.root);
    this.updateDom(this.root, this.root.left);
    this.updateDom(this.root, this.root.right);
    let current = this.root;
    while (current.left) current = current.left;
    const nodeOffset = getOffset(current);
    if (nodeOffset.left < 0) {
      containerLeft += nodeWidth;
      return this.render();
    }
  }
  updateDom(parent, node) {
    if (!parent) return;
    if (!node) return;
    if (!this.levels[node.depth]) {
      this.levels[node.depth] = this.levelOrderTraversal(node.depth);
    }
    const siblingNodes = this.levels[node.depth];
    const totalSiblingNodes = 2 ** node.depth;
    const segment = contanerWidth / totalSiblingNodes;
    const i = siblingNodes.indexOf(node);
    const position = segment * i + segment / 2;
    const parentOffset = getOffset(parent);
    const parentPosition = parentOffset.left + parentOffset.width / 2;

    if (node.side === "left") {
      node.style.left = (parentPosition - position) * -1 + "px";
    } else {
      node.style.right = parentPosition - position + "px";
    }
    parent.appendChild(node);
    const leftNode = siblingNodes[i - 1];
    if (leftNode) {
      const distance = dist(leftNode, node);
      if (distance < nodeWidth + gap) {
        containerLeft += nodeWidth;
        return this.render();
      }
    }
    drawLineBetween(parent, node);
    this.updateDom(node, node.left);
    this.updateDom(node, node.right);
  }
  levelOrderTraversal(depth) {
    const result = [];
    const queue = [];
    if (!this.root) return result;
    queue.push(this.root);
    while (queue.length > 0) {
      const levelSize = queue.length;
      const levelNodes = new Array(levelSize).fill(null);
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        if (node) {
          levelNodes[i] = node;
          queue.push(node.left);
          queue.push(node.right);
        } else {
          levelNodes[i] = null;
          queue.push(null);
          queue.push(null);
        }
      }
      const containsNonNull = levelNodes.some((value) => value !== null);
      if (containsNonNull) {
        result.push(levelNodes);
      } else {
        break;
      }
    }
    return result[depth];
  }
  insert(value) {
    const node = createNode(value);
    node.classList.add("node");

    if (!this.root) {
      this.root = node;
      return;
    }

    let current = this.root;
    let depth = 0;
    while (true) {
      depth++;
      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          current.classList.remove("child");
          node.classList.add("child");
          node.depth = depth;
          node.side = "left";
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          current.classList.remove("child");
          node.classList.add("child");
          node.depth = depth;
          node.side = "right";
          return;
        }
        current = current.right;
      }
    }
  }
}

document.getElementById("action").addEventListener("click", () => {
  const input = document
    .getElementById("input")
    .value.split(" ")
    .map((v) => parseFloat(v));
  for (let i = 0; i < input.length; i++) if (!input[i]) return;
  containerLeft = 0;
  const tree = new BST();
  input.forEach((v) => tree.insert(v));
  tree.render();
});
