// ====== app.js (full) ======
// Grid configuration
const NUM_ROWS = 25;
const NUM_COLS = 40;

let grid = [];
let startNode = { row: 5, col: 5 };
let endNode = { row: 20, col: 30 };

let algorithm = "dijkstra";
let speed = "medium";

let mouseIsPressed = false;
let movingStart = false;
let movingEnd = false;

// --- Helpers ---
const keyOf = (node) => `${node.row}-${node.col}`;
const nodeFromKey = (k) => {
  const [r, c] = k.split("-").map(Number);
  return grid[r][c];
};

function resetGridState() {
  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false;
      node.distance = Infinity;
      node.previousNode = null;
      node.g = Infinity;
      node.h = 0;
      node.f = Infinity;
    }
  }
}

// --- Create grid & DOM ---
function createGrid() {
  const gridElement = document.getElementById("grid");
  gridElement.innerHTML = "";
  grid = [];

  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    const rowElement = document.createElement("div");
    rowElement.className = "grid-row";

    for (let col = 0; col < NUM_COLS; col++) {
      const node = {
        row,
        col,
        isWall: false,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
        g: Infinity,
        h: 0,
        f: Infinity
      };
      currentRow.push(node);

      const nodeElement = document.createElement("div");
      nodeElement.id = `node-${row}-${col}`;
      nodeElement.className = "node";

      if (row === startNode.row && col === startNode.col) nodeElement.classList.add("node-start");
      else if (row === endNode.row && col === endNode.col) nodeElement.classList.add("node-end");
      else nodeElement.classList.remove("node-start", "node-end");

      // Mouse handlers
      nodeElement.addEventListener("mousedown", (e) => handleMouseDown(e, row, col));
      nodeElement.addEventListener("mouseenter", (e) => handleMouseEnter(e, row, col));
      nodeElement.addEventListener("mouseup", handleMouseUp);

      rowElement.appendChild(nodeElement);
    }

    grid.push(currentRow);
    gridElement.appendChild(rowElement);
  }
}

createGrid();

// --- Mouse handlers for walls / dragging start & end ---
function handleMouseDown(e, row, col) {
  e.preventDefault();
  if (row === startNode.row && col === startNode.col) { movingStart = true; return; }
  if (row === endNode.row && col === endNode.col) { movingEnd = true; return; }
  toggleWall(row, col);
  mouseIsPressed = true;
}

function handleMouseEnter(e, row, col) {
  e.preventDefault();
  if (movingStart) { startNode = { row, col }; createGrid(); return; }
  if (movingEnd) { endNode = { row, col }; createGrid(); return; }
  if (mouseIsPressed) toggleWall(row, col);
}

function handleMouseUp() {
  mouseIsPressed = false;
  movingStart = false;
  movingEnd = false;
}

function toggleWall(row, col) {
  // prevent toggling start/end into wall
  if ((row === startNode.row && col === startNode.col) || (row === endNode.row && col === endNode.col)) return;
  const n = grid[row][col];
  n.isWall = !n.isWall;
  const el = document.getElementById(`node-${row}-${col}`);
  if (n.isWall) el.classList.add("node-wall");
  else el.classList.remove("node-wall");
}

// --- Speed & dropdown bindings ---
function getSpeedDelay() {
  if (speed === "fast") return 10;
  if (speed === "medium") return 30;
  if (speed === "slow") return 70;
  return 30;
}
document.getElementById("algorithmDropdown").addEventListener("change", e => algorithm = e.target.value);
document.getElementById("speedDropdown").addEventListener("change", e => speed = e.target.value);

// --- Visualization driver ---
function visualizeAlgorithm() {
  // reset visual & algorithm state
  createGrid();
  resetGridState();

  const start = grid[startNode.row][startNode.col];
  const end = grid[endNode.row][endNode.col];

  let visitedNodesInOrder = [];

  switch (algorithm) {
    case "dijkstra": visitedNodesInOrder = dijkstra(grid, start, end); break;
    case "dijkstraWeighted": visitedNodesInOrder = dijkstraWeighted(grid, start, end); break;
    case "astar": visitedNodesInOrder = astar(grid, start, end); break;
    case "bfs": visitedNodesInOrder = bfs(grid, start, end); break;
    case "dfs": visitedNodesInOrder = dfs(grid, start, end); break;
    case "recursiveDFS": visitedNodesInOrder = recursiveDFS(start, end, grid); break;
    case "greedy": visitedNodesInOrder = greedyBestFirst(grid, start, end); break;
    case "bidirectional": visitedNodesInOrder = bidirectionalSearch(grid, start, end); break;
    case "jump": visitedNodesInOrder = jumpPointSearch(grid, start, end); break;
    default: visitedNodesInOrder = dijkstra(grid, start, end); break;
  }

  const nodesInShortestPathOrder = getNodesInShortestPathOrder(end);
  animate(visitedNodesInOrder, nodesInShortestPathOrder);
}

