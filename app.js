import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// -----------------------------------------------------------------------------
// 		SETUP THE BODY
// -----------------------------------------------------------------------------

const body = d3.select('body')
	.style('background-color','#70A7FF')

// -----------------------------------------------------------------------------
// 		SETUP THE TITLE
// -----------------------------------------------------------------------------

// Add a title to the page
const title = d3.create('h1')
	.style('text-align','center')
	.text('Parallax')
	.style('padding-top','20px')
	.style('font-family','cursive')
	// .style('outline', 'thin solid black')
	;

// Append the title and the svg element to the DOM
container.append(title.node());

// -----------------------------------------------------------------------------
// 		SETUP THE SVG ELEMENT
// -----------------------------------------------------------------------------

// Declare the svg1 dimensions
const svg1Params = {
	width: 900,
	height: 300,
	'y-margin': '30px'
};

// Create the svg holder for the main solarSystem elements
const svg1 = d3.create('svg')
	.attr('id','localBubble')
	.attr('width',svg1Params['width'])
	.attr('height',svg1Params['height'])
	// Center and outline the svg element
	.style('margin', `${svg1Params['y-margin']} auto`)
	.style("display", "block")
	.style('outline', 'thick solid #2176FF')
	.style('background','#33A1FD')
	;

// -----------------------------------------------------------------------------
// 		SETUP THE SOLAR SYSTEM
// -----------------------------------------------------------------------------

// Create a series of parameters to control the Solar System
const solarSystemParams = {
	'center-x': svg1Params['width']/8,
	'center-y': svg1Params['height']/2,
	rSun: 20,
	rOrbit: 80,
	rEarth: 6,
	earthAngle: Math.PI/2
};

// Create a series of parameters to control objects within the Solar System
const solarSystemObjects = [
	{name: 'Sun', radius: 20},
	{name: 'Earth', radius: 6},
	{name: 'Orbit', radius: 40}
]

// Append a solar system
const solarSystem = svg1.append('g')
	.attr('id','solarSystem')
	.attr('transform',`translate(${solarSystemParams['center-x']},${solarSystemParams['center-y']})`)
	;

// Append the title and the svg element to the DOM
container.append(svg1.node());

// -----------------------------------------------------------------------------
// 		POPULATE THE SOLAR SYSTEM
// -----------------------------------------------------------------------------

// Add a Sun to the solar system
const sun = solarSystem.append('circle')
	.attr('id','sun')
	.attr('r',solarSystemParams['rSun'])
	.style('fill','orange')
	;

// Add the orbit of the earth to the solar system
const orbit = solarSystem.append('circle')
	.attr('id','orbit')
	.attr('r',solarSystemParams['rOrbit'])
	.style('fill','none')
	.style('border-radius','50%')
	.style('stroke','black')
	.style("stroke-dasharray", ("3, 3"))
	;

// Add the earth to the solar system
const earth = solarSystem.append('circle')
	.attr('id','earth')
	.attr('r',solarSystemParams['rEarth'])
	.style('fill','blue')
	.attr('transform',`translate(0,${-solarSystemParams['rOrbit']})`)
	;

// -----------------------------------------------------------------------------
// 		MAKE EARTH INTERACTIVE
// -----------------------------------------------------------------------------

// Instantiate a drag module
const earthDrag = d3.drag()
	.on('drag',handleEarthDrag)
	;
// A function to be called on the dragging of earth
function handleEarthDrag(e) {
	// Define the angle of earth from horizontal (in radians)
	let angle
	// Populate the angle variable
	if (e.x < 0) {
		angle = Math.atan(-e.y/e.x) + Math.PI
	} else if (e.y > 0) {
		angle = Math.atan(-e.y/e.x) + 2*Math.PI
	} else {
		angle = Math.atan(-e.y/e.x)
	}
	// Save the angle and update earth
	solarSystemParams['earthAngle'] = angle
	updateEarth();
	updateFgPanelStars();
}

// A funciton to specify how earth moves while being dragged
function updateEarth() {
	let angle = solarSystemParams['earthAngle']
	earth.attr('cx',solarSystemParams['rOrbit']*Math.cos(angle))
	earth.attr('cy',-solarSystemParams['rOrbit']*Math.sin(angle)+solarSystemParams['rOrbit'])
}

// A function to initialze the drag ability of earth
function initEarthDrag() {
	earth.call(earthDrag)
}

// -----------------------------------------------------------------------------
// 		SETUP THE STARS
// -----------------------------------------------------------------------------

