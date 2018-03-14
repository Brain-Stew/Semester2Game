/**
 * Initialize the Game and start it.
 */
var game = new Game();

function init() {
	game.init();
}


/**
 * Define an object to hold all our images for the game so images
 * are only ever created once
 */
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.dustBunn = new Image();
	this.bullet = new Image();
	this.enemy = new Image();
	this.enemyClaw = new Image();

	// make sure images are loaded
	var numImages = 5;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.dustBunn.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.enemy.onload = function() {
		imageLoaded();
	}
	this.enemyClaw.onload = function() {
		imageLoaded();
	}

	// Set images
	this.background.src = "imgs/bg.png";
	this.dustBunn.src = "imgs/player.png";
	this.bullet.src = "imgs/bullet.png";
	this.enemy.src = "imgs/enemy.png";
	this.enemyClaw.src = "imgs/bullet_enemy.png";
}



function Drawable() {
	this.init = function(x, y, width, height) {
		// Default variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.isColliding = false;
	this.type = "";

	// Define function for child objects
	this.draw = function() {
	};
	this.move = function() {
	};
	this.isCollidableWith = function(object) {
		return (this.collidableWith === object.type);
	};
}


/*
 * Creates the Background object which will become a child of
 * the Drawable object */
 
function Background() {
	this.speed = 1; // Speed running

	
	this.draw = function() {
		// Pan background
		this.y += this.speed;
		this.context.drawImage(imageRepository.background, this.x, this.y);

		this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);

		
		if (this.y >= this.canvasHeight)
			this.y = 0;
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


/*
 * Creates the Bullet object which the bunny fires
 */
 
function Bullet(object) {
	this.alive = false; // Is true if the bullet is currently in use
	var self = object;
	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	/*
	 * erase the bullet and moves it.
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+2, this.height+2);
		this.y -= this.speed;

		if (this.isColliding) {
			return true;
		}
		else if (self === "bullet" && this.y <= 0 - this.height) {
			return true;
		}
		else if (self === "enemyClaw" && this.y >= this.canvasHeight) {
			return true;
		}
		else {
			if (self === "bullet") {
				this.context.drawImage(imageRepository.bullet, this.x, this.y);
			}
			else if (self === "enemyClaw") {
				this.context.drawImage(imageRepository.enemyClaw, this.x, this.y);
			}

			return false;
		}
	};

	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Bullet.prototype = new Drawable();



function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;

	/*
	 * Clears the quadTree and all nodes of objects
	 */
	this.clear = function() {
		objects = [];

		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].clear();
		}

		this.nodes = [];
	};

	/*
	 * Get all objects in the quadTree
	 */
	this.getAllObjects = function(returnedObjects) {
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].getAllObjects(returnedObjects);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	/*
	 * Return all objects that the object could collide with
	 */
	this.findObjects = function(returnedObjects, obj) {
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}

		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length) {
			this.nodes[index].findObjects(returnedObjects, obj);
		}

		for (var i = 0, len = objects.length; i < len; i++) {
			returnedObjects.push(objects[i]);
		}

		return returnedObjects;
	};

	/*
	 If the tree
	 * exceeds the capacity, it will split and add all
	 * objects to their corresponding nodes. ** do more research on how this works**
	 */
	this.insert = function(obj) {
		if (typeof obj === "undefined") {
			return;
		}

		if (obj instanceof Array) {
			for (var i = 0, len = obj.length; i < len; i++) {
				this.insert(obj[i]);
			}

			return;
		}

		if (this.nodes.length) {
			var index = this.getIndex(obj);
			
			if (index != -1) {
				this.nodes[index].insert(obj);

				return;
			}
		}

		objects.push(obj);

		// Prevent infinite splitting.. its a quad tree thing 
		if (objects.length > maxObjects && level < maxLevels) {
			if (this.nodes[0] == null) {
				this.split();
			}

			var i = 0;
			while (i < objects.length) {

				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i,1))[0]);
				}
				else {
					i++;
				}
			}
		}
	};

	
	this.getIndex = function(obj) {

		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

		// Object can fit completely within the top quadrant
		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		// Object can fit completely within the bottom quandrant
		var bottomQuadrant = (obj.y > horizontalMidpoint);

		// Object can fit completely within the left quadrants
		if (obj.x < verticalMidpoint &&
				obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			}
			else if (bottomQuadrant) {
				index = 2;
			}
		}
		// Object can fix completely within the right quandrants
		else if (obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			}
			else if (bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	};

	/*
	 * Splits the node into 4 subnodes
	 */
	this.split = function() {
		
		var subWidth = (this.bounds.width / 2) | 0;
		var subHeight = (this.bounds.height / 2) | 0;

		this.nodes[0] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[1] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[2] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[3] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
	};
}


