const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

const NUMBER_TILES_WIDTH = 10;
const AMOUNT_BOMBS = 10;

const TILES_COLORS = {
	"-1": "brown",
	 0: "green",
	 9: "black",
	10: "red",
};

class Coords {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}

let gameGrid = [];
let solutionGrid = [];

let firstClick = true;
let gameEnded = false;

function randint(a, b=0) {
	// a => number
	// b => number
	// randint(a, b) => returns a random int in range [min(a, b), max(a, b)[
	const randVal = Math.floor(Math.random() * (Math.max(a, b) - Math.min(a, b)) + Math.min(a, b));
	return randVal;
}

function countOccurences(elmt, arr) {
	// elmt => A value
	// arr => An array of values
	// countOccurence(elmt, arr) => Returns how many times elmt appears in arr
	let occ = 0;
	for (let i = 0; i < arr.length; i++) {
		const elmtI = arr[i];
		if (elmtI == elmt) {
			occ++;
		}
	}
	return occ;
}

function getNeighboursCoords(elmtCoords, arr) {
	// elmtCoords => Coords (class) of a tile in arr
	// arr => a 2d array of elements containing elmt
	// getNeighboursCoords(elmtCoords, arr) => Returns coords of neighbours of elmt in array.
	// 		excluding itself

	if (arr.length == 0) {
		console.error("Cannot get neighbours from empty array.");
		return;
	}

	const NEIGHBORS_COORDS_ADDENDS = [
		new Coords(-1, -1), new Coords(0, -1), new Coords(1, -1),
		new Coords(-1, 0) , new Coords(0, 0) , new Coords(1, 0),
		new Coords(-1, 1) , new Coords(0, 1) , new Coords(1, 1),
	];

	let neighboursCoords = [];
	for (let addend of NEIGHBORS_COORDS_ADDENDS) {
		const neighbourCoords = new Coords(elmtCoords.x + addend.x, elmtCoords.y + addend.y);

		const neighbourIsCurrentElmt = neighbourCoords.x == elmtCoords.x && neighbourCoords.y == elmtCoords.y;
		const neighbourOutOfGrid = neighbourCoords.x < 0 || neighbourCoords.x >= arr.length || neighbourCoords.y < 0 || neighbourCoords.y >= arr[0].length;
		if (neighbourIsCurrentElmt || neighbourOutOfGrid) {
			continue;
		}

		neighboursCoords.push(neighbourCoords);
	}
	return neighboursCoords;
}

function getNeighboursValues(elmtCoords, arr) {
	// elmtCoords => Coords (class) of a tile in arr
	// arr => a 2d array of elements containing elmt
	// getNeighboursCoords(elmtCoords, arr) => Returns values of neighbours of elmt in array.
	// 		excluding itself

	if (arr.length == 0) {
		console.error("Cannot get neighbours from empty array.");
		return;
	}

	const NEIGHBORS_COORDS_ADDENDS = [
		new Coords(-1, -1), new Coords(0, -1), new Coords(1, -1),
		new Coords(-1, 0) , new Coords(0, 0) , new Coords(1, 0),
		new Coords(-1, 1) , new Coords(0, 1) , new Coords(1, 1),
	];

	let neighboursCoords = [];
	for (let addend of NEIGHBORS_COORDS_ADDENDS) {
		const neighbourCoords = new Coords(elmtCoords.x + addend.x, elmtCoords.y + addend.y);

		const neighbourIsCurrentElmt = neighbourCoords.x == elmtCoords.x && neighbourCoords.y == elmtCoords.y;
		const neighbourOutOfGrid = neighbourCoords.x < 0 || neighbourCoords.x >= arr.length || neighbourCoords.y < 0 || neighbourCoords.y >= arr[0].length;
		if (neighbourIsCurrentElmt || neighbourOutOfGrid) {
			continue;
		}

		neighboursCoords.push(arr[neighbourCoords.x][neighbourCoords.y]);
	}
	return neighboursCoords;
}