//  Create a series of parameters to control the stars
const starParams = {
	'bkgCenter-x': 7*svg1Params['width']/8,
	'bkgCenter-y': svg1Params['height']/2,
	'fgCenter-x': svg1Params['width']/2,
	'fgCenter-y': svg1Params['height']/2,
	size: 20,
	panelSize: 50,
	bkgStars: [
		{i: 0, cy: -100},
		{i: 1, cy: -80},
		{i: 2, cy: -10},
		{i: 3, cy: 50},
		{i: 4, cy: 120}],
	fgStars: [
		{i: 0, cx: 100, cy: 10, color: 'red'},
		{i: 1, cx: -80, cy: -80, color: 'green'},
	]
};

// Add the stars to the svg element
const bkgStars = svg1.append('g')
	.attr('id','bkgStarGroup')
	.attr('class','stars')
	.attr('transform',`translate(${starParams['bkgCenter-x']},${starParams['bkgCenter-y']})`)
	;

// Instantiate a drag module
const bkgStarDrag = d3.drag()
	.on('drag',handleBkgStarDrag)
	;

// A function to be called on the dragging of a star
function handleBkgStarDrag(e) {
	if (e.y <= svg1Params['height']/2 - (starParams['size']*Math.cos(Math.PI/5))
		&& e.y >= -svg1Params['height']/2 + starParams['size']) {
		e.subject.cy = e.y
	}
	updateBkgStars();
	updateBkgPanelStars();
}

function updateBkgStars() {
	// Data join stars from bkgStarData
	d3.select('#bkgStarGroup')
		.selectAll('circle')
		.data(starParams['bkgStars'])
		.join('circle')
		.style('id','bkgStar')
		.style('fill','yellow')
		// Arrange the stars
		.attr('cy', (d,i) => {return d.cy})
		.call(bkgStarDrag)
		;
}

function setupStars(star,size) {
	// Style the stars
	star.style('class','star')
	.attr('r',size)
	// Crop circle to star shape
	.style('clip-path','polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)')
}

function initBkgStarDrag() {
	d3.select('#bkgStarGroup')
		.selectAll('circle')
		.call(bkgStarDrag)
}

// -----------------------------------------------------------------------------
// 		SETUP THE FOREGROUND STARS
// -----------------------------------------------------------------------------

// Add the stars to the svg element
const fgStars = svg1.append('g')
	.attr('id','fgStarGroup')
	.attr('class','stars')
	.attr('transform',`translate(${starParams['fgCenter-x']},${starParams['fgCenter-y']})`)
	;

// Instantiate a drag module
const fgStarDrag = d3.drag()
	.on('drag',handleFgStarDrag)
	;

// A function to be called on the dragging of a star
function handleFgStarDrag(e) {
	// Set vertical dragging limits
	if (e.y <= svg1Params['height']/2 - (starParams['size']*Math.cos(Math.PI/5))
		&& e.y >= -svg1Params['height']/2 + starParams['size']) {
		e.subject.cy = e.y
	}
	// Set horizontal
	if (e.x <= 3*svg1Params['width']/8
		&& e.x >= -2*svg1Params['width']/8) {
		e.subject.cx = e.x
	}
	// Update stars
	updateFgStars();
	updateFgPanelStars();
}

function updateFgStars() {
	// Data join stars from bkgStarData
	d3.select('#fgStarGroup')
		.selectAll('circle')
		.data(starParams['fgStars'])
		.join('circle')
		.style('id','fgStar')
		// Arrange the stars
		.attr('cx', (d,i) => {return d.cx})
		.attr('cy', (d,i) => {return d.cy})
		.style('fill', (d,i) => {return d.color})
		.call(fgStarDrag)
		;
}

function initFgStarDrag() {
	d3.select('#fgStarGroup')
		.selectAll('circle')
		.call(fgStarDrag)
}

// -----------------------------------------------------------------------------
// 		SETUP THE VIEWING PANEL
// -----------------------------------------------------------------------------

// Declare the svg1 dimensions
const svg2Params = {
	width: svg1Params.width,
	height: 200
};

// Create the svg holder for the main solarSystem elements
const svg2 = d3.create('svg')
	.attr('id','viewingPanel')
	.attr('width',svg2Params['width'])
	.attr('height',svg2Params['height'])
	// Center and outline the svg element
	.style('margin', '0 auto')
	.style("display", "block")
	.style('outline', 'thick solid #2176FF')
	.style('background','#33A1FD')
	;

// Append the title and the svg element to the DOM
container.append(svg2.node());

// -----------------------------------------------------------------------------
// 		SETUP THE BACKGROUND PANEL STARS
// -----------------------------------------------------------------------------

