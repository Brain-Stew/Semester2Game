var bunn = document.getElementById("bunn");
var canvas = document.querySelector("canvas");
var pickup = document.getElementById("pickup");
var surface = canvas.getContext("2d");
var draw = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 640;

var counter =document.getElementById("txt");
var uInt; // Our variable for setInterval.
var map; // The background grid.
var scrollSpeed = 1; // A translation for all tiles.
var images = []; // Array for image objects. 0=water, 1=island, 2=gap
var imgStr = ["water", "island", "gap"];
const ROWS = 10;
const COLS = 11;

var islandChance = 5;  // Percentage to spawn island tile.
var gapMoveChance = 95; // Percentage to move the gap tile.
var gapRow = Math.floor(Math.random() * ROWS); // 0-9.

var bunnX = 256;
var bunnY = 256;
var bunnSpeed = 10;
var pickupX = 0;//left
var pickupY = 0;//top

var wallCount = 0; 
var wall = [];

var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;
var wallPressed = false;

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

var fps = 60;
var updateInterval = setInterval(update, 33.34); // 60 FPS.
var pickupCtr = 0;
var pickupSecs = 3;
var maxPickupCtr = fps*pickupSecs;
var numPickups = 0;



createMap(); // Our initial function call to generate map.

function update()
{
	scrollMap();
	movebunn();
	if(pickupCtr++ == maxPickupCtr)
 {
  pickupCtr = 0;
  movePickup();
 }
 else
 {
  pickupCtr++;
  checkCollision();
 }
 render();
}

function createMap()
{
	for (var i = 0; i < imgStr.length; i++)
	{
		images[i] = new Image();
		images[i].src = "../img/"+imgStr[i]+".png";
	}
	map = []; // Create map array first dimension.
	for (var row = 0; row < ROWS; row++)
	{
		map[row] = []; // For each row, create 2nd dimension for columns.
		for (var col = 0; col < COLS; col++)
		{
			var tile = {}; 	  // Create empty object.
			tile.x = col*64;  // Add custom x property.
			tile.y = row*64;  // Add custom y property.
			tile.img = images[0]; // Link tile to water image.
			map[row][col] = tile; // Tile object is stored in 2D array.
		}
	}
	uInt = setInterval(update, 33.34); // Start off at 30 frames per second.
}

function scrollMap()
{
	// Iterate through all the tiles in map.
	for (var row = 0; row < ROWS; row++)
	{
		for (var col = 0; col < COLS; col++)
		{
			map[row][col].x -= scrollSpeed; // Subtract speed from tile's x.
		}
	}
	if (map[0][0].x <= -64) // If first column goes fully off canvas.
	{
		for (var row = 0; row < ROWS; row++) // For each row.
		{
			map[row].shift(); // Remove first element in that row.
			var tile = {}; // Create new tile.
			tile.x = (COLS-1)*64;
			tile.y = row*64;
			setTileType(tile, row);	// Tile is passed by reference so we can change it in function.	
			map[row].push(tile); // Add new tile to end of row.
		}
		//Moving the gap.
		var randRoll = Math.ceil(Math.random() * 99);
		if (randRoll <= gapMoveChance)
		{
			if (gapRow == 0)
				gapRow++;
			else if (gapRow == ROWS-1)
				gapRow--;
			else
				gapRow += (1 - (Math.floor(Math.random() * 2) * 2)); // 1 or -1
		}
	}
}

function setTileType(t, r) // T holds tile and r holds row.
{
	
	if (r == gapRow)
		t.img = images[2];
	else
	{
		var randRoll = Math.ceil(Math.random() * 99); // Roll the dice. 1-100.
		if (randRoll <= islandChance)
			t.img = images[1];
		else
			t.img = images[0];
	}
}







function movebunn()
{
	if (leftPressed == true && bunnX > 0)
		bunnX -= bunnSpeed;
	if (rightPressed == true && bunnX <= canvas.width-bunn.width)
		bunnX += bunnSpeed;
	if (upPressed == true && bunnY > 0)
		bunnY -= bunnSpeed;
	if (downPressed == true && bunnY <= canvas.height-bunn.height)
		bunnY += bunnSpeed;
	if (wallPressed == true){
		createWall();
	
	}
}

function pickupCollected()
{

 
 numPickups++;// counter for how many items have been collected
 document.getElementById("txt").value = numPickups; // used for making the counter appear on screen
 pickupX = -1000; //this is set to -1000 because it would never be triggered again since collision does not let you go off screen where the negative values are 
 pickupY = -1000;
 
 
}

function createWall()
{
	var wallPost = {};// position of the wall
	wallPost.x = bunnX+10;
	wallPost.y = bunnY;
	wall[wallCount] = wallPost;
	
	
	wallCount++;
	
}

function movePickup()
{
	pickupX = Math.floor(Math.random() * (640-pickup.width));
	pickupY = Math.floor(Math.random() * (640-pickup.height));
	
	
	
}



function onKeyDown(event)
{
	switch (event.keyCode)
	{
		case 65: // A
			leftPressed = true; 
			break;
		case 68: // D
			rightPressed = true;
			break;
		case 87: // W
			upPressed = true;
			break;
		case 83: // S
			downPressed = true;
			break;
		case 74: // J
			wallPressed = true;
			break;
	} 
}

function onKeyUp(event)
{
	switch (event.keyCode)
	{
		case 65: // A
			leftPressed = false; 
			break;
		case 68: // D
			rightPressed = false;
			break;
		case 87: // W
			upPressed = false;
			break;
		case 83: // S
			downPressed = false;
			break;
		case 74: // J
			wallPressed = false;
			break;
	}
}

function checkCollision()
{
  if(!(bunnY > pickupY + 64 || //player.top > pickup.bottom
    bunnY + 90 < pickupY    ||//player.bottom < pickup.top   
    bunnX > pickupX + 64    ||//player.left > pickup. right
    bunnX + 90<pickupX))  // player.right < pickup.left
	
	
    
  {//we are colliding
   
   pickupCtr = 0;
   pickupCollected();// calling the collectibles function here when collision is detected
  }
}

function render()
{
	bunn.style.left = bunnX+"px";
	bunn.style.top = bunnY+"px";
	
	pickup.style.left = pickupX+"px";
	pickup.style.top = pickupY+"px";
	
	
	
	surface.clearRect(0,0,canvas.width,canvas.height); // Clears what was drawn on the canvas within the specified rectangle.
	for (var row = 0; row < ROWS; row++)
	{
		for (var col = 0; col < COLS; col++)
		{
			surface.drawImage(map[row][col].img, map[row][col].x, map[row][col].y);
		}
	}

	if(wallPressed)
	{
		createWall();
	}
	
	
	for (i = 0; i < wallCount; i++) { 
	
		surface.drawImage(bunn,wall[i].x,wall[i].y);		
	}
	
}