function resetGrids() {
	// resetGrids() => Reset game grids to their original states
	gameGrid = [];
	solutionGrid = [];

	for (let x = 0; x < NUMBER_TILES_WIDTH; x++) {
		gameGrid.push([]);
		solutionGrid.push([])
		for (let y = 0; y <  NUMBER_TILES_WIDTH; y++) {
			gameGrid[x].push(-1);
			solutionGrid[x].push(0);
		}
	}
}

function displayTile(tileCoords) {
	// tileCoords => Coords of a tile on game grid
	// displayTile(tileCoords) => draw the tile on canvas
	const tileType = gameGrid[tileCoords.x][tileCoords.y];
	const tileDisplayCoords = new Coords(tileCoords.x * (canvas.width / NUMBER_TILES_WIDTH), tileCoords.y * (canvas.width / NUMBER_TILES_WIDTH));

	if (tileType > 0 && tileType < 9) {
		ctx.fillStyle = "skyblue";
		ctx.fillRect(tileDisplayCoords.x, tileDisplayCoords.y, (canvas.width / NUMBER_TILES_WIDTH), (canvas.width / NUMBER_TILES_WIDTH));

		ctx.font = (canvas.width / NUMBER_TILES_WIDTH) / 2 + "px Arial";
		ctx.fillStyle = "white";
		ctx.textBaseline = 'middle';
		ctx.textAlign = "center";
  		ctx.fillText(tileType, tileDisplayCoords.x + (canvas.width / NUMBER_TILES_WIDTH) / 2, tileDisplayCoords.y + (canvas.width / NUMBER_TILES_WIDTH) / 2);
  		return;
	}

	const tileDisplayColor = TILES_COLORS[tileType];
	ctx.fillStyle = tileDisplayColor;
	ctx.fillRect(tileDisplayCoords.x, tileDisplayCoords.y, (canvas.width / NUMBER_TILES_WIDTH), (canvas.width / NUMBER_TILES_WIDTH));
}

function drawGameGrid() {
	// displayGameGrid() => draw every tiles of gameGrid on canvas
	for (let x = 0; x < NUMBER_TILES_WIDTH; x++) {
		for (let y = 0; y <  NUMBER_TILES_WIDTH; y++) {
			const tileCoords = new Coords(x, y);
			displayTile(tileCoords);
		}
	}
}

function revealTile(tileCoords) {
	gameGrid[tileCoords.x][tileCoords.y] = solutionGrid[tileCoords.x][tileCoords.y];
	displayTile(tileCoords);
}

function revealGame() {
	for (let x = 0; x < NUMBER_TILES_WIDTH; x++) {
		for (let y = 0; y <  NUMBER_TILES_WIDTH; y++) {
			const tileCoords = new Coords(x, y);
			revealTile(tileCoords);
		}
	}
}

function startGame() {
	resetGrids();
	drawGameGrid();
	gameEnded = false;
}

function placeBombs(firstClickedTileCoords) {
	// firstClickedTileCoords => Coords of first tile clicked in the game
	// 		thus there should be no bomb here
	// placeBombs(firstClickedTileCoords) => Place correct amount of bombs tiles in solutionGrid
	// 		randomly, by avoiding to place one under first clicked tile

	if (NUMBER_TILES_WIDTH * NUMBER_TILES_WIDTH < AMOUNT_BOMBS) {
		console.error("Not enough space to put " + AMOUNT_BOMBS + " in solutionGrid.");
		return;
	}

	for (let i = 0; i < AMOUNT_BOMBS; i++) {
		const randomBombCoord = new Coords(randint(0, NUMBER_TILES_WIDTH), randint(0, NUMBER_TILES_WIDTH));
		const tileTypeAtBombCoords = solutionGrid[randomBombCoord.x][randomBombCoord.y];

		// Check is bomb placement is valid
		const randomTileIsAlreadyBomb = tileTypeAtBombCoords == 9;
		const randomTileIsFirstClickedTile = randomBombCoord.x == firstClickedTileCoords.x && randomBombCoord.y == firstClickedTileCoords.y;
		if (randomTileIsAlreadyBomb || randomTileIsFirstClickedTile) {
			i -= 1;
			continue;
		}
		
		// Set random tile type to bomb
		solutionGrid[randomBombCoord.x][randomBombCoord.y] = 9;
	}
}

