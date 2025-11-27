export function astar(grid, startNode, endNode) {
    const openSet = [startNode];
    startNode.distance = 0;
    startNode.heuristic = manhattanDistance(startNode, endNode);
  
    while (openSet.length > 0) {
      openSet.sort((a, b) => (a.distance + a.heuristic) - (b.distance + b.heuristic));
      const currentNode = openSet.shift();
      currentNode.isVisited = true;
  
      if (currentNode === endNode) return getAllVisitedNodes(grid);
  
      const neighbors = getNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isWall && !neighbor.isVisited) {
          const tentativeG = currentNode.distance + 1;
          if (tentativeG < neighbor.distance) {
            neighbor.distance = tentativeG;
            neighbor.heuristic = manhattanDistance(neighbor, endNode);
            neighbor.previousNode = currentNode;
            openSet.push(neighbor);
          }
        }
      }
    }
    return getAllVisitedNodes(grid);
  }
  
  function getNeighbors(node, grid) {
    const neighbors = [];
    const {row, col} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  }
  
  function manhattanDistance(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
  }
  
  function getAllVisitedNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        if (node.isVisited) nodes.push(node);
      }
    }
    return nodes;
  }
  