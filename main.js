var can; //variable for storing the canvas
var canvas
var myvec = new vec();
var body = new world();
var builder = new welder();//creator
var collider = new Collide();
var barn = new Store();
var mouseX=0;
var mouseY=0;
var selection = document.getElementById("default");//pointer to button that has been selected
var testpoly = [[0+200,0+10],[20+200,0+10],[20+200,20+10],[0+200,20+10]];

function setup() {
	canvas = document.getElementById('game');
	playing=true;
	if(canvas.getContext){
		can = canvas.getContext('2d');
		//calculate variables
		startx=canvas.offsetLeft;
		starty=canvas.offsetTop;
		width=canvas.width;
		height=canvas.height;
	}
	else{
		alert("Your browser doesn't support canvas consider changing your browser")
	}
	//add mouse up event listerner in canvas
	tests();
	//setup canvas dimensions
	resize();
	canvas.width = document.getElementById('main').offsetWidth -2;
	canvas.height = document.getElementById('main').offsetHeight-2;
	init();
	//removediv("shadowdiv");
	//adjust the canvas to the sive of the window
	window.onresize = function(event){
		resize();
		canvas.width = document.getElementById('main').offsetWidth - 2;
		canvas.height = document.getElementById('main').offsetHeight - 2;
	};
	canvas.addEventListener('mouseup', function(event){
		dragging = false;
		body.mouseup(0,0);
	},false);
	//update the mouse position everytime it is moved
	canvas.addEventListener('mousemove', function(event){
		var x=event.pageX - canvas.offsetLeft;
		var y=event.pageY - canvas.offsetTop;
		body.mousemove(x,y);
	},false);
	//adding an event listener to our canvas
	canvas.addEventListener('mousedown', function(event) {
        var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;
		body.mousedown(x,y);
		//Todo: Drag and drop object
	}, false);
	//Test listeners
	canvas.addEventListener("contextmenu",function(event){
		event.preventDefault();
		var menu = document.getElementById("backSelect");
		if(body.pointers.length>0){
			menu = document.getElementById("shapeSelect");
		}
		showdiv(menu,event);
	},false);
	window.addEventListener("click",function(event){
		hidediv(document.getElementById("backSelect"));
		hidediv(document.getElementById("shapeSelect"));
		
	},false);
	//prevent spacebar from acrivation button
	document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
        this.blur();
    })
	});
	setInterval(gameloop, 60);
}
function resize(){
	var mi = document.getElementById("middle");
	var b1 = document.getElementById("leftbar");
	var b2 = document.getElementById("rightbar");
	var w = mi.offsetWidth-b1.offsetWidth - b2.offsetWidth;
	w = ""+w+"px";
	document.getElementById("main").style.width = w;
	
	
}
function showdiv(menu,event){
	var x = event.pageX;
	var y = event.pageY;
	menu.style.display = "block";
	if(y>(canvas.height/1.5)){
		y-=menu.clientHeight;
	}
	else{
		var m = 3;
		x+=m;
		y+=m;
	}
	menu.style.left = x+"px";
	menu.style.top = y+"px";
}
function hidediv(menu){
	menu.style.display = "";
	menu.style.left = "";
	menu.style.top = "";
}
//function similar functions to
function adddiv(dm){
	var d = document.getElementById(dm);
	d.style.display = "block";
}
function removediv(dm){
	var d = document.getElementById(dm);
	d.style.display = "none";
}
function tests(){
	var p1 = new point(0,0);
	var p2 = new point(10,0);
	var p3 = new point(5,5);
	var l1 = new line(p1,p3);
	var l2 = new line(p2,p3);
	//console.log(p1.connections.length);
	var ans = l1.closestpoint(new point(-1,1));
	//console.log(myvec.add(ans,[0,0]));
	//console.logkeshape(p3.getvec(new point(0,0),new point(1,1)));
	//console.log(p3.getcenter());
	//var sh = body.getrect([200,200]);
	//builder.makeshape(sh.realpoints());
	/*
	var v = [-50,50];
	var sh1 = body.retrect([150,200]);
	var sh2 = body.retrect([150+v[0],200+v[1]]);
	body.bound(sh1);
	body.bound(sh2);
	body.bound(builder.add(sh1,sh2));
	*/
}
function gameloop(){
	clearScreen();
	update();
	body.draw();
}
function update(){
	
	
}
function clearScreen(){
	can.clearRect(0,0,canvas.width,canvas.height);
}
//make transparent
function transparent(){
	
}
//fill shape with a color
function fill(param){
	can.fillStyle="blue";
	if(this.colliding){
		can.fillStyle="green";
	}
	can.beginPath();
	can.moveTo(param[0][0],param[0][1]);
	for(var i=0;i<param.length;i++){
		can.lineTo(param[i][0],param[i][1]);
	}
	can.fill();
}
//dropdown function
function dropdown(dm) {
    document.getElementById(dm).classList.toggle("show");
}
//init button attributes 
function init(){
	/*
	setInterval(function () {
		document.getElementById("zoomout").click();
		document.getElementById("zoomin").click();
		}, 1000);
	*/
	//barn.saveshape();//set up
	selection = document.getElementById("default");
	var fontlist = ['Arial','Arial Black','monospace', 'sans-serif', 'serif',
	'Helvetica', 'Time New Roman','Times', 'Courier','Courier New',
	'Verdana','Georgia','Palatino','Garamond','Bookman','Comic Sans MS',
	'Trebuchet MS','Impact'];
	var fbtn = document.getElementById("fontbtn");
	for(var i=0;i<fontlist.length;i++){
		dropadd("fontdown",fontlist[i],fbtn);
		
	}
	/*
	var slist = ["Italic","Normal","Bold", "Bold Italic" ];
	var sbtn = document.getElementById("stylebtn");
	for(var i=0;i<slist.length;i++){
		dropadd("styledown",slist[i],sbtn);
	}
	*/
	//add event listeners
	var dlist = ["x","y","width","height","rotation"];
	for(var i=0;i<dlist.length;i++){
		var dim = document.getElementById(dlist[i]);
		dim.addEventListener('input', function(){
			body.setdims();
		}, false);
	}
	var shl = ["offx","offy","blur"];
	for(var i=0;i<shl.length;i++){
		var dim = document.getElementById(shl[i]);
		dim.addEventListener('input', function(){
			body.setshadow();
		}, false);
	}
	//Extra stuff
	var br = document.getElementById("radius");
	var so = document.getElementById("radiusshow");
	br.addEventListener('input', function(){
		var v = br.value;
		body.setradius(v);
		v = ""+v+"px";
		so.value = v;
		
	}, false);
	//join
	var nj = ["fontsize","fontshow","op","opshow","radius","radiusshow",
				"op2","opshow2","size","sizeshow"];
	for(var i=0;i<nj.length;i+=2){
		joinins(nj[i],nj[i+1]);
		
	}
	//px
	var px = ["fontshow","radiusshow","sizeshow","width","height",
				"x","y","offy","offx","blur","spread"];
	for(var i=0;i<px.length;i++){
		addpixel(px[i]);
	}
	//percent
	var per = ["opshow","opshow2"];
	for(var i=0;i<per.length;i++){
		addpercent(per[i]);
	}
}
function addpixel(i){
	var In = document.getElementById(i);
	In.addEventListener('focusout', function(){
		var v = In.value;
		v = parseFloat(v);
		v= ""+v+"px";
		In.value = v;
	}, false);
	
}
function addpercent(i){
	var In = document.getElementById(i);
	In.addEventListener('focusout', function(){
		var v = In.value;
		v = parseFloat(v);
		v= ""+v+"%";
		In.value = v;
	}, false);
	
}
function joinins(i,j){
	var In = document.getElementById(i);
	var Out = document.getElementById(j);
	Out.addEventListener('input', function(){
		var v = Out.value;
		v = parseFloat(v);
		In.value = v;
		setall();
	}, false);
}
function dropadd(di,ch,bt){
	var nd = document.getElementById(di);
	var nc = document.createElement('a');
	nc.innerHTML = ch;
	nd.appendChild(nc);
	//add event listers
	nc.addEventListener("click", function(){
		updatebox(ch,bt);
		updatetext();
	}, false);
}
function updatebox(child,el){
	var tex = child;
	var car = document.createElement('i');
	car.className = "fa fa-caret-down";
	//var el = document.getElementById("fontbtn");
	el.innerHTML = tex;
	el.innerHTML+=" ";
	el.appendChild(car);
}
function Select(id){
	var d = document.getElementById(id);
	if(selection!=null){
		selection.classList.remove("selected");
	}
	d.classList.add("selected");
	selection = d;
}
function fontdrop(){
	dropdown("fontdown");
}
function styledrop(){
	dropdown("styledown");
}
function settingdrop(){
	//dropdown("setting");
	var el = document.getElementById("setting");
	var st = el.style.display;
	if(st == "block"){
		el.style.display = "none";
	}
	else{
		el.style.display = "block";
	}
}
// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
	if(!document.getElementById("settingdiv").contains(event.target)){
		document.getElementById("setting").style.display = "none";
	}
	if(!event.target.matches('.dbox')) {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
			openDropdown.classList.remove('show');
			}
		}
	}
	//action clicking
	if(body.action!=null){
		body.action.search(event);
	}
}
//function
function mirrow(){
	barn.saveshape();
	clearactions();
	adddiv("mirrowdiv");
	removediv("properties");
	if(body.action!=null){
		body.action.clear();
		body.action = null;
	}
	//add mirrow
	body.action = new amirrow();
	body.action.init();
	
}
function path(){
	barn.saveshape();
	clearactions();
	adddiv("pathdiv");
	removediv("properties");
	//add path
	body.action = new apattern();
	body.action.init();
}
function revolve(){
	barn.saveshape();
	clearactions();
	adddiv("revolvediv");
	removediv("properties");
	//add revolve
	body.action = new arevolve();
	body.action.init();
}
function apply(){
	if(body.action!=null){
		var ns = body.action.calculate();
		//body.action.mergeall(ns);
	}
	showproperties();
}
function cancel(){
	if(body.action!=null){
		body.action.deleteall();
	}
	showproperties();
}
function showproperties(){
	adddiv("properties");
	removediv("mirrowdiv");
	removediv("pathdiv");
	removediv("revolvediv");
	if(body.action!=null){
		body.action.clear();
		body.action = null;
	}
}
function preview(){
	if(body.action!=null){
		body.action.preview();
	}
}
function clearactions(){
	if(body.action!=null){
		body.action.deleteall();
	}
	removediv("mirrowdiv");
	removediv("pathdiv");
	removediv("revolvediv");
}
//function for selecting tools
function pencil(){
	body.unselect();
	body.tooltype="pencil";
	Select("pen");
}
function pen(){
	body.unselect();
	body.tooltype="pen";
	Select("pencil");
}
function bezier(){
	body.tooltype="bezier";
	body.unselect("bezier");
	Select("bezier");
}
function pan(){
	body.tooltype="pan";
	Select("pan");
}
function Default(){
	body.tooltype="default";
	Select("default");
}
function subselect(){
	body.tooltype="subselect";
	Select("subselect");
}
function square(){
	body.getPolygon([canvas.width/2,canvas.height/2]);
}
function picker(){
	Select("picker");
}
function veccircle(){
	body.makecircle([canvas.width/2,canvas.height/2]);
}
function star(){
	body.makestar([canvas.width/2,canvas.height/2]);
}
function circle(){
	//body.getCurve([canvas.width/2,canvas.height/2]);
	body.getellipse([canvas.width/2,canvas.height/2]);
}
function combine(){
	body.combine();
}
function subtract(){
	body.subtract();
}
function intersect(){
	body.intersect();
}
function gettext(){
	body.gettext([canvas.width/2,canvas.height/2]);
}
function getimage(){
	body.getimage([canvas.width/2,canvas.height/2]);
}
function setcolor(){
	var v = document.getElementById("fc").value;
	document.getElementById("fcshow").value = v;
	body.setcolor();
}
function setopacity(){
	var v = document.getElementById("op").value;
	v = ""+v+"%";
	document.getElementById("opshow").value = v;
	body.setopacity();
}
function setcolor2(){
	var v = document.getElementById("fc2").value;
	document.getElementById("fcshow2").value = v;
	body.setcolor();
}
function setopacity2(){
	var v = document.getElementById("op2").value;
	v = ""+v+"%";
	document.getElementById("opshow2").value = v;
	body.setopacity();
}
function setsize(){
	var v = document.getElementById("size").value;
	v = ""+v+"px";
	document.getElementById("sizeshow").value = v;
	body.setopacity();
}
function setfontsize(){
	var v = document.getElementById("fontsize").value;
	if(body.mytext!=null){
		body.mytext.size = v;
		body.mytext.adjust();
	}
	v = ""+v+"px";
	document.getElementById("fontshow").value = v;
}
function setall(){
	body.setopacity();
	var br = document.getElementById("radius");
	var v = br.value;
	body.setradius(v);
}
function upalltext(){
	var v = document.getElementById("size").value;
	v = ""+v+"px";
	document.getElementById("sizeshow").value = v;
	var v = document.getElementById("op2").value;
	v = ""+v+"%";
	document.getElementById("opshow2").value = v;
	var v = document.getElementById("fc2").value;
	document.getElementById("fcshow2").value = v;
	var v = document.getElementById("fc").value;
	document.getElementById("fcshow").value = v;
	var v = document.getElementById("op").value;
	v = ""+v+"%";
	document.getElementById("opshow").value = v;
	var v = document.getElementById("radius").value;
	v = ""+v+"px";
	document.getElementById("radiusshow").value = v;
}
function extract(t){
	var ans="";
	var i=0;
	while(i<t.length && t.charAt(i)!="<"){
		ans+= t.charAt(i);
		i++;
	}
	return ans;
}
//update the text with the current font style
function updatetext(){
	if(body.mytext!=null){
		barn.saveshape();
		var f = document.getElementById("fontbtn").innerText;
		body.mytext.font = extract(f);
	}
}
function togglegrid(){
	body.gridon = !body.gridon;
}
//update and manipulate the dimensions of the contains
function updatedims(x,y,w,h,r){
	document.getElementById("x").innerText = x;
	document.getElementById("y").innerText = y;
	document.getElementById("rotation").innerText = r;
	document.getElementById("width").innerText = w;
	document.getElementById("height").innerText = h;
}
function setdims(){
	body.setdims();
}