/**
 * Custom Pool object. Holds Bullet objects to be managed to prevent
 * garbage collection. */

function Pool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
	var pool = [];

	this.getPool = function() {
		var obj = [];
		for (var i = 0; i < size; i++) {
			if (pool[i].alive) {
				obj.push(pool[i]);
			}
		}
		return obj;
	}

	/*
	 * Populates the pool array with butts
	 */
	this.init = function(object) {
		if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imageRepository.bullet.width,
										imageRepository.bullet.height);
				bullet.collidableWith = "enemy";
				bullet.type = "bullet";
				pool[i] = bullet;
			}
		}
		else if (object == "enemy") {
			for (var i = 0; i < size; i++) {
				var enemy = new Enemy();
				enemy.init(0,0, imageRepository.enemy.width,
									 imageRepository.enemy.height);
				pool[i] = enemy;
			}
		}
		else if (object == "enemyClaw") {
			for (var i = 0; i < size; i++) {
				var bullet = new Bullet("enemyClaw");
				bullet.init(0,0, imageRepository.enemyClaw.width,
										imageRepository.enemyClaw.height);
				bullet.collidableWith = "player";
				bullet.type = "enemyClaw";
				pool[i] = bullet;
			}
		}
	};

	
	this.get = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	/*
	 * This is for if the bun wants to fire two at a time.. leaving it for now but he shoots one
	 */
	this.getTwo = function(x1, y1, speed1) {
		if(!pool[size - 1].alive && !pool[size - 2].alive) {
			this.get(x1, y1, speed1);
		}
	};

	/*
	 * clears bullets and pushes them to the front of the array
	 */
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}


/**
 * this is the player controller 
 */
function Bunn() {
	this.speed = 3;
	this.bulletPool = new Pool(30);
	var fireRate = 15;
	var counter = 0;
	this.collidableWith = "enemyClaw";
	this.collidableWith = "enemy";
	this.type = "player";

	this.init = function(x, y, width, height) {
		// Defualt variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.alive = true;
		this.isColliding = false;
		this.bulletPool.init("bullet");
	}

	this.draw = function() {
		this.context.drawImage(imageRepository.dustBunn, this.x, this.y);
	};
	this.move = function() {
		counter++;
		// Determine if the action is move action
		if (KEY_STATUS.a || KEY_STATUS.d ||
				KEY_STATUS.s || KEY_STATUS.w) {
			// The player moved, so erase it's current image so it can
			// be redrawn in it's new location
			this.context.clearRect(this.x, this.y, this.width, this.height);

			// Update x and y according to the direction to move and
			// redraw the bunny.
			if (KEY_STATUS.a) {
				this.x -= this.speed
				if (this.x <= 0) // Kep player within the screen
					this.x = 0;
			} else if (KEY_STATUS.d) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.w) {
				this.y -= this.speed
				if (this.y <= this.canvasHeight/200*3)
					this.y = this.canvasHeight/200*3;
			} else if (KEY_STATUS.s) {
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
		}

		// Redraw the player
		if (!this.isColliding) {
			this.draw();
		}
		else {
			this.alive = false;
			game.gameOver();
		}

		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
	};

	/*
	 * Fires two bullets, it fires one right now but It CAN
	 */
	this.fire = function() {
		this.bulletPool.getTwo(this.x+6, this.y, 3,
		                       this.x+33, this.y, 3);
		game.laser.get();
	};
}
Bunn.prototype = new Drawable();


