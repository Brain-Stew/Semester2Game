var player = document.getElementById("player");
var pickup = document.getElementById("pickup");
var sfx = document.getElementById("sfx");
var playerX = 256;//left side coords
var playerY = 256;//top side coords
var playerSpeed = 10;
var pickupX = 0;//left
var pickupY = 0;//top
var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
var fps = 60;// a frame is one execution of the update()
var updateInterval = setInterval(update, 16.67); // 60 FPS.
var pickupCtr = 0;
var pickupSecs = 3;//number of seconds between jumps of the video card
var maxPickupCtr = fps * pickupSecs;
var numPickups = 0;

//a lot of this program is from the fish assignment from last semester with some changes
// the pickupCollected function and collision function are the important functions to the task 
// you assigned if you need anything changed let me(Eli) or Ash know

function update()
{
 movePlayer();
 if(pickupCtr == maxPickupCtr)
 {
  pickupCtr = 0;
 }
 else
 {
  pickupCtr++;
  checkCollision();
  render();
 }
}
function movePlayer()
{
 if (leftPressed == true && playerX > 0)
  playerX -= playerSpeed;
 if (rightPressed == true && playerX < 512-player.width)
  playerX += playerSpeed;
 if (upPressed == true && playerY > 0)
  playerY -= playerSpeed;
 if (downPressed == true && playerY < 512-player.height)
  playerY += playerSpeed;
 
}
function pickupCollected()
{

 pickup.style.display = "none";// makes collectible item disappear
 numPickups++;// counter for how many items have been collected
 document.getElementById("txt").value = numPickups; // used for making the counter appear on screen
 pickupX = -1000; //this is set to -1000 because it would never be triggered again since collision does not let you go off screen where the negative values are 
 pickupY = -1000;
 
 
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
 }
}
function checkCollision()
{//0,0 is top left the number get bigger as we go down and left
 //if(cond1 || cond2 || cond3 || cond4)
  if(!(playerY > pickupY + 64 || //player.top > pickup.bottom
    playerY + 64 < pickupY    ||//player.bottom < pickup.top   
    playerX > pickupX + 64    ||//player.left > pickup. right
    playerX + 128<pickupX))  // player.right < pickup.left
    //64 is the height of the picture
  {//we are colliding
   
   pickupCtr = 0;
   pickupCollected();// calling the collectibles function here when collision is detected
  }
}
function render()
{
 player.style.left = playerX+"px";
 player.style.top = playerY+"px";
 
 pickup.style.left = pickupX+"px";
 pickup.style.top = pickupY+"px";
}
