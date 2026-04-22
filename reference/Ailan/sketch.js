// Declare variables to hold images
let img1, img2, img3, img4;
let currentImg; // Hold the current image

let inputBox; // Input box for user text input
let fallingLetters = []; // Array to store falling letter objects

//as image ratio is 5:3
let cols = 40; // Number of columns in the grid
let rows = 24; // Number of rows in the grid 
let grid = []; // Array to hold the grid 
let revealed = []; // Store the revealed grid cells
let outline = []; // Array to store the outline points of revealed areas

let gridWidth, gridHeight; // Dimensions of each grid cell
let lastShuffleTime = 0; // Tracks the last time the grid was shuffled
let shuffleInterval = 50; // Set the time interval between grid shuffles
let areaDiameter = 200; // Diameter of the reveal area

// Preload images before setup
function preload() {
  img1 = loadImage("memory1.jpg");
  img2 = loadImage("memory2.jpg");
  img3 = loadImage("memory3.jpg");
  img4 = loadImage("memory4.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  currentImg = img1; // Start with img1 as the default image

  
  // Calculate grid cell dimensions
  gridWidth = ceil(windowWidth / cols);
  gridHeight = ceil(windowHeight / rows);

  // Initialize grid and revealed state
  updateGrid();
  initializeRevealed();

  shuffleGrid(); // Shuffle grid at the start

  textSize(50); // Set text size for falling letters

  // Create input box for user input
  inputBox = createInput('');
  inputBox.position((windowWidth / 2) - (inputBox.width / 2), windowHeight - 100);//Put the input box in the lower center
  inputBox.size(200, 20);
  inputBox.input(Typing); // Set the cue for typing
}

function draw() {
  background(255);

  outline = []; // Reset outline for each frame

  // Shuffle the grid at intervals
  if (millis() - lastShuffleTime > shuffleInterval) {
    shuffleGrid();
    lastShuffleTime = millis(); // Update last shuffle time
  }

  // Display the grid and check for outline points
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * gridWidth;
      let y = j * gridHeight;

      if (revealed[i][j]) {
        // Display revealed cells with blur effect
        image(currentImg.get(x, y, gridWidth, gridHeight), x, y, gridWidth, gridHeight);

        // Check if the cell is on the boundary
        let isBoundary = false;
        if (
          i === 0 || i === cols - 1 || j === 0 || j === rows - 1 || // Edge of the grid
          !revealed[i - 1][j] || !revealed[i + 1][j] || !revealed[i][j - 1] || !revealed[i][j + 1] // Neighboring non-revealed cells
        ) {
          isBoundary = true;
        }

        // Store boundary cell position for outline
        if (isBoundary) {
          outline.push({ x, y });
        }
      } else {
        // Display shuffled grid pieces for non-revealed cells
        image(grid[i][j], x, y, gridWidth, gridHeight);
      }
    }
  }

  // Draw red outline around revealed areas
  stroke(255, 0, 0);
  strokeWeight(4);
  noFill();
  for (let i = 0; i < outline.length; i++) {
    let x = outline[i].x;
    let y = outline[i].y;//Breakdown the outline array into x and y
    rect(x, y, gridWidth, gridHeight);//Drawing red rectangle at the grid position
  }

  // Display falling letters
  for (let i = fallingLetters.length - 1; i >= 0; i--) {
    let letter = fallingLetters[i];
    letter.y += letter.speed;//Move the letters down on the y-axis
    fill(255, 0, 0);
    stroke(255, 0, 0);
    strokeWeight(0.5);
    text(letter.char, letter.x, letter.y);//display the characters

    // Remove letters that fall off screen
    if (letter.y > height) {
      fallingLetters.splice(i, 1);
    }
  }
}

// Function for text input
function Typing() {
  let msg = inputBox.value();

  // Add each character as a falling letter object
  for (let i = 0; i < msg.length; i++) {
    let letter = {
      char: msg[i],
      x: random(windowWidth),
      y: -50,
      speed: random(5, 10)
    };
    fallingLetters.push(letter);
  }

  inputBox.value(''); // Clear input box
}

