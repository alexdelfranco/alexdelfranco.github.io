import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the svg dimensions
const svgParams = {
	svg1: {
		width: 900,
		height: 300,
		'y-margin': 30
	}
};

// Create a series of parameters to control the Solar System
const solarSystemParams = {
	'center-x': svgParams.svg1.width/8,
	'center-y': svgParams.svg1.height/2,
	sun: {
		radius: 20
	},
	earth: {
		radius: 6,
		angle: Math.PI/2
	},
	orbit: {
		radius: 80
	}
};

//  Create a series of parameters to control the stars
const starParams = {
	'bkgCenter-x': svgParams.svg1.width * (30/32),
	'bkgCenter-y': svgParams.svg1.height / 2,
	'fgCenter-x': svgParams.svg1.width / 2,
	'fgCenter-y': svgParams.svg1.height / 2,
	size: 18,
	panelSize: 50,
	bkgStars: [
		// Index, yCenter
		{i: 0, cy: -100},
		{i: 1, cy: -80},
		{i: 2, cy: -10},
		{i: 3, cy: 50},
		{i: 4, cy: 120}],
	fgStars: [
		// Index, xCenter, yCenter, color
		{i: 0, cx: 100, cy: 10, color: 'red'},
		{i: 1, cx: -80, cy: -80, color: 'green'},
	]
};

const buttonParams = {
	rotation: {
		// Is the object currently rotating
		active: false,
		// In milliseconds
		duration: 2000,
		// Animation ID
		globalID: '',
		// Initial earth angle
		initAngle: 0
	},
	xaxis: {
		// Visible
		visible: false
	}
}

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

// Create the svg holder for the main solarSystem elements
const svg1 = d3.create('svg')
	.attr('id','localBubble')
	.attr('width',svgParams.svg1.width)
	.attr('height',svgParams.svg1.height)
	// Center ]and outline the svg element
	.style('margin', `${svgParams.svg1['y-margin']} auto`)
	.style("display", "block")
	.style('outline', 'thick solid #2176FF')
	.style('background','#33A1FD')
	;

// -----------------------------------------------------------------------------
// 		SETUP THE SOLAR SYSTEM
// -----------------------------------------------------------------------------

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
	.attr('r',solarSystemParams.sun.radius)
	.style('fill','orange')
	;

// Add the orbit of the earth to the solar system
const orbit = solarSystem.append('circle')
	.attr('id','orbit')
	.attr('r',solarSystemParams.orbit.radius)
	.style('fill','none')
	.style('border-radius','50%')
	.style('stroke','black')
	.style("stroke-dasharray", ("3, 3"))
	;

// Add the earth to the solar system
const earth = solarSystem.append('circle')
	.attr('id','earth')
	.attr('r',solarSystemParams.earth.radius)
	.style('fill','blue')
	.attr('transform',`translate(0,${-solarSystemParams.orbit.radius})`)
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
	solarSystemParams.earth.angle = angle
	updateEarth();
	updateFgPanelStars();
}

// A funciton to specify how earth moves while being dragged
function updateEarth() {
	let angle = solarSystemParams.earth.angle
	earth.attr('cx',solarSystemParams.orbit.radius*Math.cos(angle))
	earth.attr('cy',-solarSystemParams.orbit.radius*Math.sin(angle)+solarSystemParams.orbit.radius)
}

// A function to initialze the drag ability of earth
function initEarthDrag() {
	earth.call(earthDrag)
}

// -----------------------------------------------------------------------------
// 		SETUP THE STARS
// -----------------------------------------------------------------------------

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
	if (e.y <= svgParams.svg1.height/2 - (starParams.size * Math.cos(Math.PI/5))
		&& e.y >= -svgParams.svg1.height/2 + starParams.size) {
		e.subject.cy = e.y
	}
	updateBkgStars();
	updateBkgPanelStars();
}

function updateBkgStars() {
	// Data join stars from bkgStarData
	d3.select('#bkgStarGroup')
		.selectAll('circle')
		.data(starParams.bkgStars)
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
	if (e.y <= svgParams.svg1.height/2 - (starParams.size * Math.cos(Math.PI/5))
		&& e.y >= -svgParams.svg1.height/2 + starParams.size) {
		e.subject.cy = e.y
	}
	// Set horizontal
	if (e.x <= 3*svgParams.svg1.width/8
		&& e.x >= -2*svgParams.svg1.width/8) {
		e.subject.cx = e.x
	}
	// Update stars
	updateFgStars();
	updateFgPanelStars();
}

