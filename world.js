function world(){
	//variables
	this.lines = [];
	this.fills = [];
	this.shapes = [];
	this.points = [];
	this.pointers = [];// list storing all shapes that have been collided with
	this.oldgroup = [];
	this.copies = []; //list of shapes that have been copied
	this.copypos = [0,0];
	var myvec = new vec();
	this.dragging = false;
	this.pressing = false;
	this.mousepos = [0,0];
	this.temp = [];// array to temporary store lines and curves
	this.templines = [];
	this.temppos = null;
	this.tempshape = null;
	this.showonce = []; // array to show an element once
	this.constraint = [];
	this.drawfillers = true;
	this.penlength = 5;
	this.mytext = null;
	this.srot = null;
	this.capon = false;
	this.ctron = false;
	this.ctrl = false;
	this.container = null;// variable for grouping multiple shapes
	this.action = null;
	this.futureshapes = [];
	//grid variables
	this.gridon = false;
	this.gridsize = 40;//px
	this.pos = [0,0];
	this.minscale = 0.1;
	this.maxscale = 5;
	this.scalevel = 0.1;
	this.scale = 1;
	this.cursorimage = null;
	//drawing variables
	this.mousetype = "default";
	this.tooltype = "default";
	//store
	this.storeshape = null;
	this.storepos = null;
	this.storetext = null;
	
	this.getsquare = function(x,y,width=50){
		this.getPolygon([x,y],width,4);
	}
	//clicking function
	this.mouseup = function(x,y){
		this.dragging = false;
		this.pressing = false;
		this.showonce = [];
		this.srot = null;
		if(this.container!=null){
			this.collideselect();
			this.container = null;
		}
		if(this.tooltype=="pen"){
			this.enddraw();
		}
	}
	this.mousemove = function(x,y){
		//scale
		var mp = this.toworld([x,y]);
		x= mp[0];
		y= mp[1];
		//end
		this.showonce = [];
		//adjust
		if(this.gridon && this.idchecked("snapping") && canvas.style.cursor != "grab" 
		   && canvas.style.cursor != "grabbing" ){
			var np = this.gridcollide([x,y]);
			if(np[0]!=null){
				x = np[0];
			}
			if(np[1]!=null){
				y = np[1];
			}
		}
		this.updims();
		if(this.dragging){
			if(this.checkbezier([x,y])){
				return null;
			}
			this.drag(this.mousepos,[x,y]);
			if(this.action!=null){
				this.action.preview();
			}
		}
		else{
			this.hover(x,y);
		}
		//update the position of temporary point
		if(this.temppos!=null){
			//this.temppos.update(x,y);
			var mvec = myvec.subtract([x,y],this.temppos.getpoint());
			this.temppos.move(mvec[0],mvec[1]);
			if(this.tooltype!="pen"){
				var ch = this.tempadjust();
				/*
				if(!ch){
					this.showonce = [];
				}
				*/
			}
		}
		if(this.container!=null){
			if(this.tooltype=="pan"){
				var diff = myvec.subtract([x,y],this.mousepos);
				diff = myvec.mult(diff,-1);
				this.pos = myvec.add(this.pos,diff);
			}
			else{
				var ep = this.container.points[2];
				var mvec = myvec.subtract([x,y],ep.getpoint());
				ep.move(mvec[0],mvec[1]);
			}
			
				
		}
		this.updims();
		this.mousepos = [x,y];
	}
	this.mousedown = function(x,y){
		//scale
		var mp = this.toworld([x,y]);
		x= mp[0];
		y= mp[1];
		//end
		if(this.gridon && this.idchecked("snapping")){
			var np = this.gridcollide([x,y]);
			if(np[0]!=null){
				x = np[0];
			}
			if(np[1]!=null){
				y = np[1];
			}
		}
		this.dragging = true;
		this.pressing = true;
		//check if a collision has occurred
		this.srot = this.rotcollide([x,y]);
		this.updims();
		if(this.srot!=null){
			return null;
		}
		this.click(x,y);
		this.updims();
		if(this.mytext!=null){
			if(this.mytext.hit([x,y])){
				var no=1; // do nothing
			}
			else{
				barn.saveshape();
				this.mytext.clear();
				this.mytext = null;
			}
		}
	}
	this.checkbezier = function(mp){
		if(this.tooltype == "pencil" && this.tempshape != null){
			var li = this.tempshape.getlend();
			if(li!=null){
				var np = li.h1;
				var op = np.getpoint();
				var di = myvec.subtract(mp,op);
				np.rotatemove(di[0],di[1]);
				return true;
			}
		}
		false;
	}
	this.unhold = function(){
		if(this.tooltype == "pencil" && this.tempshape != null){
			var li = this.tempshape.getlend();
			if(li!=null){
				li.offb();
			}
			
		}
		else{
			for(var i=0;i<this.pointers.length;i++){
				var pl = this.pointers[i];
				if(pl.type == "point"){
					if(pl.origin!=false){
						pl.origin.hlock = !pl.origin.hlock;
					}
				}
			}
		}
	}
	this.getid = function(name){
		return document.getElementById(name);
	}
	this.idchecked = function(name){
		return this.getid(name).checked;
	}
	//adjust pos
	this.adjust = function(pos,pos1 = pos,points = this.temp){
		if(!this.idchecked("snapping")){
			return true; //return true when no snapping occured
		}
		var dist = 2;
		//var points = [];
		var p1 = pos.getpoint();
		var c1 = false;
		var c2 = false;
		if(this.gridon){
			var np = this.gridcollide(p1,false);
			var an = false;
			var dv = [0,0];
			if(np[0]!=null){
				dv[0] = np[0] - p1[0];
				this.drawhorizontal(np[0],true);
				an = true;
			}
			if(np[1]!=null){
				dv[1] = np[1] - p1[1];
				this.drawvertical(np[1],true);
				an = true;
			}
			pos1.rotatemove(dv[0],dv[1]);
			return an;
		}
		//points.push(...this.temp);
		for(var i=0;i<points.length;i++){
			if(pos!=points[i]){
				var p2 = points[i].getpoint();
				//vertical
				var dy = p1[1] -p2[1];
				if(Math.abs(dy)<=dist && !c1){
					pos1.rotatemove(0,-dy);
					this.infiniteline(pos.getpoint(),p2);
					c1 = true;
					if(c1 && c2){
						return true;
					}
				}
				//horizontal
				var dx = p1[0] -p2[0];
				if(Math.abs(dx)<=dist && !c2){
					pos1.rotatemove(-dx,0);
					this.infiniteline(pos.getpoint(),p2);
					c2 = true;
					if(c1 && c2){
						return true;
					}
				}
			}
		}
		return false;
	}
	this.adjustall = function(points,pos,other){
		for(var i=0;i<points.length;i++){
			if(this.adjust(points[i],pos,other)){
				return true;
			}
		}
		return false;
	}
	this.shapeadjust = function(sh){
		if(this.gridon){
			var first = sh.mypoints();
			if(this.adjustall(first,sh.myorigin(),[])){
				return true;
			}
			return false;
		}
		for(var i=0;i<this.shapes.length;i++){
			if(sh!=this.shapes[i]){
				var first = sh.mypoints();
				first.push(sh.myorigin());
				var last = this.shapes[i].mypoints();
				last.push(this.shapes[i].myorigin());
				if(this.adjustall(first,sh.myorigin(),last)){
					return true;
				}
			}
		}
		//this.showonce = [];
		return false;
	}
	this.tempadjust = function(){
		var npoints = [];
		var points = [];
		for(var i=0;i<this.shapes.length;i++){
			points.push(...this.shapes[i].mypoints());
			var ori = this.shapes[i].myorigin();
			if(ori!=this.temppos.origin){
				points.push(ori);
			}
		}
		return this.adjust(this.temppos,this.temppos,points);
	}
	this.infiniteline = function(p1,p2){
		
		var v = myvec.subtract(p2,p1);
		v = myvec.normalize(v,1000);
		var np2 = myvec.add(p2,v);
		var np1 = myvec.subtract(p1,v);
		var ans = new line(new point(np1[0],np1[1]),new point(np2[0],np2[1]));
		for(var i=0;i<this.showonce.length;i++){
			if(this.showonce[i].issame(ans)){
				return null;
			}
		}
		ans.isaxis = true;
		this.showonce.push(ans);
		return ans;
	}
	//this.templines.push(this.infiniteline([200,200],[200,205]));
	//collision functions
	this.collide = function(x,y){
		if(!this.shouldcollide()){
			return null;
		}
		for(var i=this.shapes.length-1;i>=0;i--){
			if(this.shapes[i].collide(x,y)){
				return this.shapes[i]
			}
		}
		return null;
	}
	this.pointcollide = function(x,y,points = this.points){
		if(!this.shouldcollide()){
			return null;
		}
		var me = true;
		if(this.tooltype == "subselect"){
			me = false;
		}
		for(var i=this.shapes.length-1;i>=0;i--){
			var p = this.shapes[i].pointcollide(x,y,me);
			if(p!=null){
				return p;
			}
		}
		return null;
	}
	this.linecollide = function(x,y){
		if(!this.shouldcollide()){
			return null;
		}
		for(var i=this.shapes.length-1;i>=0;i--){
			var l = this.shapes[i].linecollide(x,y);
			if(l!=null){
				return l;
			}
		}
		return null;
	}
	this.allcollide = function(x,y){
		if(!this.shouldcollide()){
			return null;
		}
		for(var i=this.shapes.length-1;i>=0;i--){
			var el = this.shapes[i].allcollide(x,y);
			if(el!=null){
				return el;
			}
		}
		return null;
	}
	//check if we should be colliding right now
	this.shouldcollide = function(){
		var tools = ["pen","pencil"];
		if(tools.includes(this.tooltype)){
			return false;
		}
		return true;
	}
	this.hitpoints = function(x,y,points = this.points){
		var r = 9;
		for(var i=0;i<points.length;i++){
			var cu = new curve(points[i].getpoint(),r,r);
			if(collider.pointcurvecollide(new point(x,y),cu)){
				return points[i];
			}
		}
		return null;
	}
	//check if you can continue drawing from an existing path
	this.getpath = function(x,y){
		for(var i=this.shapes.length-1;i>=0;i--){
			if(this.shapes[i].type =="container"){
				var kids = this.shapes[i].children;
				for(var j=0;j<kids.length;j++){
					var p = kids[j].pointcollide(x,y,true);
					if(p!=null){
						if(p.end){
							return [p,kids[j],this.shapes[i]];
						}
					}
				}
			}
		}
		return null;
	}
	// unselect all shapes that have been selected
	this.unselect = function(bo = true){
		var ans = false;
		var points = this.pointers;
		for(var i=0;i<points.length;i++){
			points[i].addcollide(false);
		}
		ans = this.ungroup(bo);
		if(bo){
			this.degroup();
		}
		this.pointers = [];
		return ans;
	}
	this.ungroup = function(bo=true){
		var ans = false;
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"
			&& this.pointers[i].isgroup()){
				if(bo){
					this.pointers[i].ungroup();
					this.deleteshape(this.pointers[i]);
					ans = true;
				}
				else{
					if(!this.oldgroup.includes(this.pointers[i])){
						this.oldgroup.push(this.pointers[i]);
					}
				}
			}
		}
		return ans;
	}
	this.degroup = function(){
		for(var i=0;i<this.oldgroup.length;i++){
			this.oldgroup[i].ungroup();
			this.deleteshape(this.oldgroup[i]);
		}
		this.oldgroup = [];
	}
	//check type
	this.checkselect = function(type){
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type!=type){
				return false;
			}
		}
		return true;
	}
	this.checkclear = function(){
		if(this.tooltype == "subselect"){
			return this.checkselect("point");
		}
		return this.checkselect("container");
	}
	//move all shapes
	this.moveall = function(dx,dy,p2=null){
		if(this.pointers.length>1){
			p2 = null;
		}
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				canvas.style.cursor = "grabbing";
			}
			if(p2!=null && this.pointers[i].type!="polygon"){
				this.pointers[i].moveto(p2);
			}
			else if(this.pointers[i].type!="polygon"){
				this.pointers[i].rotatemove(dx,dy);
			}
			if(this.pointers[i].type == "container" || this.pointers[i].type == "polygon"){
				this.shapeadjust(this.pointers[i]);
			}
			if(this.pointers[i].type == "point"){
				this.pointadjust(this.pointers[i]);
			}
			if(this.pointers[i].type == "line"){
				this.pointadjust(this.pointers[i].p1);
			}
		}
	}
	this.getallpoints = function(inside=[],except=[]){
		var points = [];
		var fpoints = [];
		for(var i=0;i<this.shapes.length;i++){
			if(!except.includes(this.shapes[i])){
			if(inside.includes(this.shapes[i])){
				fpoints.push(...this.shapes[i].mypoints(false));
				fpoints.push(this.shapes[i].pos);
			}
			else{
				points.push(...this.shapes[i].mypoints());
				points.push(this.shapes[i].pos);
			}
			}
		}
		points.unshift(...fpoints);
		return points;
	}
	this.pointadjust = function(p){
		var ins = [];
		var ex = [];
		if(p!=null){
			ins = [p.container];
					
		}
		if(p.myshape!=null && p.atborder){
			ex = [p.myshape];
		}
		this.adjust(p,p,this.getallpoints(ins,ex));
	}
	this.checktext = function(x,y){
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type=="container" && this.pointers[i].gettext([x,y])){
				return true;
			}
		}
		return false;
	}
	this.expandall = function(p1,p2){
		for(var i=0;i<this.pointers.length;i++){
			this.pointers[i].expand(p1,p2);
		}
	}
	//check if collide occured at rotation point
	this.rotcollide = function(p){
		for(var i=0;i<this.shapes.length;i++){
			var po = null;
			if(this.shapes[i].type == "container"){
				po = this.shapes[i].rotcollide(p);
			}
			if(po!=null){
				return po;
			}
		}
		return null;
	}
	this.getcursor = function(p,src,w,h=w,a=0){
		var newp = new point(p[0],p[1]);
		var im = new Img(src,newp,true);
		canvas.style.cursor = "none";
		var sh = this.makesquare(p,w/this.scale,h/this.scale,false);
		sh.origin.angle = a;
		//im.pos = sh.origin;
		im.shape = sh;
		sh.visible = false;
		sh.hide = true;
		sh.children.push(im);
		//body.shapes.push(this.shape);
		im.pos = sh;
		this.cursorimage = sh;
	}
	//control the mouse cursor
	this.hover = function(x,y){
		this.cursorimage = null;
		if(this.rotcollide([x,y])!=null){
			this.constraint=[];
			//canvas.style.cursor = "none";
			this.getcursor([x,y],"img/rotating.png",8);
			return null;
		}
		//var p = this.pointcollide(x,y);
		if(this.mytext!=null){
			if(this.mytext.collide([x,y],false)){
				canvas.style.cursor = "text";
				return null;
			}
		}
		var el = this.allcollide(x,y);
		var p=null;
		var l= null;
		var s = null;
		if(el==null){
			
		}
		else if(el.type=="point"){
			p = el;
		}
		else if(el.type=="line"){
			l = el;
		}
		else if(el.type=="polygon" || el.type=="container"){
			s = el;
		}
		if(p!=null){
			canvas.style.cursor = "crosshair";
			if(this.pointers.length == 0){
				p.addcollide(true);
				this.pointers.push(p);
			}
			return null;
		}
		//var l = this.linecollide(x,y);
		if(l!=null){
			//canvas.style.cursor = "e-resize";
			//canvas.style.cursor = this.getresize(l);
			var an = l.getangle()+(Math.PI/2);
			this.getcursor([x,y],"img/arrow.png",12,5,an);
			if(this.pointers.length == 0){
				l.addcollide(true);
				this.pointers.push(l);
			}
			return null;
		}
		//var s = this.collide(x,y);
		if(s!=null){
			canvas.style.cursor = "grab";
			if(this.dragging){
				console.log("yeah");
				canvas.style.cursor = "grabbing";
			}
			if(this.pointers.length == 0){
				s.addcollide(true);
				this.pointers.push(s);
			}
			return null;
		}
		if(this.tooltype=="pan"){
			canvas.style.cursor = "grab";
			return null;
		}
		canvas.style.cursor = "default";
		
	}
	this.getresize = function(l){
		var angles = [0,45,90,135];
		var values = ["n-resize","ne-resize","e-resize","se-resize"];
		var ans = 0;
		var dist = null;
		var an = l.getangle()+(2*Math.PI);
		for(var i=0;i<angles.length;i++){
			var na = this.torad(angles[i]);
			var diff = Math.abs(an-na);
			var v1 = myvec.getvec(1,an);
			var v2 = myvec.getvec(1,na);
			diff+=(2*Math.PI);
			//var diff = myvec.newangle(v1,v2);
			diff = diff%(2*Math.PI);
			diff = myvec.newangle(v1,v2);
			diff = diff%Math.PI;
			if(dist==null || dist>diff){
				dist = diff;
				ans = i;
			}
		}
		return values[ans];
	}
	//function to apporiately adjust elements on the screen on drag
	this.drag = function(p1,p2){
		if(this.cursorimage!=null){
			this.cursorimage.origin.moveto(p2);
		}
		if(this.srot!=null){
			this.srot.pos.dragmove(p1,p2);
			return null;
		}
		if(this.mytext!=null){
			if(this.mytext.drag(p2)){
				return null;
			}
		}
		if(this.tooltype == "rotate"){
			for(var i=0;i<this.pointers.length;i++){
				this.pointers[i].dragmove(p1,p2);
			}
			return null;
		}
		if(this.tooltype == "pen" && this.tempshape != null ){
			var ne = this.tempshape.getend(1);
			if(myvec.length(ne.getpoint(),p2)>this.penlength){
				this.temppos = this.tempshape.push(new point(p2[0],p2[1]));
				if(this.temppos == null ){
					var ind = this.shapes.indexOf(this.tempshape); 
					this.deleteEle(this.shapes,ind);
					this.bound(this.tempshape);
					this.tempshape = null;
					this.tooltype = "default";
					Select("default");
					return null;
				}
			}
		}
		var mvec = myvec.subtract(p2,p1);
		if(this.pressing && myvec.mag(mvec)>0.1 && this.pointers.length>0){
			this.pressing = false;
			if(this.action == null){
				barn.saveshape();
			}
		}
		this.moveall(mvec[0],mvec[1],p2);
	}
	//end drawing
	this.enddraw = function(end = false){
		if(this.tempshape!=null){
			if(end){
				this.tempshape.deleteend();
			}
			var ind = this.shapes.indexOf(this.tempshape); 
			this.deleteEle(this.shapes,ind);
			this.bound(this.tempshape);
			this.tempshape = null;
			this.temppos = null;
			this.tooltype = "default";
			Select("default");
		}
	}
	//array functions
	this.deleteEle = function(arr,i){
		if(i>=0 && i<arr.length){
			arr.splice(i,1);
		}
		
	}
	this.centeraxis = function(){
		var ax = new line(new point(canvas.width/2,canvas.height/2),
							new point(canvas.width/2,(canvas.height/2+1)));
		return ax;
	}
	//check if a path can be completed
	this.checkpath = function(x,y){
		this.checktext(x,y);
		var te = this.getpath(x,y);
		if(te!=null){
			var ind = this.shapes.indexOf(te[2]); 
			this.deleteEle(this.shapes,ind);
			this.tempshape = te[1];
			this.shapes.push(te[1]);
			var pos = te[0].getpoint();
			var tp = te[1].getend().getpoint();
			if(myvec.length([x,y],tp)>9){
				this.tempshape.reverse();
			}
			this.temppos = this.tempshape.push(new point(pos[0],pos[1]),false);
			return true;
		}
		return false;
	}
	this.joinpath = function(x,y){
		if(this.tempshape==null){
			return false;
		}
		var te = this.getpath(x,y);
		if(te!=null){
			var ind = this.shapes.indexOf(te[2]); 
			this.deleteEle(this.shapes,ind);
			var tp = te[1].getend().getpoint();
			if(myvec.length([x,y],tp)<9){
				//this.tempshape.reverse();
				te[1].reverse();
			}
			//this.tempshape.addlines(te[1].lines);
			this.tempshape.addpoints(te[1].realpoints());
			//end path tool
			var ind = this.shapes.indexOf(this.tempshape); 
			this.deleteEle(this.shapes,ind);
			this.bound(this.tempshape);
			this.tempshape = null;
			this.temppos = null;
			this.tooltype = "default";
			Select("default");
			return true;
		}
		return false;
	}
	//find path and check if pushed
	this.findpush = function(p){
		for(var i=0;i<this.shapes.length;i++){
			var np = this.shapes[i].push(p);
			if(p!=null){
				return p;
			}
		}
		return null;
	}
	//action to be performed when clicked
	this.click = function(x,y){
		this.checktext(x,y);
		//pen tool
		if(this.tooltype == "pen"){
			if(this.tempshape == null){
				barn.saveshape();
				if(this.checkpath(x,y)){
					return null;
				}
				var p1 = new point(x,y);
				var p2 = new point(x,y);
				p1.end = true;
				p2.end = true;
				var sh = new shape([new line(p1,p2)]);
				sh.setradius();
				sh.ispath = true;
				this.temppos = p2;
				this.tempshape = sh;
				this.shapes.push(sh);
				return null;
			}
		}
		//pencil tool
		if(this.tooltype == "pencil"){
			if(this.tempshape == null){
				if(this.checkpath(x,y)){
					return null;
				}
				barn.saveshape();
				var p1 = new point(x,y);
				var p2 = new point(x,y);
				p1.end = true;
				p2.end = true;
				var sh = new shape([new line(p1,p2)]);
				sh.showpoints = true;
				sh.setradius();
				sh.ispath = true;
				this.temppos = p2;
				this.tempshape = sh;
				this.shapes.push(sh);
				return null;
			}
			else{
				barn.saveshape();
				this.temppos = this.tempshape.push(new point(x,y));
				if(this.temppos == null){
					var ind = this.shapes.indexOf(this.tempshape); 
					this.deleteEle(this.shapes,ind);
					this.bound(this.tempshape);
					this.tempshape = null;
					this.tooltype = "default";
					Select("default");
					return null;
				}
				else if(this.joinpath(x,y)){
					console.log("Joining");
					return null;
				}
			}
		}
		var el = this.allcollide(x,y);
		var p=null;
		var l= null;
		var s = null;
		if(el==null){
			
		}
		else if(el.type=="point"){
			p = el;
		}
		else if(el.type=="line"){
			l = el;
		}
		else if(el.type=="polygon" || el.type=="container"){
			s = el;
		}
		//Adjust points
		//point collide
		//var p = this.pointcollide(x,y);
		if(p!=null){
			/*
			this.unselect();
			p.addcollide(true);
			this.pointers.push(p);
			*/
			this.selectele(p);
			return null;
		}
		//line collide
		//var l = this.linecollide(x,y);
		if(l!=null){
			this.selectele(l);
			return null;
		}
		//shapes collide
		//var s = this.collide(x,y);
		if(s == null){
			if(this.action!=null){
				this.action.addpoint([x,y]);
			}
			this.unselect();
			this.container = this.makesquare(this.mousepos,1);
			this.container.offbezier();
			this.container.setalpha(0.25);
			this.container.setlcolor("#80a2d6");
			return null;
		}
		s.storepos = [x,y];
		this.selectele(s);
		
	}
	//add an element to the pointer array
	this.selectele = function(el,stop=false){
		if(this.action!=null){
			this.action.add(el);
		}
		if(this.pointers.includes(el)){
			return false;
		}
		if((!this.ctron || !this.checkselect(el.type))
			&& this.container == null && !stop){
			this.unselect(false);
		}
		if(!this.groupshapes(el)){
			el.addcollide(true);
			this.pointers.unshift(el);
		}
		this.updims();
		this.upraduis();
		return true;
	}
	//this group shape
	this.groupshapes = function(sh){
		if(this.pointers.length==1 && this.pointers[0].type == "container" && 
		sh.type == "container"){
			var nc = this.getcontainer();
			var news = [];
			news.push(...this.pointers[0].children);
			news.push(...sh.children);
			for(var i=0;i<news.length;i++){
				nc.add(news[i]);
			}
			this.deleteshape(this.pointers[0]);
			this.deleteshape(sh);
			nc.updateall();
			nc.addcollide(true);
			nc.mypoints()[0].rotatemove(0,0);//adjust
			this.shapes.push(nc);
			this.pointers = [nc];
			return true;
		}
		return false;
	}
	//delete a shape from shape list
	this.deleteshape = function(sh){
		var ind = this.shapes.indexOf(sh); 
		this.deleteEle(this.shapes,ind);
	}
	this.arrcopy = function(arr){
		var ans = [];
		for(var i=0;i<arr.length;i++){
			ans.push(arr[i]);
		}
		return ans;
	}
	this.collideselect = function(){
		if(this.container==null){
			return false;
		}
		var ans = false;
		if(this.tooltype == "subselect"){
			for(var i=this.shapes.length-1;i>=0;i--){
				var points = this.shapes[i].mypoints(false);
				for(var j=0;j<points.length;j++){
					var pos = points[j].getpoint();
					if(this.container.collide(pos[0],pos[1],true)){
						this.selectele(points[j]);
					}
				}
			}
			return null;
		}
		//var shp = this.arrcopy(this.shapes);
		var csh = [];
		for(var i=0;i<this.shapes.length;i++){
			if(this.shapes[i].shapecollide(this.container)){
				csh.push(this.shapes[i]);
				//this.selectele(this.shapes[i]);
				ans = true;
			}
		}
		for(var j=0;j<csh.length;j++){
			this.selectele(csh[j]);
		}
		return ans;
	}
	//draw shapes
	this.fillbackground = function(x=0,y=0){
		if(!this.idchecked("transparent")){
			var co = document.getElementById("Bcolor").value;
			can.fillStyle= co;
			can.beginPath();
			can.fillRect(x, y, canvas.width,canvas.height);
			can.fill();
			can.closePath();
		}
	}
	this.no = 0;
	this.draw = function(x=0,y=0){
		this.constraint = [];
		this.fillbackground(x,y);
		if(this.mytext!=null){
			this.mytext.update();
		}
		for(var i=0;i<this.shapes.length;i++){
			this.shapes[i].draw();
		}
		for(var i=0;i<this.fills.length;i++){
			this.fills[i].draw();
		}
		if(this.drawfillers){
			//draw once 
			for(var c = 0;c<this.showonce.length;c++){
				this.showonce[c].draw();
				//console.log("yes");
			}
		}
		//draw temporary values
		for(var b=0;b<this.templines.length;b++){
			this.templines[b].draw();
		}
		if(this.container!=null){
			this.container.draw();
		}
		if(this.cursorimage!=null){
			this.cursorimage.draw();
		}
		//this.drawPoint(this.getpos());
		var sp = this.snapgrid(this.mousepos);
		//this.drawPoint(sp);
		if(this.gridon){
			this.drawgrid();
			if(this.idchecked("snapping") && canvas.style.cursor != "grab"
				&& canvas.style.cursor != "grabbing"){
				this.gridcollide(this.mousepos);
			}
			
		}
		//this.invert();
		/*
		var c = [50,200]
		var p1 = new point(0+c[0],0+c[1]); 
		var p2 = new point(-20+c[0],100+c[1]);
		var p3 = new point(150+20+c[0],90+c[1]);
		var p4 = new point(150+c[0],0+c[1]);
		var tl = new tline(p1,p2,p3,p4); 
		var t = 0.8;
		var t2 = tl.frontsplit(0.33);
		var t3 = tl.backsplit(t);
		var bt = tl.betweensplit(0.33,t);
		//t2.draw();
		t3.draw();
		bt.draw();
		*/
	}
	this.copyshapes = function(){
		var ans = [];
		for(var i=0;i<this.shapes.length;i++){
			var sh = this.shapes[i].getcopy();
			/*
			this.storeshape = null;
			this.storepos = null;
			*/
			this.storetext = null;
			ans.push(sh);
		}
		return ans;
	}
	this.randrange = function(start,end){
		var size=end-start;
		var ans=Math.random()*size;
		ans=Math.floor(ans);
		return (ans+start);
	}
	this.invert = function(){
		var imageData = can.getImageData(0, 0, canvas.width, canvas.height);
		var pixels = imageData.data;
		for (var i = 0; i < pixels.length; i++) {
			pixels[i*4] = 255-pixels[i*4]; // Red
			pixels[i*4+1] = 255-pixels[i*4+1]; // Green
			pixels[i*4+2] = 255-pixels[i*4+2]; // Blue
		};
		can.putImageData(imageData, 0, 0);
	}
	this.getpos = function(){
		var x = this.pos[0]+(canvas.width/2);
		var y = this.pos[1]+(canvas.height/2);
		return [x,y];
	}
	this.drawLine = function(p1,p2,co="#6f7072",al=0.6){
		p1 = this.toscreen(p1);
		p2 = this.toscreen(p2);
		can.strokeStyle=co;
		can.lineWidth=2;
		can.globalAlpha = al;
		can.beginPath();
		can.moveTo(p1[0],p1[1]);
		can.lineTo(p2[0],p2[1]);
		can.stroke();
		can.closePath();
		can.globalAlpha = 1;
	}
	this.drawgrid = function(){
		//draw vertical lines
		//var gridsize = 50 * this.scale;
		var gridsize = this.gridsize;
		var tl = this.toworld([0,0]);
		var br = this.toworld([canvas.width,canvas.height]);
		//var pos = this.getpos();
		var pos = this.snapgrid(this.toworld([canvas.width/2,canvas.height/2]));
		var x1 = pos[0];
		var x2 = pos[0];
		while(x1<br[0]){
			this.drawLine([x1,tl[1]],[x1,br[1]]);
			x1+=gridsize;
			x2-=gridsize;
			this.drawLine([x2,tl[1]],[x2,br[1]]);
		}
		//draw horizontal lines
		var y1 = pos[1];
		var y2 = pos[1];
		while(y1<br[1]){
			this.drawLine([tl[0],y1],[br[0],y1]);
			y1+=gridsize;
			y2-=gridsize;
			this.drawLine([tl[0],y2],[br[0],y2]);
		}
	}
	this.gridcollide = function(p,dr = true){
		var size = 2;
		var ans = [null,null];
		var np = this.snapgrid(p);
		if(Math.abs(p[0]-np[0])<=size){
			ans[0] = np[0];
			if(dr){
				this.drawhorizontal(np[0]);
			}
		}
		if(Math.abs(p[1]-np[1])<=size){
			ans[1] = np[1];
			if(dr){
				this.drawvertical(np[1]);
			}
		}
		return ans;
	}
	this.drawvertical = function(x,store=false){
		var tl = this.toworld([0,0]);
		var br = this.toworld([canvas.width,canvas.height]);
		if(store){
			var p1 = new point(tl[0],x);
			var p2 = new point(br[0],x);
			var l = new line(p1,p2);
			this.showonce.push(l);
		}
		else{
			this.drawLine([tl[0],x],[br[0],x],"black",0.9);
		}
		
		
	}
	this.drawhorizontal = function(y,store=false){
		var tl = this.toworld([0,0]);
		var br = this.toworld([canvas.width,canvas.height]);
		if(store){
			var p1 = new point(y,tl[1]);
			var p2 = new point(y,br[1]);
			var l = new line(p1,p2);
			this.showonce.push(l);
		}
		else{
			this.drawLine([y,tl[1]],[y,br[1]],"black",0.9);
		}
	}
	this.getscale = function(){
		return this.scale;//for now
	}
	this.upscale = function(dir=1){
		var ds = this.scalevel*dir;
		var ns = this.scale+ds;
		if(this.inscale(ns)){
			this.scale = ns;
		}
	}
	this.inscale = function(s){
		if(s>=this.minscale && s<=this.maxscale){
			return true;
		}
		return false;
	}
	this.toscreen = function(p){
		var co = this.getpos();
		var sc = this.getscale();
		p[0] = ((p[0] - co[0])*sc) + canvas.width/2;
		p[1] = ((p[1] - co[1])*sc)+ canvas.height/2;
		return p;
		
	}
	this.toworld = function(p){
		var co = this.getpos();
		var sc = this.getscale();
		p[0] = ((p[0] - canvas.width/2 )/sc) + co[0];
		p[1] = ((p[1] - canvas.height/2)/sc) + co[1];
		return p;
	}
	this.alltoscreen = function(points){
		var ans = [];
		for(var i=0;i<points.length;i++){
			ans.push(this.toscreen(points[i]));
		}
		return ans;
	}
	this.alltoworld = function(points){
		var ans = [];
		for(var i=0;i<points.length;i++){
			ans.push(this.toworld(points[i]));
		}
		return ans;
	}
	//snap a point to the nearest grid lines
	this.snapgrid = function(p){
		var xdir = false;
		var ydir = false;
		//p = body.toscreen(p);
		var pos = this.getpos();
		var size = this.gridsize;
		var X = p[0] - pos[0];
		var Y = p[1] - pos[1];
		if(X<0){
			xdir = true;
			X*=-1;
		}
		if(Y<0){
			ydir=true;
			Y*=-1;
		}
		var nX = Math.floor(X/size)*size;
		var nY = Math.floor(Y/size)*size;
		X = this.getcloser(X,nX,nX+size);
		Y = this.getcloser(Y,nY,nY+size);
		if(xdir){
			X*=-1;
		}
		if(ydir){
			Y*=-1;
		}
		X+=pos[0];
		Y+=pos[1];
		var ans = [X,Y];
		//ans = body.toworld([X,Y]);
		return ans;
	}
	this.getcloser = function(x,sx,sl){
		if(Math.abs(sx-x)<Math.abs(sl-x)){
			return sx;
		}
		return sl;
	}
	this.retPolygon = function(pos,length,n){
		var points=[];
		var a=(Math.PI*(n-2))/n;
		var ta=Math.PI-a;
		var spos=pos;
		var starta=Math.PI;
		//points.push(spos);
		for(var i=0;i<n;i++){
			var newl=[0,0];
			//move point
			newl[0]=spos[0]+Math.cos(starta)*length;
			newl[1]=spos[1]+Math.sin(starta)*length;
			spos[0]=newl[0];
			spos[1]=newl[1];
			var po = new point(newl[0],newl[1]);
			points.push(po);
			this.points.push(po);
			//add line
			if(i>0){
				this.lines.push(new line(this.points[i-1],po));
			}
			//turn angle
			starta-=ta;
		}
		this.lines.push(new line(this.points[this.points.length-1],this.points[0]));
		//now create shape
		return new polygon(points);
	}
	this.getPolygon = function(pos,len = 50, n = 4){
		//now create shape
		//this.shapes.push(this.retPolygon(pos,length,n));
		//real get circle
		
		//this.shapes.push(this.makesquare(pos,len));
		this.makerect(pos,len);
	}
	this.retrect = function(pos,len = 50,len1=len){
		var n1 = new point(pos[0]-len,pos[1]+len1);
		var n2 = new point(pos[0]+len,pos[1]+len1);
		var n3 = new point(pos[0]+len,pos[1]-len1);
		var n4 = new point(pos[0]-len,pos[1]-len1);
		n1.end = true;
	
		var l1 = new line(n1,n2);
		var l2 = new line(n2,n3);
		var l3 = new line(n3,n4);
		var l4 = new line(n4,n1);
		
		var ans = (new shape([l1,l2,l3,l4]));
		return ans;
	}
	this.makerect = function(pos,len = 50,len1=len){
		barn.saveshape();
		var n1 = new point(pos[0]-len,pos[1]+len1);
		var n2 = new point(pos[0]+len,pos[1]+len1);
		var n3 = new point(pos[0]+len,pos[1]-len1);
		var n4 = new point(pos[0]-len,pos[1]-len1);
		n1.end = true;
	
		var l1 = new line(n1,n2);
		var l2 = new line(n2,n3);
		var l3 = new line(n3,n4);
		var l4 = new line(n4,n1);
		
		var ans = (new shape([l1,l2,l3,l4]));
		this.bound(ans);
	}
	this.polypoints = function(n,length,pos=[100,100]){
		points=[];
		a=(Math.PI*(n-2))/n;
		ta=Math.PI-a;
		spos=pos;
		starta=Math.PI;
		//points.push(spos);
		for(var i=0;i<n;i++){
			var newl=[0,0];
			//move point
			newl[0]=spos[0]+Math.cos(starta)*length;
			newl[1]=spos[1]+Math.sin(starta)*length;
			spos[0]=newl[0];
			spos[1]=newl[1];
			points.push(newl);
			//turn angle
			starta-=ta;
		}
		return points;
	}
	this.makestar = function(pos,len=50,len1=len){
		barn.saveshape();
		var sides = 5;
		//make polygon
		var points = this.polypoints(sides,len);
		sh = builder.drawshape(points);
		
		//make star
		var cen = sh.origin.getpoint();
		points = sh.realpoints();
		var npos = [];
		var r = 2.5;
		for(var i=0;i<points.length;i++){
			var j = (i+1)%points.length;
			var p1 = points[i].getpoint();
			var p2 = points[j].getpoint();
			var l = myvec.length(p1,cen);
			//make new point
			var np = myvec.add(p1,p2);
			np = myvec.mult(np,0.5);
			var vect = myvec.subtract(np,cen);
			vect = myvec.mult(vect,r);
			np = myvec.add(cen,vect);
			npos.push(p1);
			npos.push(np);
		}
		var nsh = builder.drawshape(npos);
		var co = this.bound(nsh);
		co.moveto(pos);
		//console.log(co.pos.getpoint());
	}
	this.makecircle = function(pos,len=50,len1=len){
		barn.saveshape();
		//make circle path
		var n1 = new point(pos[0],pos[1]-len1);
		var n2 = new point(pos[0]+len,pos[1]);
		var n3 = new point(pos[0],pos[1]+len1);
		var n4 = new point(pos[0]-len,pos[1]);
		
		var l1 = new line(n1,n2);
		var l2 = new line(n2,n3);
		var l3 = new line(n3,n4);
		var l4 = new line(n4,n1);
		var ans = (new shape([l1,l2,l3,l4]));
		this.bound(ans);
		//add bezier curves
		var uv = [1,0];
		var r = 0.59;
		for(var i=0;i<ans.lines.length;i++){
			var l = ans.lines[i];
			var dist = len;
			if(i%2==1){
				dist = len1;
			}
			dist*=r;
			var vect = myvec.mult(uv,dist);
			l.h1.rotatemove(vect[0],vect[1]);
			uv = myvec.rot(uv,(Math.PI/2));
		}
	}
	this.makesquare = function(pos,len = 50,len1=len,cen = true){
		var n1 = new point(pos[0]-len,pos[1]+len1);
		var n2 = new point(pos[0]+len,pos[1]+len1);
		var n3 = new point(pos[0]+len,pos[1]-len1);
		var n4 = new point(pos[0]-len,pos[1]-len1);
		n1.end = true;
	
		var l1 = new line(n1,n2);
		var l2 = new line(n2,n3);
		var l3 = new line(n3,n4);
		var l4 = new line(n4,n1);
		
		this.constraint.push(new vertical(n1,n2));
		this.constraint.push(new vertical(n3,n4));
		this.constraint.push(new horizontal(n2,n3));
		this.constraint.push(new horizontal(n1,n4));
		var ans = (new shape([l1,l2,l3,l4]));
		if(cen){
			this.constraint.push(new center(ans.origin,n2,n4));
			this.constraint.push(new center(ans.origin,n1,n3));
		}
		return ans;
	}
	//give a created shape a bounding box
	this.bound = function(sh,a=0,get = true,turn=true){
		sh.origin.angle-=a;
		var b = this.makesquare(sh.origin.getpoint());
		b.origin.angle = a;
		b.visible = false;
		var bo = new container(b);
		sh.addorigin(bo.pos,false);
		bo.add(sh);
		if(get){
			bo.setcolor(this.getcolor());
		}
		this.shapes.push(bo);
		bo.mypoints()[0].rotatemove(0,0);//adjust
		return bo;//incase you want to access it
	}
	//bound shape but don't add it
	this.getbound = function(sh,a=0,get = true,turn=true){
		sh.origin.angle-=a;
		var b = this.makesquare(sh.origin.getpoint());
		b.origin.angle = a;
		b.visible = false;
		var bo = new container(b);
		sh.addorigin(bo.pos,false);
		bo.add(sh);
		if(get){
			bo.setcolor(this.getcolor());
		}
		bo.mypoints()[0].rotatemove(0,0);//adjust
		return bo;//incase you want to access it
	}
	//combine the shapes in a group together
	this.combine = function(){
		barn.saveshape();
		for(var i=0;i<this.shapes.length;i++){
			if(this.shapes[i].type == "container"){
				this.shapes[i].ADD();
			}
		}
	}
	//minus shapes from each other
	this.subtract = function(){
		barn.saveshape();
		for(var i=0;i<this.shapes.length;i++){
			if(this.shapes[i].type == "container"){
				this.shapes[i].minus();
			}
		}
	}
	this.intersect = function(){
		barn.saveshape();
		for(var i=0;i<this.shapes.length;i++){
			if(this.shapes[i].type == "container"){
				this.shapes[i].intersect();
			}
		}
	}
	this.getcontainer = function(){
		var b = this.makesquare(this.mousepos,2);
		b.visible = false;
		var bo = new container(b);
		//bo.setcolor(this.getcolor());// for now
		return bo;
	}
	this.getCurve = function(pos,width=50){
		var c = new curve(pos,width,width+20);
		//this.lines.push(c);
		//this.shapes.push(c);
		this.bound(c);
	}
	this.getellipse = function(pos,w=50,h=w){
		var np = new point(pos[0],pos[1]);
		var c = new ellipse(np,w,h);
		//var sh = new shape([c]);
		//this.fills.push(c);
		//this.bound(sh);
	}
	this.gettext = function(pos){
		barn.saveshape();
		var newp = new point(pos[0],pos[1]);
		var tex = new Text("Test",newp);
		//body.fills.push(tex);
		this.mytext = tex;
		//var te = tex.mirrow(this.centeraxis());
		//body.shapes.push(te);
	}
	this.getimage = function(pos){
		var newp = new point(pos[0],pos[1]);
		var im = new Img("img/logo5.png",newp);
		//body.fills.push(im);
	}
	this.upload = function(pos,name){
		var newp = new point(pos[0],pos[1]);
		var im = new Img(name,newp);
		//body.fills.push(im);
		//body.shapes.push(im);
		//var nm = im.mirrow(this.centeraxis());
		//body.shapes.push(nm);
	}
	this.setcolor = function(){
		var fill = document.getElementById("fc").value;
		var fill2 = document.getElementById("fc2").value;
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container" || this.pointers[i].type == "polygon" || this.pointers[i].type=="curve"){
				this.pointers[i].setcolor(fill);
				this.pointers[i].setlcolor(fill2);
			}
		}
	}
	this.upcolor = function(sh){
		if(sh.type == "container" || sh.type == "polygon" || sh.type == "curve"){
			document.getElementById("fc").value = sh.getcolor();
			document.getElementById("op").value = sh.getalpha()*100;
			document.getElementById("op2").value = sh.getlalpha()*100;
			document.getElementById("fc2").value = sh.getlcolor();
			document.getElementById("size").value = sh.getlsize();
		}
	}
	this.getcolor = function(){
		return document.getElementById("fc").value;
	}
	this.setopacity = function(){
		var op = document.getElementById("op").value;
		var op2 = document.getElementById("op2").value;
		var sz = document.getElementById("size").value;
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container" || this.pointers[i].type == "polygon" || this.pointers[i].type=="curve"){
				this.pointers[i].setalpha(op/100);
				this.pointers[i].setlalpha(op2/100);
				this.pointers[i].setlsize(sz);
			}
		}
	}
	this.checkNaN = function(pl){
		for(var i=0;i<pl.length;i++){
			if(isNaN(pl[i])){
				return true;
			}
		}
		return false;
	}
	this.parse = function(v,sig = 2){
		v = parseFloat(v);
		var no = 10*sig;
		v = (Math.round(v*no)/no);
		return v;
	}
	this.setdims = function(){
		var x = parseFloat(document.getElementById("x").value);
		var y = parseFloat(document.getElementById("y").value);
		var r = this.torad(document.getElementById("rotation").value);
		var w = parseFloat(document.getElementById("width").value);
		var h = parseFloat(document.getElementById("height").value);
		
		if(this.checkNaN([x,y,r,w,h])){
			return null;// don't update a null value
		}
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				this.pointers[i].setwidth(w);
				this.pointers[i].setheight(h);
				//positions
				this.pointers[i].pos.update(x,y);
				this.pointers[i].pos.angle=r;
			}
			return null; //set only the first point
		}
	}
	this.setshadow = function(){
		var x = parseFloat(document.getElementById("offx").value);
		var y = parseFloat(document.getElementById("offy").value);
		var bl = parseFloat(document.getElementById("blur").value);
		
		if(this.checkNaN([x,y,bl])){
			return null;// don't update a null value
		}
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				this.pointers[i].setshadow(x,y,bl);
			}
			return null; //set only the first point
		}
	}
	this.updims = function(){
		if(this.pointers.length>0){
			var cur = this.pointers[0];
			if(cur.type == "line"){
				cur = cur.p1;
			}
			if(cur.type == "point" && cur.container!=null){
				cur = cur.container;
			}
			else if(cur.type == "point" && cur.headshape!=null){
				cur = cur.headshape;
			}
			if(cur.type == "container"){
				var pos = cur.pos.getpoint();
				var r = cur.pos.getangle();
				var w = cur.getwidth();
				var h = cur.getheight();
				//updatedims(pos[0],pos[1],w,h,r);
				document.getElementById("x").value = this.parse(pos[0])+"px";
				document.getElementById("y").value = this.parse(pos[1])+"px";
				document.getElementById("rotation").value = this.parse(this.todegree(r));
				document.getElementById("width").value = this.parse(w)+"px";
				document.getElementById("height").value = this.parse(h)+"px";
				//opacities
				document.getElementById("op").value = cur.getalpha()*100;
				document.getElementById("op2").value = cur.getlalpha()*100;
				//size
				document.getElementById("size").value = cur.getlsize();
				//color
				document.getElementById("fc").value = cur.getcolor();
				document.getElementById("fc2").value = cur.getlcolor();
				upalltext();//update the texts
				
			}
		}
		this.upshadow();
	}
	this.torad = function(v){
		 var v = parseFloat(v);
		 return ((v/180)*Math.PI);
	}
	this.todegree = function(v){
		var v = parseFloat(v);
		if(v<0){
			v+=(2*Math.PI);
		}
		return ((v/Math.PI)*180);
	}
	this.upshadow = function(){
		if(this.pointers.length>0){
			var cur = this.pointers[0];
			if(cur.type == "container"){
				var dow = cur.getshadow();
				//updatedims(pos[0],pos[1],w,h,r);
				document.getElementById("offx").value = dow[0]+"px";
				document.getElementById("offy").value = dow[1]+"px";
				document.getElementById("blur").value = dow[2]+"px";
			}
		}
	}
	this.setradius = function(v=0){
		for(var i=0;i<this.pointers.length;i++){
			this.pointers[i].setradius(v);
		}
	}
	this.upraduis= function(){
		if(this.pointers.length>0){
			var so = document.getElementById("radiusshow");
			var v = this.pointers[0].getradius();
			document.getElementById("radius").value = v;
			v = ""+v+"px";
			so.innerText = v;
		}
	}
	//right click functions
	//add a shape at a certain interval
	this.addshape = function(sh,i=0){
		var nsh = [];
		var added = false;
		if(i<0){
			nsh.push(sh);
			added = true;
		}
		for(var j=0;j<this.shapes.length;j++){
			if(i==j){
				nsh.push(sh);
				added = true;
			}
			nsh.push(this.shapes[j]);
		}
		if(!added){
			nsh.push(sh);
		}
		this.shapes = nsh;
	}
	this.sendbackward= function(){
		barn.saveshape();
		if(this.pointers.length>0){
			var i = this.shapes.indexOf(this.pointers[0]);
			console.log(i);
			i-=1;
			this.sendall(this.pointers,i);
		}
	}
	this.sendforward= function(){
		barn.saveshape();
		if(this.pointers.length>0){
			var i = this.shapes.indexOf(this.pointers[0]);
			i+=1;
			this.sendall(this.pointers,i);
		}
	}
	this.sendback = function(){
		barn.saveshape();
		if(this.pointers.length>0){
			i=0;
			this.sendall(this.pointers,i);
		}
	}
	this.sendfront = function(){
		barn.saveshape();
		if(this.pointers.length>0){
			i=this.shapes.length;
			this.sendall(this.pointers,i);
		}
	}
	this.sendall = function(poses,j=0){
		for(var i=poses.length-1;i>=0;i--){
			this.deleteshape(poses[i]);
			this.addshape(poses[i],j);
		}
	}
	//removing/adding variables
	this.Delete = function(){
		barn.saveshape();
		//this.unselect();
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				this.deleteshape(this.pointers[i]);
				//extra stuff
				if(this.pointers[i].children.length>1){
					var ch = this.pointers[i].children;
					this.unselect();
					for(var i=0;i<ch.length;i++){
						for(var j=this.shapes.length-1;j>=0;j--){
							if(this.shapes[j].has(ch[i])){
								this.deleteshape(this.shapes[j]);
							}
						}
					}
					
				}
				//end
			}
		}
		
		this.unselect();
		//this.degroup();
	}
	this.Duplicate = function(){
		var st = [];
		if(this.pointers.length>0){
			barn.saveshape([],st);
		}
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				st.push(this.pointers[i].copy());
			}
		}
		
	}
	this.Copy = function(){
		this.copies = [];
		this.copypos = this.mousepos;
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				var co = this.pointers[i].copy();
				this.deleteshape(co);
				this.copies.push(co);
			}
		}
	}
	this.Paste = function(){
		var st = [];
		var np = this.mousepos;
		var dv = myvec.subtract(np,this.copypos);
		if(this.copies.length>0){
			barn.saveshape();
		}
		for(var i=0;i<this.copies.length;i++){
			var co = this.copies[i].copy();
			co.move(dv[0],dv[1]);
		}
	}
	this.Cut = function(){
		this.Copy();
		this.Delete();
	}
	this.selectall = function(){
		barn.saveshape([],st);
		var csh = [];
		for(var i=0;i<this.shapes.length;i++){
			csh.push(this.shapes[i]);
		}
		for(var j=0;j<csh.length;j++){
			this.selectele(csh[j],true);
		}
	}
	this.copyall = function(){
		this.selectall();
		this.Copy();
		this.unselect();
	}
	this.cutall = function(){
		this.selectall();
		this.Cut();
		this.unselect();
	}
	this.lock = function(){
		barn.saveshape();
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type == "container"){
				this.pointers[i].islocked = true;
			}
		}
	}
	this.unlockall = function(){
		if(this.shapes.length>0){
			barn.saveshape();
		}
		for(var i=0;i<this.shapes.length;i++){
			this.shapes[i].islocked = false;
		}
	}
	this.makegroup = function(){
		if(this.pointers.length>0){
			barn.saveshape();
		}
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type=="container"){
				this.pointers[i].holdgroup = true;
			}
		}
	}
	this.makeungroup = function(){
		if(this.pointers.length>0){
			barn.saveshape();
		}
		for(var i=0;i<this.pointers.length;i++){
			if(this.pointers[i].type=="container"){
				this.pointers[i].holdgroup = false;
			}
		}
	}
	this.getedge = function(sh,start=[null,null],end=[null,null]){
		var points = sh.mypoints()
		var np = sh.getlsize();
		for(var i=0;i<points.length;i++){
			var po = points[i];
			if(po[0]==undefined){
				var po = points[i].getpoint();
				
			}
			var ex = po[0]+1.1*np;
			var ey = po[1]+1.1*np;
			var sx = po[0]-1.1*np;
			var sy = po[1]-1.1*np;
			var dow = sh.getshadow();
			//shadow setting
			if(dow[0]>0){
				ex+=dow[0];
			}
			if(dow[1]>0){
				ey+=dow[1];
			}
			if(dow[0]<0){
				sx+=dow[0];
			}
			if(dow[1]<0){
				sy+=dow[1];
			}
			//set
			if(start[0] == null || sx<start[0]){
				start[0] = sx;
			}
			if(start[1] == null || sy<start[1]){
				start[1] = sy;
			}
			if(end[0] == null || ex>end[0]){
				end[0] = ex;
			}
			if(end[1] == null || ey>end[1]){
				end[1] = ey;
			}
		}
		return [start,end];
	}
	//get the edges of the points
	this.getedges = function(All = true){
		var points = [];
		var pa = 1;
		var shapes = this.shapes;
		if(!All){
			shapes = this.pointers;
		}
		var start = [null,null];
		var end = [null,null];
		for(var i=0;i<shapes.length;i++){
			if(shapes[i].type=="container"){
				/*
				points.push(...shapes[i].mypoints());
				var np = shapes[i].getlsize();
				if(pa<np){
					pa = np;
				}
				*/
				var both = this.getedge(shapes[i],start,end);
				start = both[0];
				end = both[1];
			}
		}
		/*
		for(var i=0;i<points.length;i++){
			var po = points[i];
			if(po[0]==undefined){
				var po = points[i].getpoint();
			}
			if(start[0] == null || po[0]<start[0]){
				start[0] = po[0];
			}
			if(start[1] == null || po[1]<start[1]){
				start[1] = po[1];
			}
			if(end[0] == null || po[0]>end[0]){
				end[0] = po[0];
			}
			if(end[1] == null || po[1]>end[1]){
				end[1] = po[1];
			}
		}
		*/
		if(start[0]==null){
			start = [0,0];
			end = [canvas.width,canvas.height];
		}
		pa = pa/2;
		//padding
		pa+=1;
		start[0]-=2*pa;
		start[1]-=2*pa;
		end[0]+=2*pa;
		end[1]+=2*pa;
		return [start,end];
	}
	//drawing functions
	this.drawpoint = function(po,r=2){
		var p = po.getpoint();
		can.fillStyle="black";
		s=r;
		can.beginPath();
		can.arc(p[0],p[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
	}
	this.drawPoint = function(po,r=2){
		var p = po;
		can.fillStyle="black";
		s=r;
		can.beginPath();
		can.arc(p[0],p[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
	}
	this.drawcurve = function(c){
		var points = c.getpoints();
		this.strokepoints(points);
		
	}
	this.strokepoints = function(points){
		if(points.length==0){
			return null;
		}
		can.strokeStyle="black";
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=0;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		can.lineTo(points[0][0],points[0][1]);
		can.stroke();
	}
}