/**
 * Create the Enemy cat object. colliders not working!!
 */
function Enemy() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	this.collidableWith = "bullet";
	this.type = "enemy";

	/*
	 * Sets the Enemy values
	 */
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 90;
		this.rightEdge = this.x + 300;
		this.bottomEdge = this.y + 290;
	};

	/*
	 * Move the enemy
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= this.leftEdge) {
			this.speedX = this.speed;
		}
		else if (this.x >= this.rightEdge + this.width) {
			this.speedX = -this.speed;
		}
		else if (this.y >= this.bottomEdge) {
			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 5;
			this.speedX = -this.speed;
		}

		if (!this.isColliding) {
			this.context.drawImage(imageRepository.enemy, this.x, this.y);

			// Enemy has a chance to shoot claWWWS every movement
			chance = Math.floor(Math.random()*101);
			if (chance/100 < percentFire) {
				this.fire();
			}

			return false;
		}
		else {
			game.playerScore += 10;
			game.explosion.get();
			return true;
		}
	};

	/*
	 * Fires a claw
	 */
	this.fire = function() {
		game.enemyClawPool.get(this.x+this.width/2, this.y+this.height, -2.5);
	};

	/*
	 * Resets the enemy values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
		this.isColliding = false;
	};
}
Enemy.prototype = new Drawable();


 /**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects.
	 */
	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.playerCanvas = document.getElementById('player');
		this.mainCanvas = document.getElementById('main');

		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.playerContext = this.playerCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			// Initialize objects
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Bunn.prototype.context = this.playerContext;
			Bunn.prototype.canvasWidth = this.playerCanvas.width;
			Bunn.prototype.canvasHeight = this.playerCanvas.height;

			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0

			// Initialize the player object
			this.player = new Bunn();
			// Set the player to start near the bottom middle of the canvas
			this.playerStartX = this.playerCanvas.width/2 - imageRepository.dustBunn.width;
			this.playerStartY = this.playerCanvas.height/4*3 + imageRepository.dustBunn.height*2;
			this.player.init(this.playerStartX, this.playerStartY,
			               imageRepository.dustBunn.width, imageRepository.dustBunn.height);

			// Initialize the enemy pool object
			this.enemyPool = new Pool(1);
			this.enemyPool.init("enemy");
			this.spawnWave();

			this.enemyClawPool = new Pool(50);
			this.enemyClawPool.init("enemyClaw");

			// Start QuadTree
			this.quadTree = new QuadTree({x:0,y:0,width:this.mainCanvas.width,height:this.mainCanvas.height});

			this.playerScore = 0;

			// Audio files
			this.laser = new SoundPool(10);
			this.laser.init("laser");

			this.explosion = new SoundPool(20);
			this.explosion.init("explosion");

			this.backgroundAudio = new Audio("sounds/kick_shock.wav");
			this.backgroundAudio.loop = true;
			this.backgroundAudio.volume = .25;
			this.backgroundAudio.load();

			this.gameOverAudio = new Audio("sounds/game_over.wav");
			this.gameOverAudio.loop = true;
			this.gameOverAudio.volume = .25;
			this.gameOverAudio.load();

			this.checkAudio = window.setInterval(function(){checkReadyState()},1000);
		}
	};

	// Spawn a new wave of enemies
	this.spawnWave = function() {
		var height = imageRepository.enemy.height;
		var width = imageRepository.enemy.width;
		var x = 100;
		var y = -height;
		var spacer = y * 1.5;
		for (var i = 1; i <= 18; i++) {
			this.enemyPool.get(x,y,2);
			x += width + 25;
			if (i % 6 == 0) {
				x = 100;
				y += spacer
			}
		}
	}

	// Start the animation loop
	this.start = function() {
		this.player.draw();
		this.backgroundAudio.play();
		animate();
	};

	// Restart the game
	this.restart = function() {
		this.gameOverAudio.pause();

		document.getElementById('game-over').style.display = "none";
		this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
		this.playerContext.clearRect(0, 0, this.playerCanvas.width, this.playerCanvas.height);
		this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

		this.quadTree.clear();

		this.background.init(0,0);
		this.player.init(this.playerStartX, this.playerStartY,
		               imageRepository.dustBunn.width, imageRepository.dustBunn.height);

		this.enemyPool.init("enemy");
		this.spawnWave();
		this.enemyClawPool.init("enemyClaw");

		this.playerScore = 0;

		this.backgroundAudio.currentTime = 0;
		this.backgroundAudio.play();

		this.start();
	};

	// Game over
	this.gameOver = function() {
		this.backgroundAudio.pause();
		this.gameOverAudio.currentTime = 0;
		this.gameOverAudio.play();
		document.getElementById('game-over').style.display = "block";
	};
}

