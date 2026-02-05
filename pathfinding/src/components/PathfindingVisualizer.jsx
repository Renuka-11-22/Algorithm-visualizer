import React, { useState, useEffect } from 'react';
import Node from './Node';
import Navbar from './Navbar';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { astar } from '../algorithms/astar';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import './PathfindingVisualizer.css';

const NUM_ROWS = 30;
const NUM_COLS = 30;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [movingStart, setMovingStart] = useState(false);
  const [movingEnd, setMovingEnd] = useState(false);
  const [startNode, setStartNode] = useState({ row: 5, col: 5 });
  const [endNode, setEndNode] = useState({ row: 25, col: 25 });
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [speed, setSpeed] = useState('medium');

  useEffect(() => {
    setGrid(getInitialGrid());
  }, [startNode, endNode]);

  const handleMouseDown = (row, col) => {
    if (row === startNode.row && col === startNode.col) {
      setMovingStart(true);
      return;
    }
    if (row === endNode.row && col === endNode.col) {
      setMovingEnd(true);
      return;
    }
    const newGrid = toggleWall(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    if (movingStart) {
      setStartNode({ row, col });
      return;
    }
    if (movingEnd) {
      setEndNode({ row, col });
      return;
    }
    const newGrid = toggleWall(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
    setMovingStart(false);
    setMovingEnd(false);
  };

  const getSpeedDelay = () => {
    switch (speed) {
      case 'fast': return 10;
      case 'medium': return 30;
      case 'slow': return 70;
      default: return 30;
    }
  };

  const visualizeAlgorithm = () => {
    const start = grid[startNode.row][startNode.col];
    const end = grid[endNode.row][endNode.col];

    let visitedNodesInOrder = [];
    switch (algorithm) {
      case 'dijkstra':
        visitedNodesInOrder = dijkstra(grid, start, end);
        break;
      case 'astar':
        visitedNodesInOrder = astar(grid, start, end);
        break;
      case 'bfs':
        visitedNodesInOrder = bfs(grid, start, end);
        break;
      case 'dfs':
        visitedNodesInOrder = dfs(grid, start, end);
        break;
      default:
        visitedNodesInOrder = dijkstra(grid, start, end);
        break;
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(end);
    animate(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const animate = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    const speedDelay = getSpeedDelay();
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, speedDelay * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!(node.row === startNode.row && node.col === startNode.col) &&
            !(node.row === endNode.row && node.col === endNode.col)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, speedDelay * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!(node.row === startNode.row && node.col === startNode.col) &&
            !(node.row === endNode.row && node.col === endNode.col)) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-path';
        }
      }, 50 * i);
    }
  };

  function handleClearGrid() {
    const newGrid = grid.map(row =>
      row.map(node => {
        return {
          ...node,
          isWall: false,
          isVisited: false,
          isPath: false,
          previousNode: null,
        };
      })
    );

    setGrid(newGrid);

    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 30; col++) {
        const node = newGrid[row][col];
        const nodeEl = document.getElementById(`node-${row}-${col}`);
        if (nodeEl) {
          if (row === startNode.row && col === startNode.col) {
            nodeEl.className = 'node node-start';
          } else if (row === endNode.row && col === endNode.col) {
            nodeEl.className = 'node node-end';
          } else {
            nodeEl.className = 'node';
          }
        }
      }
    }
  }

  const handleAlgorithmChange = (algorithm) => {
    setAlgorithm(algorithm);
  };

  const handleSpeedChange = (speed) => {
    setSpeed(speed);
  };

  return (
    <>
      <Navbar
        handleAlgorithmChange={handleAlgorithmChange}
        handleSpeedChange={handleSpeedChange}
        visualizeAlgorithm={visualizeAlgorithm}
        handleClearGrid={handleClearGrid}
      />
      <div className="grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            {row.map((node, nodeIdx) => {
              const { row, col } = node;
              return (
                <Node
                  key={nodeIdx}
                  row={row}
                  col={col}
                  isStart={row === startNode.row && col === startNode.col}
                  isEnd={row === endNode.row && col === endNode.col}
                  isWall={node.isWall}
                  isVisited={node.isVisited}
                  isPath={false}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onMouseUp={handleMouseUp}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < NUM_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < NUM_COLS; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (row, col) => {
  return {
    row,
    col,
    isWall: false,
    distance: Infinity,
    isVisited: false,
    previousNode: null,
  };
};

const toggleWall = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

export default PathfindingVisualizer;
