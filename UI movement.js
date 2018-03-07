var goingUp = false;
var movingSlowly = false;

function gameLoop() {
    if (ufo.y >= bottomOfRange) {
        goingUp = true;
    }
    else if (ufo.y <= topOfRange) {
        goingUp = false;
    }
 
    if (ufo.y <= bottomOfRange + 10) {
        movingSlowly = true;
    }
    else if (ufo.y >= topOfRange - 10) {
        movingSlowly = true;
    }
    else
        movingSlowly = false;
    }
     
    if (movingSlowly) {
        if (goingUp) {
            ufo.y -= ufo.ySpeed / 2;
        } else {
            ufo.y += ufo.ySpeed / 2;
        }
    } else {
        if (goingUp) {
            ufo.y -= ufo.ySpeed;
        } else {
            ufo.y += ufo.ySpeed;
        }   
    }
     
    ufo.x += ufo.xSpeed;
}