// --- Animation ---
function animate(visitedNodesInOrder, nodesInShortestPathOrder) {
  const speedDelay = getSpeedDelay();
  for (let i = 0; i <= visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length) {
      setTimeout(() => animateShortestPath(nodesInShortestPathOrder), speedDelay * i);
      return;
    }
    setTimeout(() => {
      const node = visitedNodesInOrder[i];
      if (!node) return;
      if (!(node.row === startNode.row && node.col === startNode.col) &&
          !(node.row === endNode.row && node.col === endNode.col)) {
        node.isVisited = true;
        document.getElementById(`node-${node.row}-${node.col}`).classList.add("node-visited");
      }
    }, speedDelay * i);
  }
}

function animateShortestPath(nodesInShortestPathOrder) {
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    setTimeout(() => {
      const node = nodesInShortestPathOrder[i];
      if (!(node.row === startNode.row && node.col === startNode.col) &&
          !(node.row === endNode.row && node.col === endNode.col)) {
        document.getElementById(`node-${node.row}-${node.col}`).classList.add("node-path");
      }
    }, 50 * i);
  }
}

// --- Clear grid ---
function clearGrid() {
  // reset model and DOM
  createGrid();
  resetGridState();
}

// ---------------- ALGORITHMS & UTILITIES ---------------- //

// Cardinal neighbors helper (no diagonal)
function getNeighbors4(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0 && !grid[row-1][col].isWall) neighbors.push(grid[row-1][col]);
  if (row < NUM_ROWS - 1 && !grid[row+1][col].isWall) neighbors.push(grid[row+1][col]);
  if (col > 0 && !grid[row][col-1].isWall) neighbors.push(grid[row][col-1]);
  if (col < NUM_COLS - 1 && !grid[row][col+1].isWall) neighbors.push(grid[row][col+1]);
  return neighbors;
}

// Unvisited neighbors (used by BFS/DFS/Dijkstra)
function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < NUM_ROWS - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < NUM_COLS - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(n => !n.isVisited && !n.isWall);
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// ---------- Existing algorithms (BFS, DFS, A*, Dijkstra, Weighted) ----------

function dijkstra(grid, startNode, endNode) {
  const visitedNodes = [];
  const unvisited = grid.flat();
  unvisited.forEach(n => { n.distance = Infinity; n.isVisited = false; });
  startNode.distance = 0;

  while (unvisited.length) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift();
    if (closest.isWall) continue;
    if (closest.distance === Infinity) return visitedNodes;
    closest.isVisited = true;
    visitedNodes.push(closest);
    if (closest === endNode) return visitedNodes;

    const neighbors = getUnvisitedNeighbors(closest, grid);
    for (const nb of neighbors) {
      const alt = closest.distance + 1;
      if (alt < nb.distance) {
        nb.distance = alt;
        nb.previousNode = closest;
      }
    }
  }
  return visitedNodes;
}

function dijkstraWeighted(grid, startNode, endNode) {
  const visited = [];
  const unvisited = grid.flat();
  unvisited.forEach(n => { n.distance = Infinity; n.isVisited = false; });
  startNode.distance = 0;

  while (unvisited.length) {
    unvisited.sort((a,b)=>a.distance-b.distance);
    const cur = unvisited.shift();
    if (cur.isWall) continue;
    if (cur.distance === Infinity) return visited;
    cur.isVisited = true;
    visited.push(cur);
    if (cur === endNode) return visited;

    const neighbors = getUnvisitedNeighbors(cur, grid);
    for (const nb of neighbors) {
      // You can customize weights per node; here use weight = 1 for free, or a higher value if desired
      const weight = nb.weight || 1;
      const alt = cur.distance + weight;
      if (alt < nb.distance) {
        nb.distance = alt;
        nb.previousNode = cur;
      }
    }
  }
  return visited;
}

