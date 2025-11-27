export function dfs(grid, startNode, endNode) {
    const visitedNodesInOrder = [];
    dfsHelper(startNode, endNode, visitedNodesInOrder, grid);
    return visitedNodesInOrder;
  }
  
  function dfsHelper(node, endNode, visitedNodesInOrder, grid) {
    if (!node || node.isVisited || node.isWall) return false;
    node.isVisited = true;
    visitedNodesInOrder.push(node);
    if (node === endNode) return true;
  
    const neighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of neighbors) {
      neighbor.previousNode = node;
      if (dfsHelper(neighbor, endNode, visitedNodesInOrder, grid)) return true;
    }
    return false;
  }
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { row, col } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(n => !n.isVisited && !n.isWall);
  }
  