// Updates the draggable foreground stars
function updateFgStars() {
	// Data join stars from fgStarData
	d3.select('#fgStarGroup')
		.selectAll('circle')
		.data(starParams.fgStars)
		.join('circle')
		.style('id','fgStar')
		// Arrange the stars
		.attr('cx', (d,i) => {return d.cx})
		.attr('cy', (d,i) => {return d.cy})
		.style('fill', (d,i) => {return d.color})
		.call(fgStarDrag)
		;
}

// Initializes the draggability of the foreground stars
function initFgStarDrag() {
	d3.select('#fgStarGroup')
		.selectAll('circle')
		.call(fgStarDrag)
}

// -----------------------------------------------------------------------------
// 		SETUP THE VIEWING PANEL
// -----------------------------------------------------------------------------

svgParams.svg2 = {
	width: svgParams.svg1.width,
	height: 150
}

// Create the svg holder for the main solarSystem elements
const svg2 = d3.create('svg')
	.attr('id','viewingPanel')
	.attr('width',svgParams.svg2.width)
	.attr('height',svgParams.svg2.height)
	// Center and outline the svg element
	.style('margin', '0 auto')
	.style("display", "block")
	.style('outline', 'thick solid #2176FF')
	.style('background','#33A1FD')
	;

// Append the title and the svg element to the DOM
container.append(svg2.node());

// -----------------------------------------------------------------------------
// 		PANEL AXES
// -----------------------------------------------------------------------------

// Create the xaxis scale
const xscale = d3.scaleLinear().domain([0, 60]).range([0, svgParams.svg1.width+2]);

// // Creat the xaxis
// const xAxisObject = d3.axisTop(xscale)
// 	.tickValues([5,10,15,20,25,30,35,40,45,50,55])

// Create the vertical axis lines
const xAxisLinesObject = d3.axisBottom(xscale)
	.tickValues([5,10,15,20,25,30,35,40,45,50,55])
	.tickSize(svgParams.svg2.height-13)

// Append the xaxis vertical lines
const xAxisLines = svg2.append('g')
	.call(xAxisLinesObject)
	.attr('id','xAxisLines')
	.attr('transform',`translate(-1,0)`)
	.style("stroke-dasharray", ("3, 3"))
	.style('visibility','hidden')

// -----------------------------------------------------------------------------
// 		SETUP THE BACKGROUND PANEL STARS
// -----------------------------------------------------------------------------

const bkgStarsPanel = svg2.append('g')
	.attr('id','panelBkgStars')
	.attr('transform',`translate(${svgParams.svg2.width/2},${svgParams.svg2.height/2})`)
		// + starParams.panelSize * (1-Math.cos(Math.PI/5))/2 })`)
	;

function updateBkgPanelStars() {
	// Data join stars from bkgStarData
	d3.select('#panelBkgStars')
		.selectAll('circle')
		.data(starParams.bkgStars)
		.join('circle')
		.style('id','panelBkgStar')
		// Arrange the stars
		.attr('cx', (d,i) => {return 3*d.cy})
		.style('fill', 'yellow')
}

// -----------------------------------------------------------------------------
// 		SETUP THE FOREGROUND PANEL STARS
// -----------------------------------------------------------------------------

const fgStarsPanel = svg2.append('g')
	.attr('id','panelFgStars')
	.attr('transform',`translate(${svgParams.svg2.width/2},${svgParams.svg2.height/2 })`)
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
			let ex = solarSystemParams.orbit.radius * Math.cos(solarSystemParams.earth.angle)
			let ey = solarSystemParams.orbit.radius * Math.sin(solarSystemParams.earth.angle)
			// Calculate the slope from the earth to the selected star
			let m = - (ey + d.cy) / ((d.cx + 3*svgParams.svg1.width/8 - ex))
			let y = m * (3*svgParams.svg1.width/4-ex) + ey
			return -3*y
		})
		.style('fill', (d,i) => {return d.color})
}

// -----------------------------------------------------------------------------
// 		ACTIVATE DRAGGING ABILITIES
// -----------------------------------------------------------------------------

// Let earth be drag friendly
initEarthDrag()

