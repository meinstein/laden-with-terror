var counterDiv = document.getElementById('counter');


function setup() {

	var width = windowWidth;
	var height = windowHeight;

	var fontSize = (( width / height ) * 5 );
	textAlign(CENTER, CENTER);

  createCanvas(windowWidth, windowHeight);
  textSize(fontSize);

  // drawAll();

}

function draw() {




} // end draw

function drawAll() {

	var theta = 0;
	var counter = 0;
	background(255);

	setInterval(function(){

  		counterDiv.innerHTML = counter;
	    
		push()

			translate(width/2, height/2);
			rotate(radians(theta));
			s = data.headlines[counter];
			fill(50,127);
			text(s, 0, 0); // Text wraps within text box

			fill(0);

		pop()

		theta = theta + 0.05373;

		counter = counter + 1;

	}, 30);

}

function drawPart() {

	var theta = 0;
	var counter = 0;
	background(255);

	setInterval(function(){

  		counterDiv.innerHTML = counter;
	    
		push()

			translate(width/2, height/2);
			rotate(radians(theta));
			s = data.headlines[counter];
			fill(50,127);
			text(s, 0, 0); // Text wraps within text box

			fill(0);

		pop()

		theta = theta + 1;

		counter = counter + 1;

	}, 30);
	
}