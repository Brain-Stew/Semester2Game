var bunn = document.getElementById("bunn");
var canvas = document.querySelector("canvas");
var pickup = document.getElementById("pickup");
var background = document.getElementById("background");
var sWall = document.getElementById("sideWall");
var draw = canvas.getContext("2d");
background.height=640;
background.width=640;
canvas.width = 640;
canvas.height = 640;

var counter =document.getElementById("txt");
var uInt; // Our variable for setInterval.
var map; // The background grid.
var scrollSpeed = 1; // A translation for all tiles.
var images = []; // Array for image objects. 0=water, 1=island, 2=gap
var imgStr = ["water", "island", "gap"];
var sideWall;
var wallFreq = 40; // Percentage to spawn wall block.
const ROWS = 16;
const COLS = 17;

var islandChance = 5;  // Percentage to spawn island tile.
var gapMoveChance = 95; // Percentage to move the gap tile.
var gapRow = Math.floor(Math.random() * ROWS); // 0-9.

var bunnX = 256;
var bunnY = 606;
var bunnSpeed = 8;
var pickupX = 0;//left
var pickupY = 0;//top

var fps = 60;
var wallCount = 0; //keep track of the number of walls deploy
var wallSecs = 3; //number of second the wall will last
var wallLife = fps*wallSecs; //number of frame the wall stay lasted
var wallWidth = 41;
var wallLength = 41;
var wall = [];

var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;
var wallPressed = false;

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

var updateInterval = setInterval(update, 33.34); // 60 FPS.
var pickupCtr = 0;
var pickupSecs = 3;
var maxPickupCtr = fps*pickupSecs;
var numPickups = 0;

createMap(); // Our initial function call to generate map.

function update()
{
	scrollMap();
	console.log(wallBound());
	if(wallBound())
	{
		movebunn();
	}
	
	checkWallHealth()
	checkWallCollision();
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
	sideWall = [];//create side walls 
	for (var row = 0; row < ROWS; row++)
	{
		map[row] = []; // For each row, create 2nd dimension for columns.
		sideWall[row] = []; // For each row, create 2nd dimension for columns.
		for (var col = 0; col < COLS; col++)
		{
			var tile = {}; 	  // Create empty object.
			var wallTile = {}; 	  // Create empty object.
			var randRoll = Math.ceil(Math.random() * 99); // Roll the dice. 1-100.
			tile.x = col*64;  // Add custom x property.
			tile.y = row*64;  // Add custom y property.
			tile.img = images[0]; // Link tile to water image.
			if (randRoll <= wallFreq){
				wallTile.x = row*40; //16tiles = 40px tile
				wallTile.y = col*40;
			}
			sideWall[row][col] = wallTile; // Tile object is stored in 2D array.
			map[row][col] = tile; // Tile object is stored in 2D array.
		}
	}
	uInt = setInterval(update, 33.34); // Start off at 30 frames per second.
}

function drawMap(){
	for (var row=0; row<sideWall.length;row++)
	{
		for(var col=0; col<sideWall.length; col++)
		{
			draw.drawImage(sWall,sideWall[row][col].x,sideWall[row][col].y,wallWidth,wallLength);
		}
	}
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
	if (leftPressed == true && bunnX > 0 && (wallBound(bunnX,bunnY,1,-1,0) != false) )
		bunnX -= bunnSpeed;
	if (rightPressed == true && bunnX <= canvas.width-bunn.width&& (wallBound(bunnX,bunnY,1,1,0) != false))
		bunnX += bunnSpeed;
	if (upPressed == true && bunnY > 0 && (wallBound(bunnX,bunnY,1,0,-1) != false))
		bunnY -= bunnSpeed;
	if (downPressed == true && bunnY <= canvas.height-bunn.height && (wallBound(bunnX,bunnY,1,0,1) != false))
		bunnY += bunnSpeed;
	if (wallPressed == true){
		createWall();
	}
}

function checkWallCollision(){
	for (var i = 0; i < wallCount; i++)
	{
		if (leftPressed == true && bunnX == wall[i].x && bunnY == wall[i].y)
		{
			bunnX -= bunnSpeed;
			bunnY -= bunnSpeed;
		}
	}
}

function checkWallHealth()
{
	var wallTemp = wall;
	for (var i = 0; i < wallCount;i++)
	{
		if(wallTemp[i].life != 0){	
			wall[i].life --;
			console.log(wall[i].life);
		}else
		{
			wall.shift(); // Remove first element in the wall array
			wallCount--;
		}
	}	
}

function pickupCollected()
{
 numPickups+=5;// counter for how many items have been collected
 document.getElementById("txt").value = numPickups; // used for making the counter appear on screen
 pickupX = -1000; //this is set to -1000 because it would never be triggered again since collision does not let you go off screen where the negative values are 
 pickupY = -1000;
}

function createWall()
{
	if(numPickups>0){
	var wallPost = {};// position of the wall
	wallPost.x = bunnX + 40;
	wallPost.y = bunnY;
	wallPost.life = wallLife;
	wall[wallCount] = wallPost;
	
	wallCount++;
	numPickups--;
	}
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

//predict if object's next move would collide with side wall
//dirX: -1 =left; 0 =no movement; 1 = right
//dirY: -1 =up; 0 =no movement; 1 = down
function wallBound(objX,objY,speed,dirX,dirY)
{
	
	for (var row=0; row<ROWS;row++)
	{
		for(var col=0; col<COLS; col++)
		{
			if ((objY+(dirY*speed)) < sideWall[row][col].y+40&&//player.top < bottom side wall
				((objY+34)+(dirY*speed)) > sideWall[row][col].y&&//player.bottom > top side wall  
				(objX+(dirX*speed)) < sideWall[row][col].x +40&&//player.left < right side wall
				((objX+34)+(dirY*speed)) > sideWall[row][col].x // player.right > left side wall
				){
				return false;
				}
		}
	}
	return true;
}

function render()
{
	bunn.style.left = bunnX+"px";
	bunn.style.top = bunnY+"px";
	
	pickup.style.left = pickupX+"px";
	pickup.style.top = pickupY+"px";
	
	draw.clearRect(0,0,canvas.width,canvas.height); // Clears what was drawn on the canvas within the specified rectangle.
	draw.drawImage(background,0,0,640,640); //draw background
	
	drawMap();
	for (var row = 0; row < ROWS; row++)
	{
		for (var col = 0; col < COLS; col++)
		{
			draw.drawImage(map[row][col].img, map[row][col].x, map[row][col].y);
		}
	}
	
	if(wallPressed == true)
	{
		createWall();
	}
	
	for (i = 0; i < wallCount; i++) { //draw wall
		draw.drawImage(bunn,wall[i].x,wall[i].y,34,34);
		
	}
	
}