function upload(){
	//Code for uploading images
	var fin = document.getElementById('upload');
	if(fin.files.length>0){
		var pa = URL.createObjectURL(fin.files[0]);
		body.upload([canvas.width/2,canvas.height/2],pa);
	}
	
}
function scaleup(){
	body.upscale(1);
}
function scaledown(){
	body.upscale(-1);
}
//clicking functions
function Delete(){
	body.Delete();
}
function DeleteAll(){
	body.unselect();
	body.shapes = [];
}
function Duplicate(){
	body.Duplicate();
}
function Copy(){
	body.Copy();
}
function Paste(){
	body.Paste();
}
function Cut(){
	body.Cut();
}
function SendBackward(){
	body.sendbackward();
}
function SendForward(){
	body.sendforward();
}
function SendBack(){
	body.sendback();
}
function SendFront(){
	body.sendfront();
}
function SelectAll(){
	body.selectall();
}
function CopyAll(){
	body.copyall();
}
function CutAll(){
	body.cutall();
}
function Group(){
	body.makegroup();
}
function UnGroup(){
	body.makeungroup();
}
function Lock(){
	body.lock();
}
function Unlockall(){
	body.unlockall();
}
function Download(){
	save(false);
}
function Undo(){
	barn.undo();
}
function Redo(){
	barn.redo();
}
function save(All = true){
	//Zoom to image
	var edges = body.getedges(All);
	var start = edges[0];
	var end = edges[1];
	var width = canvas.width;
	var height = canvas.height;
	var filler = body.drawfillers;
	var gon = body.gridon;
	var scale = body.scale;
	body.gridon = false;
	body.drawfillers = false;
	body.unselect();
	body.scale = 1;
	canvas.width = (end[0]-start[0]);
	canvas.height = (end[1]-start[1]);
	can.translate(-start[0],-start[1]);
	//draw shapes
	clearScreen();
	body.draw(start[0],start[1]);
	//download image
	var img = new Image();
	//determine the cut type
	var imgtype = "image/png";
	if(body.idchecked("savejpg")){
		console.log("jpg");
		var imgtype = "image/jpeg";
	}
	//end
	img.src = canvas.toDataURL(imgtype);
	
	var a = document.createElement('a');
	a.name = "download";
	a.href = img.src;
	a.download = img.src;
	a.setAttribute('download',"download");
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	//reset
	can.translate(start[0],start[1]);
	body.gridon = gon;
	body.scale = scale;
	body.drawfillers = filler;
	canvas.width = width;
	canvas.height = height;
}