// Reveal grid cells on mouse drag
function mouseDragged() {
  let clickCol = ceil(mouseX / gridWidth);//Column position of the mouse
  let clickRow = ceil(mouseY / gridHeight);//Row position of the mouse

  // Mark cells within the area diameter as revealed
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * gridWidth + gridWidth / 2;
      let y = j * gridHeight + gridHeight / 2;

      let d = dist(mouseX, mouseY, x, y);//Calculate the distance between the mouse and the grid center
      if (d < areaDiameter / 2) {
        //If the distance is smaller than the revealed area radius then reveal
        revealed[i][j] = true;
      }
    }
  }
}

// swith to reveal state on mouse press
function mousePressed() {
  let clickCol = ceil(mouseX / gridWidth);
  let clickRow = ceil(mouseY / gridHeight);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * gridWidth + gridWidth / 2;
      let y = j * gridHeight + gridHeight / 2;

      let d = dist(mouseX, mouseY, x, y);
      if (d < areaDiameter / 2) {
        //If the distance is smaller than the revealed area radius then hide
        revealed[i][j] = false;  
      }
    }
  }
}

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gridWidth = ceil(windowWidth / cols);//Update the grid width and height
  gridHeight = ceil(windowHeight / rows);

  inputBox.position((windowWidth / 2) - (inputBox.width / 2), windowHeight - 100);//Update the inputBox position

  updateGrid(); // Recreate the grid for new dimensions
  initializeRevealed();//Reset the reveal state when resize the window
}

// Handle keyboard input
function keyPressed() {
  if (key == '/') {
    fullscreen(!fullscreen()); //Switch to fullscreen
  }

  // Switch images with number keys
  if (key == '1') {
    currentImg = img1;//Change to photo 1
    updateGrid();
    initializeRevealed();
  }
  if (key == '2') {
    currentImg = img2;//Change to photo 2
    updateGrid();
    initializeRevealed();
  }
  if (key == '3') {
    currentImg = img3;//Change to photo 3
    updateGrid();
    initializeRevealed();
  }
  if (key == '4') {
    currentImg = img4;//Change to photo 4
    updateGrid();
    initializeRevealed();
  }
}

// Update grid based on current image
function updateGrid() {
  grid = [];
  currentImg.resize(windowWidth, windowHeight);//Resize the current image to the window dimensions

  for (let i = 0; i < cols; i++) {
    grid[i] = [];//Initialize the i element of the 2D grid array as an empty array.
    for (let j = 0; j < rows; j++) {
      let x = i * gridWidth;
      let y = j * gridHeight;
      grid[i][j] = currentImg.get(x, y, gridWidth, gridHeight);//Assign the values for i and j in the 2D array
    }
  }
}

// Initialize revealed array
function initializeRevealed() {
  revealed = [];
  for (let i = 0; i < cols; i++) {
    revealed[i] = [];
    for (let j = 0; j < rows; j++) {
      revealed[i][j] = false; // Initially, all cells are hidden
    }
  }
}

// Shuffle non-revealed grid cells
function shuffleGrid() {
  // Flatten the non-revealed cells into a single array
  let flatGrid = []; // Create an empty array to hold non-revealed grid elements
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!revealed[i][j]) { // Check if the grid cell is not revealed
        flatGrid.push(grid[i][j]); // Add the non-revealed cell to the flatGrid array
      }
    }
  }

  //Shuffle the flattened array
  shuffle(flatGrid,true); 

  //Reassign shuffled values back to their positions in the grid
  let index = 0; // Create an index to track the position in the shuffled array
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!revealed[i][j]) { // Only update non-revealed cells
        grid[i][j] = flatGrid[index]; // Put the shuffled value back to the grid
        index++; // Move to the next shuffled value
      }
    }
  }
}