function bfs(grid, startNode, endNode) {
  const visited = [];
  const queue = [startNode];
  startNode.isVisited = true;

  while (queue.length) {
    const node = queue.shift();
    visited.push(node);
    if (node === endNode) return visited;

    const neighbors = getUnvisitedNeighbors(node, grid);
    for (const nb of neighbors) {
      nb.isVisited = true;
      nb.previousNode = node;
      queue.push(nb);
    }
  }
  return visited;
}

function dfs(grid, startNode, endNode) {
  const visited = [];
  const stack = [startNode];
  startNode.isVisited = true;

  while (stack.length) {
    const node = stack.pop();
    visited.push(node);
    if (node === endNode) return visited;

    const neighbors = getUnvisitedNeighbors(node, grid);
    for (const nb of neighbors) {
      nb.isVisited = true;
      nb.previousNode = node;
      stack.push(nb);
    }
  }
  return visited;
}

function recursiveDFS(start, end, grid) {
  const visited = [];
  function helper(node) {
    if (!node || node.isWall || node.isVisited) return false;
    node.isVisited = true;
    visited.push(node);
    if (node === end) return true;
    const neighbors = getUnvisitedNeighbors(node, grid);
    for (const nb of neighbors) {
      nb.previousNode = node;
      if (helper(nb)) return true;
    }
    return false;
  }
  helper(start);
  return visited;
}

function astar(grid, start, end) {
  const open = [start];
  const visited = [];
  start.g = 0;
  start.h = heuristic(start, end);
  start.f = start.g + start.h;

  while (open.length) {
    open.sort((a,b)=>a.f - b.f);
    const cur = open.shift();
    visited.push(cur);
    cur.isVisited = true;
    if (cur === end) return visited;

    const neighbors = getUnvisitedNeighbors(cur, grid);
    for (const nb of neighbors) {
      const tentativeG = cur.g + 1;
      if (tentativeG < (nb.g || Infinity)) {
        nb.g = tentativeG;
        nb.h = heuristic(nb, end);
        nb.f = nb.g + nb.h;
        nb.previousNode = cur;
        if (!open.includes(nb)) open.push(nb);
      }
    }
  }
  return visited;
}

function greedyBestFirst(grid, start, end) {
  const open = [start];
  const visited = [];
  start.h = heuristic(start, end);

  while (open.length) {
    open.sort((a,b)=> (a.h || Infinity) - (b.h || Infinity));
    const cur = open.shift();
    visited.push(cur);
    cur.isVisited = true;
    if (cur === end) return visited;

    const neighbors = getUnvisitedNeighbors(cur, grid);
    for (const nb of neighbors) {
      if (!nb.isVisited) {
        nb.h = heuristic(nb, end);
        nb.previousNode = cur;
        open.push(nb);
      }
    }
  }
  return visited;
}

// ---------- Bidirectional Search (fixed) ----------
function bidirectionalSearch(gridArg, start, end) {
  const visitedNodes = [];
  const qStart = [start];
  const qEnd = [end];

  const startKey = keyOf(start);
  const endKey = keyOf(end);

  const visitedStart = new Set([startKey]);
  const visitedEnd = new Set([endKey]);

  // prev maps store previous-key string: key => prevKey
  const prevFromStart = new Map([[startKey, null]]);
  const prevFromEnd = new Map([[endKey, null]]);

  while (qStart.length && qEnd.length) {
    // Expand from start side
    const curS = qStart.shift();
    if (!curS) break;
    visitedNodes.push(curS);
    curS.isVisited = true;

    for (const nb of getNeighbors4(curS, grid)) {
      const k = keyOf(nb);
      if (!visitedStart.has(k)) {
        visitedStart.add(k);
        prevFromStart.set(k, keyOf(curS));
        nb.previousNode = curS;
        qStart.push(nb);

        // meeting check
        if (visitedEnd.has(k)) {
          // build full path and return visited nodes (path will be set)
          buildBidirectionalPath(prevFromStart, prevFromEnd, k);
          return visitedNodes;
        }
      }
    }

    // Expand from end side
    const curE = qEnd.shift();
    if (!curE) break;
    visitedNodes.push(curE);
    curE.isVisited = true;

    for (const nb of getNeighbors4(curE, grid)) {
      const k = keyOf(nb);
      if (!visitedEnd.has(k)) {
        visitedEnd.add(k);
        prevFromEnd.set(k, keyOf(curE));
        nb.previousNode = curE;
        qEnd.push(nb);

        if (visitedStart.has(k)) {
          buildBidirectionalPath(prevFromStart, prevFromEnd, k);
          return visitedNodes;
        }
      }
    }
  }

  return visitedNodes;
}

