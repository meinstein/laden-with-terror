var element = document.getElementById("container");

function loop(){

	for (var i = 0; i < data.headlines.length; i++){

		var para = document.createElement("p");
		para.innerHTML = data.headlines[i];
		// var node = document.createTextNode("paragraph");
		// para.appendChild(node);
		element.appendChild(para);

	}

}

loop();