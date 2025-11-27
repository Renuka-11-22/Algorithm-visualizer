export function bfs(grid, startNode, endNode) {
    const queue = [];
    const visitedNodesInOrder = [];
    startNode.isVisited = true;
    queue.push(startNode);
  
    while (queue.length) {
      const current = queue.shift();
      visitedNodesInOrder.push(current);
      if (current === endNode) return visitedNodesInOrder;
  
      const neighbors = getUnvisitedNeighbors(current, grid);
      for (const neighbor of neighbors) {
        neighbor.isVisited = true;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  
    return visitedNodesInOrder;
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