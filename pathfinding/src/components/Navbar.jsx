// src/components/Navbar.jsx
import React from 'react';
import './Navbar.css';

const Navbar = ({ handleAlgorithmChange, handleSpeedChange, visualizeAlgorithm ,handleClearGrid }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Pathfinding Visualizer</div>
      <div className="navbar-controls">
        <button className="btn" onClick={() => window.location.reload()}>Home</button>

        <select className="dropdown" onChange={(e) => handleAlgorithmChange(e.target.value)}>
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
        </select>

        <select className="dropdown" onChange={(e) => handleSpeedChange(e.target.value)}>
          <option value="fast">Fast</option>
          <option value="medium">Medium</option>
          <option value="slow">Slow</option>
        </select>

        <button className="btn" onClick={visualizeAlgorithm}>Run</button>

        <button className="btn" onClick={handleClearGrid}>Clear Grid</button>
      </div>
    </nav>
  );
};

export default Navbar;