function placeBombIndicators() {
	// placeBombIndicators() => Place how many bomb are around every tiles of solutionGrid
	for (let x = 0; x < NUMBER_TILES_WIDTH; x++) {
		for (let y = 0; y <  NUMBER_TILES_WIDTH; y++) {
			const tileCoords = new Coords(x, y);
			const tileType = solutionGrid[x][y];

			const tileIsBomb = tileType == 9;
			if (tileIsBomb) {
				continue;
			}

			const neighboursValues = getNeighboursValues(tileCoords, solutionGrid);
			const numberOfBombsNeighbours = countOccurences(9, neighboursValues);
			solutionGrid[x][y] = numberOfBombsNeighbours;
		}
	}
}

function generateSolutionGrid(firstClickedTileCoords) {
	placeBombs(firstClickedTileCoords);
	placeBombIndicators();
}

function openArea(tileCoords) {
	// openArea() => clear large area with no bomb around like in original minesweeper
	revealTile(tileCoords);
	const neighboursCoords = getNeighboursCoords(tileCoords, gameGrid);
	const neighboursValues = getNeighboursValues(tileCoords, gameGrid);

	for (let i = 0; i < neighboursValues.length; i++) {
		const neighbourCoords = neighboursCoords[i];
		let neighbourType = neighboursValues[i];
		
		const neighbourDuggedOut = neighbourType != -1
		if (neighbourDuggedOut) {
			continue;
		}

		revealTile(neighbourCoords);
		neighbourType = gameGrid[neighbourCoords.x][neighbourCoords.y];

		const neighbourIsBombIndicator = neighbourType > 0 && neighbourType < 9;
		const neighbourIsGrass = neighbourType == 0;
		if (neighbourIsBombIndicator) {
			revealTile(neighbourCoords);
		} else if (neighbourIsGrass) {
			openArea(neighbourCoords);
		}
	}
}

function loseGame() {
	revealGame();
	gameEnded = true;
	alert("You lose");
}

function winGame() {
	revealGame();
	gameEnded = true;
	alert("You win");
}

function checkVictory() {
	// checkVictory() => Check if every not bomb tile has been discovered
	// 		and trigger winGame() if needed
	for (let x = 0; x < NUMBER_TILES_WIDTH; x++) {
		for (let y = 0; y <  NUMBER_TILES_WIDTH; y++) {
			const tileUndug = gameGrid[x][y] == -1;
			const tileIsBomb = solutionGrid[x][y] == 9;

			const undugNonBombTileRemaining = tileUndug && !tileIsBomb;
			if (undugNonBombTileRemaining) {
				return;
			}
		}
	}
	winGame();
}

function digTile(tileCoords) {
	const tileType = solutionGrid[tileCoords.x][tileCoords.y];

	const tileDuggedOut = gameGrid[tileCoords.x][tileCoords.y] != -1;
	if (tileDuggedOut) {
		return;
	}

	const tileIsGrass = tileType == 0;
	const tileIsBombIndicator = tileType > 0 && tileType < 9;
	const tileTypeIsBomb = tileType == 9;
	if (tileIsGrass) {
		openArea(tileCoords);
	} else if (tileIsBombIndicator) {
		revealTile(tileCoords);
	} else if (tileTypeIsBomb) {
		solutionGrid[tileCoords.x][tileCoords.y] = 10;
		revealTile(tileCoords);
		loseGame();
		return;
	}
	checkVictory();
}

canvas.onclick = (e) => {
	const clickCoords = new Coords(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
	const tileCoords = new Coords(Math.floor(clickCoords.x / (canvas.width / NUMBER_TILES_WIDTH)), Math.floor(clickCoords.y / (canvas.width / NUMBER_TILES_WIDTH)));

	if (firstClick) {
		generateSolutionGrid(tileCoords);
		digTile(tileCoords);
		firstClick = false;
		return;
	}
	if (gameEnded) {
		startGame();
		generateSolutionGrid(tileCoords);
		return;
	}

	digTile(tileCoords);
}

startGame();