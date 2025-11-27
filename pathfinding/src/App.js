// app.js
function PathfindingVisualizer() {
  return (
    <div>
      <h2>Pathfinding Visualizer</h2>
      <p>This is the React-powered section.</p>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <PathfindingVisualizer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
