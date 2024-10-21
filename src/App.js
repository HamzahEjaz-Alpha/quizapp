import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null); 
  const [gridSize, setGridSize] = useState(3); 
  const [grid, setGrid] = useState([]); 
  const [isSolved, setIsSolved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [isStarted, setIsStarted] = useState(false); 
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }); 

  const generateShuffledGrid = useCallback((size) => {
    const numbers = Array.from({ length: size * size }, (_, i) => i);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  }, []);

  const getTileBackground = (index) => {
    if (!uploadedImage || !imageDimensions.width || !imageDimensions.height) return {};
    const tileWidth = imageDimensions.width / gridSize;
    const tileHeight = imageDimensions.height / gridSize;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      backgroundImage: `url(${uploadedImage})`,
      backgroundPosition: `-${col * tileWidth}px -${row * tileHeight}px`,
      width: `${tileWidth}px`,
      height: `${tileHeight}px`,
      backgroundSize: `${imageDimensions.width}px ${imageDimensions.height}px`,
    };
  };

   const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        const img = new Image();
        img.src = reader.result;
        img.onload = () => setImageDimensions({ width: img.width, height: img.height });

        // Save image to localStorage
        localStorage.setItem('uploadedImage', reader.result);
        sessionStorage.setItem('imageUploaded', 'yes');
      };
      reader.readAsDataURL(file);
    }
  };

 
  const handleGenerateGrid = () => {
    const shuffledGrid = generateShuffledGrid(gridSize);
    setGrid(shuffledGrid);
    setIsSolved(false);
    setElapsedTime(0);
    setIsStarted(false);

   
    localStorage.setItem('puzzleState', JSON.stringify({
      gridSize,
      grid: shuffledGrid,
      elapsedTime: 0,
      isSolved: false,
      isStarted: false,
    }));
  };

  const handleStartPuzzle = () => {
    if (grid.length) {
      setIsStarted(true);

      // Update puzzle state in localStorage
      localStorage.setItem('puzzleState', JSON.stringify({
        gridSize,
        grid,
        elapsedTime,
        isSolved,
        isStarted: true,
      }));
    }
  };

  const handleTileDrop = (e, dropIndex) => {
    if (!isStarted) return;
    const dragIndex = e.dataTransfer.getData('tileIndex');
    swapTiles(parseInt(dragIndex, 10), dropIndex);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('tileIndex', index);
  };

  
  const swapTiles = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const updatedGrid = [...grid];
    [updatedGrid[fromIndex], updatedGrid[toIndex]] = [updatedGrid[toIndex], updatedGrid[fromIndex]];
    setGrid(updatedGrid);
    const solved = updatedGrid.every((num, idx) => num === idx);
    setIsSolved(solved);
    if (solved) setIsStarted(false);

    // Update puzzle state in localStorage
    localStorage.setItem('puzzleState', JSON.stringify({
      gridSize,
      grid: updatedGrid,
      elapsedTime,
      isSolved: solved,
      isStarted: isStarted && !solved,
    }));
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isStarted) setElapsedTime((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isStarted]);

  useEffect(() => {
    const savedImage = localStorage.getItem('uploadedImage');
    const savedState = JSON.parse(localStorage.getItem('puzzleState'));

    if (savedImage) {
      setUploadedImage(savedImage);
      const img = new Image();
      img.src = savedImage;
      img.onload = () => setImageDimensions({ width: img.width, height: img.height });
    }

    if (savedState && savedState.grid.length > 0) {
      setGridSize(savedState.gridSize);
      setGrid(savedState.grid);
      setElapsedTime(savedState.elapsedTime);
      setIsSolved(savedState.isSolved);
      setIsStarted(savedState.isStarted);

      if (savedState.isStarted) {
        setElapsedTime(savedState.elapsedTime); 
      }
    }
    console.log("session storage is",sessionStorage.getItem('imageUploaded')===null)

    if(sessionStorage.getItem('imageUploaded')===null){
      localStorage.removeItem('uploadedImage'); 
      setGrid([])
      setElapsedTime(0)
      setIsSolved(false)

    }
   
    
  }, []);

  useEffect(() => {
    // Save puzzle state in localStorage whenever it changes
    if (grid.length > 0) {
      localStorage.setItem('puzzleState', JSON.stringify({
        gridSize,
        grid,
        elapsedTime,
        isSolved,
        isStarted,
      }));
    }
  }, [gridSize, grid, elapsedTime, isSolved, isStarted]);

  return (
    <div className="App flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Image Puzzle App</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />

      <div className="mb-8 flex space-x-4">
        <input
          type="number"
          value={gridSize}
          onChange={(e) => setGridSize(Math.max(1, Number(e.target.value)))}
          className="border-2 border-gray-300 rounded p-2 w-32 text-center"
          placeholder="Grid size"
          min={1}
        />
        <button onClick={handleGenerateGrid} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Generate Grid
        </button>

        {isStarted ? (
          <div className="text-xl">Time Elapsed: {Math.floor(elapsedTime / 1000)} seconds</div>
        ) : (
          <button onClick={handleStartPuzzle} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Start Puzzle
          </button>
        )}
      </div>

      {grid.length > 0 && (
        <div className="grid mb-8 border-2 border-double rounded-md border-gray-300 p-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {grid.map((value, index) => (
            <div
              key={index}
              className="tile flex items-center justify-center border border-gray-400 cursor-pointer"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleTileDrop(e, index)}
              onDragOver={(e) => e.preventDefault()}
              style={getTileBackground(value)}
            >
              {value === 0 ? '' : value + 1}
            </div>
          ))}
        </div>
      )}

      {isSolved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="mb-4">You've completed the puzzle in {Math.floor(elapsedTime / 1000)} seconds.</p>
            <button
              onClick={() => {
                setIsSolved(false);
                handleGenerateGrid();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