const bkgStarsPanel = svg2.append('g')
	.attr('id','panelBkgStars')
	.attr('transform',`translate(${svg2Params.width/2},${svg2Params.height/2})`)
		// + starParams.panelSize * (1-Math.cos(Math.PI/5))/2 })`)
	;

function updateBkgPanelStars() {
	// Data join stars from bkgStarData
	d3.select('#panelBkgStars')
		.selectAll('circle')
		.data(starParams['bkgStars'])
		.join('circle')
		.style('id','panelBkgStar')
		// Arrange the stars
		.attr('cx', (d,i) => {return 3*d.cy})
		.style('fill', 'yellow')
		;
}

// -----------------------------------------------------------------------------
// 		SETUP THE FOREGROUND PANEL STARS
// -----------------------------------------------------------------------------

const fgStarsPanel = svg2.append('g')
	.attr('id','panelFgStars')
	.attr('transform',`translate(${svg2Params.width/2},${svg2Params.height/2 })`)
		// + starParams.panelSize * (1-Math.cos(Math.PI/5))/2 })`)
	;

function updateFgPanelStars() {
	// Data join stars from fgStarData
	d3.select('#panelFgStars')
		.selectAll('circle')
		.data(starParams.fgStars)
		.join('circle')
		.style('id','panelFgStar')
		// Arrange the stars
		.attr('cx', (d,i) => {
			// Calculate the position of earth
			let ex = solarSystemParams.rOrbit * Math.cos(solarSystemParams.earthAngle)
			let ey = solarSystemParams.rOrbit * Math.sin(solarSystemParams.earthAngle)
			// Calculate teh slope from the earth to the selected star
			let m = - (ey + d.cy) / ((d.cx + 3*svg1Params.width/8 - ex))
			let y = m * (3*svg1Params.width/4-ex) + ey
			return 3*y
		})
		.style('fill', (d,i) => {return d.color})
		;
}

// -----------------------------------------------------------------------------
// 		ACTIVATE DRAGGING ABILITIES
// -----------------------------------------------------------------------------

// Let earth be drag friendly
initEarthDrag()

// Create background stars
updateBkgStars();
// Setup background stars
setupStars(d3.select('#bkgStarGroup').selectAll('circle'),starParams['size'])
// Initialize background star dragging
initBkgStarDrag();

// Create foreground stars
updateFgStars();
// Setup foreground stars
setupStars(d3.select('#fgStarGroup').selectAll('circle'),starParams['size'])
// Initialize foreground star dragging
initFgStarDrag();

// Create panel background stars
updateBkgPanelStars();
// Setup background panel stars
setupStars(d3.select('#panelBkgStars').selectAll('circle'),starParams.panelSize)

// Create panel foreground stars
updateFgPanelStars();
// Setup background panel stars
setupStars(d3.select('#panelFgStars').selectAll('circle'),starParams.panelSize)

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 		ANIMATION
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

// Animation function
function animate({timing, draw, duration}) {

	// Request the start time
	let start = performance.now();

	// Request a single frame of animation from the window at the current time
	requestAnimationFrame(function animate(time) {

		// Define timeFraction such that it ranges from 0 to 1
		let timeFraction = (time - start) / duration;
		// If timeFraction surpasses 1, reset it to 1
		if (timeFraction > 1) timeFraction = 1;
		// classalculate the current animation state
		let progress = timing(timeFraction)
		// Draw the current state
		draw(progress);
		// As long as timeFraction is less than 1, continue the animation
		if (timeFraction < 1) {
			// Continue the animation
			requestAnimationFrame(animate);
		}
	})
};

// Setup an animation
const rotateEarth = {
	// Timing function, i.e. how fast should time increase
	timing(timeFraction) {return timeFraction},
	// What happens at each frame
	draw(progress) {
		solarSystemParams['earthAngle'] = (progress * 2 * Math.PI)
		updateEarth();
		updateFgPanelStars();
		console.log(solarSystemParams['earthAngle'])
	},
	// Duration of the animation (in milliseconds)
	duration: 2000
};

// -----------------------------------------------------------------------------
// 		CREATE ANIMATION CONTROLS
// -----------------------------------------------------------------------------

const controls = document.createElement('DIV')
controls.id = 'controls'
const earthButton = document.createElement("BUTTON");
earthButton.id = 'earthButton'
controls.appendChild(earthButton)

document.body.append(controls);

earthButton.addEventListener('click',() => {
	animate(rotateEarth);
	earthButton.addEventListener('click',animate(rotateEarth))
})

d3.select('#controls')
	.style('text-align','center')
	.style('margin','20px auto')
	;


d3.select('#earthButton')
	.text('Rotate!')
