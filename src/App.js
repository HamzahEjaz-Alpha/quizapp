import React, { useState, useCallback } from 'react';
import './App.css';

function App() {
  const [gridSize, setGridSize] = useState(0);
  const [grid, setGrid] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const generateShuffledGrid = useCallback((size) => {
    const numbers = Array.from({ length: size * size }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  }, []);

  const handleGenerateGrid = () => {
    if (gridSize < 1) {
      setErrorMessage("Number can't be smaller than 1");
      return;
    } else if (gridSize > 0) {
      setErrorMessage("")
      const shuffledGrid = generateShuffledGrid(gridSize);
      setGrid(shuffledGrid);
      setIsSolved(false);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('tileIndex', index);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData('tileIndex');
    swapTiles(parseInt(dragIndex, 10), dropIndex);
  };

  const swapTiles = (fromIndex, toIndex) => {
    const updatedGrid = [...grid];
    [updatedGrid[fromIndex], updatedGrid[toIndex]] = [updatedGrid[toIndex], updatedGrid[fromIndex]];
    setGrid(updatedGrid);

    setIsSolved(updatedGrid.every((num, idx) => num === idx + 1));
  };

  return (
    <div className="App flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Puzzle App</h1>


      <div className="mb-8 flex space-x-4">
        <input
          type="number"
          value={gridSize}
          onChange={(e) => {
            const value = Number(e.target.value);
            setGridSize(value);
            if (value < 1) {
              setErrorMessage("Number can't be smaller than 1");
            } else {
              setErrorMessage('');
            }
          }}
          className="border-2 border-gray-300 rounded p-2 w-32 text-center"
          placeholder="Grid size"
          min={1}
        />
        <button
          onClick={handleGenerateGrid}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Grid
        </button>
      </div>
      {errorMessage && (
        <span className="text-red-500">{errorMessage}</span>
      )}
      {grid?.length > 0 && <div
        className="grid gap-4 mb-8 border-2 border-double rounded-md border-gray-300 p-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 100px)` }}
      >
        {grid.map((value, index) => (
          <div
            key={index}
            className="tile bg-gradient-to-tr from-indigo-100 to-indigo-800 text-2xl font-bold text-center w-24 h-24 hover:animate-pulse flex items-center rounded-md justify-center cursor-pointer"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={(e) => e.preventDefault()}
          >
            {value}
          </div>
        ))}
      </div>
      }

      {isSolved && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to the team!</h2>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setIsSolved(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