/**
 *make sure game sound has loaded before starting the game
 */
function checkReadyState() {
	if (game.gameOverAudio.readyState === 4 && game.backgroundAudio.readyState === 4) {
		window.clearInterval(game.checkAudio);
		document.getElementById('loading').style.display = "none";
		game.start();
	}
}


/**
 * A sound pool to use for the sound effects
 */
function SoundPool(maxSize) {
	var size = maxSize; // Max bullets allowed in the pool
	var pool = [];
	this.pool = pool;
	var currSound = 0;

	/*
	 * Populates the pool array with sounds
	 */
	this.init = function(object) {
		if (object == "laser") {
			for (var i = 0; i < size; i++) {
				// Initalize the object
				laser = new Audio("sounds/laser.wav");
				laser.volume = .12;
				laser.load();
				pool[i] = laser;
			}
		}
		else if (object == "explosion") {
			for (var i = 0; i < size; i++) {
				var explosion = new Audio("sounds/explosion.wav");
				explosion.volume = .1;
				explosion.load();
				pool[i] = explosion;
			}
		}
	};

	/*
	 * Plays a sound
	 */
	this.get = function() {
		if(pool[currSound].currentTime == 0 || pool[currSound].ended) {
			pool[currSound].play();
		}
		currSound = (currSound + 1) % size;
	};
}



function animate() {
	document.getElementById('score').innerHTML = game.playerScore;

	// Insert objects into quadtree
	game.quadTree.clear();
	game.quadTree.insert(game.player);
	game.quadTree.insert(game.player.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.enemyClawPool.getPool());

	detectCollision();

	// No more enemies
	if (game.enemyPool.getPool().length === 0) {
		game.spawnWave();
	}

	// Animate game objects
	if (game.player.alive) {
		requestAnimFrame( animate );

		game.background.draw();
		game.player.move();
		game.player.bulletPool.animate();
		game.enemyPool.animate();
		game.enemyClawPool.animate();
	}
}

function detectCollision() {
	var objects = [];
	game.quadTree.getAllObjects(objects);

	for (var x = 0, len = objects.length; x < len; x++) {
		game.quadTree.findObjects(obj = [], objects[x]);

		for (y = 0, length = obj.length; y < length; y++) {

			// DETECT COLLISION ALGORITHM
			if (objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y)) {
				objects[x].isColliding = true;
				obj[y].isColliding = true;
			}
		}
	}
};


// The keycodes 
KEY_CODES = {
  32: 'space',
  65: 'a',
  87: 'w',
  68: 'd',
  83: 's',
}

// Creates the array to hold the KEY_CODES and sets all their values
// to true. 
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}


document.onkeydown = function(e) {
	
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
		e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}


document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}



window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();
