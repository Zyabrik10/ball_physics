// initializing canvas and its context
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

// make the canvas size equals to browser window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// make constants equals to the function link within the Math class
const sqrt = Math.sqrt;
const floor = Math.floor;
const pow = Math.pow;
const pi = Math.PI;

// create a global function of updating frames that will work in each browser
window.FPS = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

function getDist(a, b) {
	return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

const mouse = {
	move: { x: 0, y: 0 },
	down: { x: 0, y: 0 },
	lastDown: { x: 0, y: 0 },
	isDown: false,
	vel: { x: 0, y: 0 },
	startPosition: { x: 0, y: 0 },
	endPosition: { x: 0, y: 0 }
};

const world = {
	// force of gravity
	fg: 0.7,
	// coefficient of lossing energy
	cle: 0.6,
	startingTime: undefined,
	lastTime: undefined,
	elapsedSinceLastLoop: undefined,
};

const ball = {
	// coordinate
	coor: { x: canvas.width / 2, y: canvas.height / 2 },
	//velocity
	vel: { x: 0, y: 0 },
	// acceleration
	acc: { x: 0, y: 0 },
	// radius
	rad: 60, drag: false
};

function draw(obj) {
	ctx.beginPath();

	ctx.strokeStyle = "rgba(250, 10, 80, 1)";
	ctx.fillStyle = "rgba(250, 10, 80, .1)";

	ctx.arc(obj.coor.x, obj.coor.y, obj.rad, 0, 2 * pi);

	ctx.stroke();
	ctx.fill();
}

function move(obj) {
	if (!obj.drag) {
		obj.vel.y += world.fg;

		obj.coor.x += obj.vel.x;
		obj.coor.y += obj.vel.y;

		// <<<<< collision
		if (obj.coor.y >= canvas.height - obj.rad || obj.coor.y <= obj.rad) obj.vel.y *= -1 * world.cle;

		if (obj.coor.y >= canvas.height - obj.rad) {
			obj.coor.y = canvas.height - obj.rad;
			obj.vel.x *= 0.97;
		} else if (obj.coor.y <= obj.rad) obj.coor.y = obj.rad;

		if (obj.coor.x >= canvas.width - obj.rad || obj.coor.x <= obj.rad) obj.vel.x *= -1 * world.cle;

		if (obj.coor.x >= canvas.width - obj.rad) {
			obj.coor.x = canvas.width - obj.rad;
		} else if (obj.coor.x <= obj.rad) obj.coor.x = obj.rad;
		// >>>>>
	}
}

function getLoopTime(currentTime) {
	if (!world.startingTime) world.startingTime = currentTime;
	if (!world.lastTime) world.lastTime = currentTime - world.startingTime;
	world.elapsedSinceLastLoop = currentTime - world.lastTime;
	world.lastTime = currentTime;
}

function update(currentTime) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	draw(ball);
	move(ball);

	getLoopTime(currentTime);
	window.FPS(update);
}

window.FPS(update);

canvas.onmousemove = function (e) {
	var x = e.offsetX;
	var y = e.offsetY;
	var Sx, Sy, t;

	if (mouse.isDown) {
		ball.coor.x = x - mouse.lastDown.x;
		ball.coor.y = y - mouse.lastDown.y;
	}

	mouse.startPosition.x = x;
	mouse.startPosition.y = y;

	Sx = mouse.startPosition.x - mouse.endPosition.x;
	Sy = mouse.startPosition.y - mouse.endPosition.y;
	t = world.elapsedSinceLastLoop;

	mouse.vel.x = floor((Sx / t) * 10);
	mouse.vel.y = floor((Sy / t) * 10);

	mouse.endPosition.x = x;
	mouse.endPosition.y = y;

};

canvas.onmousedown = function ({ x, y }) {

	var dist = getDist({
		x: x,
		y: y
	}, ball.coor);

	//  <<<<<< checks if we pressed the mouse button inside the ball
	if (dist < ball.rad) {
		mouse.lastDown.x = x - ball.coor.x;
		mouse.lastDown.y = y - ball.coor.y;
		mouse.isDown = true;
		ball.vel.y = 0;
		ball.vel.x = 0;
		ball.drag = true;
	}
	// >>>>>>>>>

};

canvas.onmouseup = function () {
	// restore all variables we used in onmousedown function
	mouse.isDown = false;

	if (ball.drag) {
		ball.vel.x = mouse.vel.x;
		ball.vel.y = mouse.vel.y;
	}

	ball.drag = false;
};