// Create background stars
updateBkgStars();
// Setup background stars
setupStars(d3.select('#bkgStarGroup').selectAll('circle'),starParams.size)
// Initialize background star dragging
initBkgStarDrag();

// Create foreground stars
updateFgStars();
// Setup foreground stars
setupStars(d3.select('#fgStarGroup').selectAll('circle'),starParams.size)
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

// General animation function
function animate({draw, duration}) {
	// Request the start time
	let start = performance.now();
	// Request a single frame of animation from the window at the current time
	buttonParams.rotation.globalID = requestAnimationFrame(function animate(time) {
		// Define timeFraction such that it ranges from 0 to 1
		let timeFraction = (time - start) / duration;
		// Draw the current state
		draw(timeFraction);
		// Request next animation frame
		buttonParams.rotation.globalID = requestAnimationFrame(animate);
	})
};

// Setup an animation
const rotateEarth = {
	// What happens at each frame
	draw(progress) {
		if (!buttonParams.rotation.rotating) {
			buttonParams.rotation.initAngle = solarSystemParams.earth.angle
			buttonParams.rotation.rotating = true
		}
		solarSystemParams.earth.angle = (progress * 2 * Math.PI) + buttonParams.rotation.initAngle
		updateEarth();
		updateFgPanelStars()},
	// Duration of the animation (in milliseconds)
	duration: buttonParams.rotation.duration,
};

// -----------------------------------------------------------------------------
// 		CREATE GENERAL ANIMATION CONTROLS
// -----------------------------------------------------------------------------

// Create new div and give it an id
const controls = document.createElement('DIV')
controls.id = 'controls'

function setupControls() {
	// Edit properties of controls
	d3.select('#controls')
		.style('text-align','center')
		.style('margin','20px auto')
		;
}

function formatButton(d3Object,color) {
	d3Object.style('background-color',color)
		.style('border','none')
		.style('color','white')
		.style('padding','15px 32px')
		.style('text-align','center')
		.style('text-decoration','none')
		.style('display','inline-block')
		.style('font-size','16px')
		.style('margin','4px')
}

// Append the controls panel to the body
document.body.append(controls);

// -----------------------------------------------------------------------------
// 		CREATE EARTH BUTTON
// -----------------------------------------------------------------------------

// Create the rotation button and give it an id
const earthButton = document.createElement("BUTTON");
earthButton.id = 'earthButton'
// Append the earth button to the controls panel
controls.appendChild(earthButton)

// Edit properties of earth button
d3.select('#earthButton')
	.text('Rotate!')

// Setup earth button
earthButton.onclick = () => {
	// If currently rotating
	if (buttonParams.rotation.rotating) {
		cancelAnimationFrame(buttonParams.rotation.globalID)
		buttonParams.rotation.rotating = false
		// Edit properties of earth button
		d3.select('#earthButton').text('Rotate!')
	// If not currently rotating
	} else {
		animate(rotateEarth)
		// Edit properties of earth button
		d3.select('#earthButton').text('Stop Rotating!')
	}
}

// -----------------------------------------------------------------------------
// 		CREATE AXIS BUTTON
// -----------------------------------------------------------------------------

// Create the rotation button and give it an id
const xAxisButton = document.createElement("BUTTON");
xAxisButton.id = 'xAxisButton'
// Append the earth button to the controls panel
controls.appendChild(xAxisButton)

// Edit properties of earth button
d3.select('#xAxisButton')
	.text('Show x-Axis')

// Setup earth button
xAxisButton.onclick = () => {
	// If currently visible
	if (buttonParams.xaxis.visible) {
		buttonParams.xaxis.visible = false
		// Edit properties of earth button
		d3.select('#xAxisButton').text('Show x-Axis')
		d3.select('#xAxisLines').style('visibility','hidden')
	// If not currently visible
	} else {
		buttonParams.xaxis.visible = true
		// Edit properties of earth button
		d3.select('#xAxisButton').text('Hide x-Axis')
		d3.select('#xAxisLines').style('visibility','visible')
	}
}

// -----------------------------------------------------------------------------
// 		SETUP CONTROLS
// -----------------------------------------------------------------------------

// Format buttons
formatButton(d3.select('#xAxisButton'),'#4CAF50')
formatButton(d3.select('#earthButton'),'red')

// Setup the control panel
setupControls()