function buildBidirectionalPath(prevStart, prevEnd, meetKey) {
  // path from start -> meet
  const pathStart = [];
  let k = meetKey;
  while (k != null) {
    pathStart.unshift(nodeFromKey(k));
    k = prevStart.get(k);
  }

  // path from meet -> end (skip meet duplicate)
  const pathEnd = [];
  k = prevEnd.get(meetKey);
  while (k != null) {
    pathEnd.push(nodeFromKey(k));
    k = prevEnd.get(k);
  }

  const fullPath = pathStart.concat(pathEnd); // from start to end

  // set previousNode pointers so shortest-path reconstruction works
  for (let i = 1; i < fullPath.length; i++) {
    fullPath[i].previousNode = fullPath[i - 1];
  }
  // final end node has previous set; getNodesInShortestPathOrder(end) will work
}

// ---------- Jump Point Search (4-way practical implementation) ----------
const CARDINAL_DIRS = [
  [-1, 0], // up (dy,dx)
  [1, 0],  // down
  [0, -1], // left
  [0, 1]   // right
];

function jumpPointSearch(gridArg, start, end) {
  // A practical 4-direction JPS variant:
  const open = [start];
  const visitedNodes = [];

  const gScore = new Map();
  const fScore = new Map();

  const startK = keyOf(start);
  gScore.set(startK, 0);
  fScore.set(startK, heuristic(start, end));

  while (open.length) {
    open.sort((a,b) => (fScore.get(keyOf(a)) || Infinity) - (fScore.get(keyOf(b)) || Infinity));
    const current = open.shift();
    visitedNodes.push(current);
    current.isVisited = true;

    if (current === end) return visitedNodes;

    for (const [dy, dx] of CARDINAL_DIRS) {
      const nr = current.row + dy;
      const nc = current.col + dx;
      if (!isWalkable(grid, nr, nc)) continue;
      const jumpNode = jumpSearch(nr, nc, dy, dx, grid, end, visitedNodes);
      if (jumpNode) {
        const jk = keyOf(jumpNode);
        const tentativeG = (gScore.get(keyOf(current)) || Infinity) + heuristic(current, jumpNode);
        if (tentativeG < (gScore.get(jk) || Infinity)) {
          gScore.set(jk, tentativeG);
          fScore.set(jk, tentativeG + heuristic(jumpNode, end));
          jumpNode.previousNode = current;
          if (!open.includes(jumpNode)) open.push(jumpNode);
        }
      }
    }
  }

  return visitedNodes;
}

// Recursive jump until forced neighbor, obstacle or goal (4-way variant)
function jumpSearch(r, c, dy, dx, gridArg, end, visitedNodes) {
  if (!isWalkable(gridArg, r, c)) return null;
  const node = gridArg[r][c];

  // include intermediate nodes in visited list so they show during visualization
  if (!node.isVisited) {
    visitedNodes.push(node);
    node.isVisited = true;
  }

  if (node === end) return node;

  // forced neighbor checks for cardinal moves
  // horizontal move (dx != 0): check up/down forced neighbors
  if (dx !== 0) {
    // up check
    if (isWalkable(gridArg, r - 1, c) && !isWalkable(gridArg, r - 1, c - dx)) return node;
    // down check
    if (isWalkable(gridArg, r + 1, c) && !isWalkable(gridArg, r + 1, c - dx)) return node;
  }

  // vertical move (dy != 0): check left/right forced neighbors
  if (dy !== 0) {
    if (isWalkable(gridArg, r, c - 1) && !isWalkable(gridArg, r - dy, c - 1)) return node;
    if (isWalkable(gridArg, r, c + 1) && !isWalkable(gridArg, r - dy, c + 1)) return node;
  }

  // step further
  const nr = r + dy;
  const nc = c + dx;
  if (!isWalkable(gridArg, nr, nc)) return null;
  return jumpSearch(nr, nc, dy, dx, gridArg, end, visitedNodes);
}

function isWalkable(gridArg, r, c) {
  return r >= 0 && r < gridArg.length && c >= 0 && c < gridArg[0].length && !gridArg[r][c].isWall;
}

// ---------- Path reconstruction ----------
function getNodesInShortestPathOrder(endNode) {
  const path = [];
  let node = endNode;
  while (node) {
    path.unshift(node);
    node = node.previousNode;
  }
  return path;
}
