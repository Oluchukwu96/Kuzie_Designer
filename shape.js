//class for grouping shapes togethter
function container(shape){
	this.pos = shape.origin;
	this.shape = shape;
	this.shape.border = true;
	this.children = [];//shapes whose point are affected by shape
	this.type = "container";
	this.map = new Object();
	this.shape.setradius();
	this.shape.iscontainer = true;
	this.shape.offbezier();
	this.shape.onborder(this);
	this.holdgroup = false;
	this.storepos = null;
	this.copysh = null;
	this.islocked = false;
	
	this.copy = function(){
		var co = null;
		var an = this.pos.angle;
		this.pos.angle = 0;
		for(var i=0;i<this.children.length;i++){
			var a = 0;
			//var a = this.children[i].angle;
			//a+= this.pos.getangle();
			if(co==null){
				co = body.bound(this.children[i].copy(),0,false);
			}
			else{
				co.add(this.children[i].copy());
			}
		}
		this.pos.angle = an;
		co.shape.origin.angle = an;
		return co;
	}
	//copy but don't add to shape
	this.getcopy = function(){
		var co = null;
		var an = this.pos.angle;
		this.pos.angle = 0;
		for(var i=0;i<this.children.length;i++){
			var a = 0;
			//var a = this.children[i].angle;
			//a+= this.pos.getangle();
			if(co==null){
				co = body.getbound(this.children[i].copy(),0,false);
			}
			else{
				co.add(this.children[i].copy());
			}
		}
		this.pos.angle = an;
		co.shape.origin.angle = an;
		return co;
	}
	this.mirrow = function(axis){
		var co = null;
		//var an = this.pos.angle;
		//this.pos.angle = 0;
		for(var i=0;i<this.children.length;i++){
			var a = 0;
			if(co==null){
				co = body.bound(this.children[i].mirrow(axis),0,false);
			}
			else{
				co.add(this.children[i].mirrow(axis));
			}
		}
		
		//this.pos.angle = an;
		//var an = this.pos.mirrowangle(this.pos.getangle(),axis);
		co.shape.origin.angle = this.pos.getangle();
		return co;
	}
	this.revolve = function(po,ag){
		var co = null;
		var an = this.pos.angle;
		this.pos.angle = 0;
		for(var i=0;i<this.children.length;i++){
			var a = 0;
			//var a = this.children[i].angle;
			//a+= this.pos.getangle();
			if(co==null){
				co = body.bound(this.children[i].copy(),0,false);
			}
			else{
				co.add(this.children[i].copy());
			}
		}
		this.revolvemove(po,ag,co);
		this.pos.angle = an;
		co.shape.origin.angle = (an+ag);
		return co;
	}
	this.revolvemove = function(po,an,sh){
		var pos = new point(po[0],po[1]);
		var op = sh.shape.origin.getpoint();
		op = myvec.subtract(op,po);
		var ans = pos.rot(op[0],op[1],an);
		ans = myvec.add(ans,po);
		sh.shape.origin.moveto(ans);
	}
	//function to copy objects around another objects
	this.startpath = function(po,an=null){
		this.copysh = this.children[0];
		if(this.copysh.hasb()){
			this.copysh = this.copysh.getshape();
		}
		this.copysh.startpath(po,an);
	}
	this.movepath = function(sh,dl,dir=1){
		var np = this.copysh.movepath(dl,dir);
		np = this.copysh.getpathpos();
		if(np==null){
			return null;
		}
		//var ag = myvec.getangle(this.children[0].linevec);
		//ag-=(Math.PI/2);
		var ag = this.copysh.getpathangle();
		//ag-= this.shape.origin.getangle();
		return sh.copymove(np,ag);
		
	}
	this.copymove = function(np,ag){
		//copy
		var co = null;
		var an = this.pos.angle;
		this.pos.angle = 0;
		for(var i=0;i<this.children.length;i++){
			var a = 0;
			//var a = this.children[i].angle;
			//a+= this.pos.getangle();
			if(co==null){
				co = body.bound(this.children[i].copy(),0,false);
			}
			else{
				co.add(this.children[i].copy());
			}
		}
		//move to location
		co.shape.origin.moveto(np);
		//restore angle
		this.pos.angle = an;
		co.shape.origin.angle = (an+ag);
		return co;
	}
	this.getaxis = function(dp=null){
		return this.pos.getaxis(dp);
	}
	this.push = function(p,nor=true){
		for(var i=0;i<this.children.length;i++){
			var np = this.children[i].push(p,nor);
			if(np!=null){
				return np;
			}
		}
		return null;
	}
	//getters and setters
	this.setcolor = function(c){
		this.pos.color = c;
		this.set("color",c);
	}
	this.setalpha = function(a){
		this.pos.alpha = a;
		this.set("alpha",a);
	}
	this.getcolor = function(c){
		return this.pos.color;
	}
	this.getalpha = function(a){
		return this.pos.alpha;
	}
	this.addcollide = function(a){
		this.shape.origin.addcollide(a);
	}
	this.getpoints  = function(){
		return this.shape.getpoints();
	}
	//line getters and setters
	this.setlcolor = function(c){
		this.pos.lcolor = c;
		this.set("lcolor",c);
	}
	this.setlalpha = function(a){
		this.pos.lalpha = a;
		this.set("lalpha",a);
	}
	this.setlsize = function(a){
		this.pos.lsize = a;
		this.set("lsize",a);
	}
	this.getlcolor = function(c){
		return this.pos.lcolor;
	}
	this.getlalpha = function(a){
		return this.pos.lalpha;
	}
	this.getlsize = function(a){
		return this.pos.lsize;
	}
	this.setshadow = function(x,y,bl,c=null){
		this.set("soffx",x);
		this.set("soffy",y);
		this.set("sblur",bl);
		
	}
	this.getshadow = function(){
		var ans = [0,0,0];
		if(this.children.length>0){
			ans[0] = this.children[0].soffx;
			ans[1] = this.children[0].soffy;
			ans[2] = this.children[0].sblur;
		}
		return ans;
	}
	this.setradius = function(v=0){
		//this.shape.setradius(v);
		for(var i=0;i<this.children.length;i++){
			this.children[i].setradius(v);
		}
		this.recal();
	}
	this.getradius = function(){
		if(this.children.length>0){
			return this.children[0].getradius();
		}
		return 0;
	}
	this.set = function(para,v){
		for(var i=0;i<this.children.length;i++){
			this.children[i][para] = v;
		}
	}
	//end
	//adjustment variables
	this.mypoints = function(me=true){
		var ans = [];
		if(me){
			ans.push(...this.shape.realpoints());
		}
		else{
			for(var j=0;j<this.children.length;j++){
				ans.push(...this.children[j].mypoints(me));
			}
		}
		return ans;
	}
	this.getpoint = function(){
		return this.shape.origin.getpoint();
	}
	this.mylines = function(me=true){
		var ans = [];
		if(me){
			ans.push(...this.shape.lines);
		}
		else{
			for(var j=0;j<this.children.length;j++){
				ans.push(...this.children[j].mylines(me));
			}
		}
		return ans;
	}
	var tps = this.mypoints();
	for(var i=0; i<tps.length;i++){
		tps[i].headshape = this;
	}
	//check if the current shape group elements together
	this.isgroup = function(){
		if(this.holdgroup){
			return false;
		}
		if(this.children.length>1){
			return true;
		}
		return false;
	}
	this.myorigin = function(){
		return this.shape.origin;
	}
	this.addorigin = function(ori){
		this.shape.removeorigin();
		this.shape.addorigin(ori);
		this.pos = this.shape.origin;
		
		
	}
	this.findtext = function(){
		for(var i=0;i<this.children.length;i++){
			var t = this.children[i].findtext();
			if(t!=null){
				return t;
			}
		}
		return null;
	}
	this.gettext = function(p){
		if(!this.pos.colliding){
			return false;
		}
		for(var i=0;i<this.children.length;i++){
			var t = this.children[i].findtext();
			if(t!=null){
				if(t.collide(p)){
					//t.show();
					body.mytext = t;
					return true;
				}
			}
		}
		return false;
	}
	this.update = function(pos){
		var w = this.shape.get(1)[0] - this.shape.get(0)[0];
		var h = this.shape.get(2)[1] -  this.shape.get(1)[1];
		var r = pos.ratio;
		//console.log("The r is "+r);
		var x = (r[0])*w+this.shape.get(0)[0];
		var y = (r[1])*h+this.shape.get(0)[1];
		pos.update(x,y);
	}
	this.updateall = function(){
		var points = this.childpoints();
		for(var i=0;i<points.length;i++){
			this.update(points[i]);
		}
		var w = this.shape.get(1)[0] - this.shape.get(0)[0];
		var h = this.shape.get(2)[1] -  this.shape.get(1)[1];
		//update handle bars
		var nps = this.handlepoints();
		for(var i=0;i<nps.length;i++){
			var r = nps[i].ratio;
			var x = r[0] * w;
			var y = r[1] *h;
			var shl = nps.hlock;
			nps.hlock = false;
			nps[i].update(x,y);
			nps.hlock = shl;
		}
		
	}
	this.calibrate = function(){
		//store the positions of points in space
		this.map = new Object();
		var points = this.childpoints();
		for(var i=0;i<points.length;i++){
			var pos = points[i].getpos();
			//console.log("The r is "+this.ratio(pos));
			points[i].ratio = this.ratio(pos);
			//this.map[points[i]] = this.ratio(pos);
		}
		//make sure handle distance is constant
		var nps = this.handlepoints();
		for(var i=0;i<nps.length;i++){
			var pos = nps[i].getpos();
			var x = pos[0]/this.getwidth();
			var y = pos[1]/this.getheight();
			nps[i].ratio = [x,y];
		}
	}
	this.ratio = function(pos){
		var w = myvec.length(this.shape.get(0),this.shape.get(1));
		var h = myvec.length(this.shape.get(1),this.shape.get(2));
		var x = pos[0] - this.shape.get(0)[0];
		var y = pos[1] - this.shape.get(0)[1];
		//console.log("Dimensions "+ w+" "+h);
		return [x/w,y/h];
	}
	this.setwidth = function(w){
		var nx =this.shape.get(0)[0] +w;
		var ny = this.shape.get(1)[1];
		this.shape.set([nx,ny],1,true);
	}
	this.setheight = function(h){
		var nx =this.shape.get(3)[0];
		var ny = this.shape.get(0)[1]+h;
		this.shape.set([nx,ny],3,true);
	}
	this.getwidth = function(){
		return myvec.length(this.shape.get(0),this.shape.get(1));
	}
	this.getheight = function(){
		return myvec.length(this.shape.get(1),this.shape.get(2));
	}
	this.childpoints = function(){
		var ans = [];
		for(var j=0;j<this.children.length;j++){
			var points = this.children[j].realpoints();
			for(var i=0;i<points.length;i++){
				ans.push(points[i]);
			}
		}
		return ans;
	}
	this.handlepoints = function(){
		var ans = [];
		for(var j=0;j<this.children.length;j++){
			var points = this.children[j].forcehandles();
			ans.push(...points);
		}
		return ans;
	}
	this.add = function(sh){
		if(sh==null){
			return null;
		}
		if(this.pos != sh.origin){
			//change the origin
			sh.removeorigin();
			sh.addorigin(this.pos);
		}
		//make necessary adjustments
		this.children.push(sh);
		this.resize();
		this.calibrate();
		this.addconstraint();
		sh.Parent = this;
		sh.setborder(this);
	}
	//remove shape from children list if they exist
	this.remove = function(sh){
		var ind = this.children.indexOf(sh);
		this.children.splice(ind,1);
		/*
		this.resize();
		this.calibrate();
		this.addconstraint();
		*/
		
	}
	this.ungroup = function(){
		for(var i=0;i<this.children.length;i++){
			this.children[i].ungroup(this.pos.getangle());
		}
	}
	this.setborder = function(father){
		this.shape.setborder(father);
	}
	//function dealing with manipulation of origins
	this.removeorigin = function(){
		this.pos = null;
		this.shape.removeorigin();
		for(var i=0;i<this.children.length;i++){
			this.children[i].removeorigin();
		}
	}
	this.addorigin = function(ori,child= true){
		this.shape.addorigin(ori,child);
		for(var i=0;i<this.children.length;i++){
			this.children[i].addorigin(ori,child);
		}
		this.pos = ori;
	}
	this.recal = function(){
		this.resize();
		this.calibrate();
	}
	this.addconstraint = function(){
		var points = this.shape.realpoints();
		for(var i=0;i<points.length;i++){
			var r = new ratio(points[i],this);
			if(body){
				body.constraint.push(r);
			}
		}
	}
	this.realpoints = function(){
		return this.shape.realpoints();
	}
	this.resize = function(){
		if(this.children.length==0){
			return null;
		}
		var minx = null;
		var maxx = null;
		var miny = null;
		var maxy= null;
		for(var j=0;j<this.children.length;j++){
			//var points = this.children[j].realpoints();
			var points = this.children[j].getpoints();
			for(var i=0;i<points.length;i++){
				//var pos = points[i].getpos();
				var pos = this.pos.mappoint(points[i]);
				if(minx == null || minx>pos[0]){
					minx = pos[0];
				}
				if(maxx == null || maxx<pos[0]){
					maxx = pos[0];
				}
				if(miny == null || miny>pos[1]){
					miny = pos[1];
				}
				if(maxy == null || maxy<pos[1]){
					maxy = pos[1];
				}
			}
		}
		//set dimensions
		this.shape.set([minx,miny],0);
		this.shape.set([maxx,miny],1);
		this.shape.set([maxx,maxy],2);
		this.shape.set([minx,maxy],3);
	}
	
	this.move = function(dx,dy){
		this.pos.move(dx,dy);
	}
	this.rotatemove = function(dx,dy){
		this.pos.rotatemove(dx,dy);
		if(this.storepos !=null){
			this.storepos = myvec.add(this.storepos,[dx,dy]);
		}
	}
	this.moveto = function(p2){
		var po;
		if(this.storepos ==null){
			po = this.pos.getpoint();
		}
		else{
			po = this.storepos;
		}
		var diff = myvec.subtract(p2,po);
		this.rotatemove(diff[0],diff[1]);
	}
	this.dragmove = function(p1,p2){
		this.pos.dragmove(p1,p2);
	}
	this.rotpos = function(){
		var p1 = this.shape.points[3].getpoint();
		var p2 = this.shape.points[0].getpoint();
		var v = myvec.subtract(p2,p1);
		v = myvec.mult(v,0.6);
		var p = this.pos.getpoint();
		p = myvec.add(p,v);
		return p;
	}
	this.minusonce = function(){
		for(var i=0;i<this.children.length-1;i++){
			for(var j=i+1;j<this.children.length;j++){
				if(this.children[i].shapecollide(this.children[i])){
					var ns = builder.subtract(this.children[i],this.children[j]);
					this.remove(this.children[i]);
					this.remove(this.children[j]);
					//this.add(ns);
					console.log(ns.length);
					for(var i=0;i<ns.length;i++){
						this.add(ns[i]);
					}
					return true;
				}
			}
		}
		return false;
	}
	this.addonce = function(){
		for(var i=0;i<this.children.length-1;i++){
			for(var j=i+1;j<this.children.length;j++){
				if(this.children[i].shapecollide(this.children[i])){
					var ns = builder.add(this.children[i],this.children[j]);
					this.remove(this.children[i]);
					this.remove(this.children[j]);
					this.add(ns);
					return true;
				}
			}
		}
		return false;
	}
	this.intersect1 = function(){
		for(var i=0;i<this.children.length-1;i++){
			for(var j=i+1;j<this.children.length;j++){
				if(this.children[i].shapecollide(this.children[i])){
					var ns = builder.intersect(this.children[i],this.children[j]);
					if(ns==null){
						return null;
					}
					this.remove(this.children[i]);
					this.remove(this.children[j]);
					this.add(ns);
					return true;
				}
			}
		}
		return false;
	}
	this.intersect = function(){
		var co = true;
		var i =0;
		var limit = 3;
		while(co){
			co = this.intersect1();
			i++;
			if(i>limit){
				break;
			}
			return null;
		}
	}
	this.minus = function(){
		var co = true;
		var i =0;
		var limit = 3;
		while(co){
			co = this.minusonce();
			i++;
			if(i>limit){
				break;
			}
			return null;
		}
	}
	//combine shapes together
	this.ADD = function(){
		var co = true;
		var i =0;
		var limit = 3;
		while(co){
			co = this.addonce();
			i++;
			if(i>limit){
				break;
			}
		}
	}
	this.rotcollide = function(p){
		var p1 = this.rotpos();
		if(myvec.length(p,p1)<7){
			return this;
		}
		return null;
	}
	this.draw = function(){
		for(var i=0;i<this.children.length;i++){
			this.children[i].draw();
		}
		this.shape.draw();
		if(this.pos.colliding){
			var po = this.rotpos();
			this.Point(po[0],po[1]);
		}
		
	}
	this.Point=function(x,y){
		var np = [x,y];
		np = body.toscreen(np);
	    can.fillStyle="red";
		s=4;
		can.beginPath();
		can.arc(np[0],np[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
   }
   //collide functions
   //collide point, line and shape
	this.allcollide = function(x,y,me=true){
		if(this.islocked){
			return null;
		}
		var nm = true;
		if(body.tooltype == "subselect"
		  || body.tooltype == "bezier"){
			nm=false;
		}
		var p =this.pointcollide(x,y,nm);
		if(p!=null){
			return p;
		}
		var l =this.linecollide(x,y,me);
		if(l!=null){
			return l;
		}
		if(this.collide(x,y,me)){
			return this;
		}
		return null;
	}
   this.shapecollide = function(sh){
	   if(this.islocked){
			return false;
		}
		return this.shape.shapecollide(sh);
	}
	/*
	this.Delete = function(){
		var bsh = this.body.shapes;
		var ch = this.children;
		for(var i=0;i<ch.length;i++){
			for(var j=0;j<bsh.length;j++){
				var bch = bsh.children;
				for(var k=0;k<bch.length;k++){
					if
				}
			}
			if(bsh.includes(ch[i])){
				body.deletesh
			}
		}
		
	}
	*/
	//check if the shape has the specific child
	this.has = function(sh){
		if(this.children.length>0){
			if(this.children.includes(sh)){
				return true;
			}
		}
		return false;
	}
	this.collide = function(x,y,me=false){
		if(this.islocked){
			return false;
		}
		if(this.shape.collide(x,y)){
			if(me){
				return true;
			}
			for(var i=0;i<this.children.length;i++){
				var ans;
				if(this.children[i].border){
					ans = this.children[i].collide(x,y,me);
				}
				else{
					ans = this.children[i].collide(x,y);
				}
				if(ans){
					return true;
				}
			}
		}
		return false;
	}
	this.linecollide = function(x,y,me=true){
		if(this.islocked){
			return null;
		}
		if(me){
			return this.shape.linecollide(x,y);
		}
		else{
			for(var i=0;i<this.children.length;i++){
				var l;
				if(this.children[i].border){
					l= this.children[i].linecollide(x,y,me);
				}
				else{
					l= this.children[i].linecollide(x,y);
				}
				if(l!=null){
					return l;
				}
			}
		}
		return null;
	}
	this.pointcollide = function(x,y,me=true){
		if(this.islocked){
			return null;
		}
		if(me){
			return this.shape.pointcollide(x,y);
		}
		else{
			for(var i=0;i<this.children.length;i++){
				var p;
				if(this.children[i].border){
					p = this.children[i].pointcollide(x,y,me);
				}
				else{
					p = this.children[i].pointcollide(x,y);
				}
				if(p!=null){
					return p;
				}
			}
		}
		return null;
	}
}


function Img(src,pos,copying = false,sh = null){
	this.pos = pos;
	this.img = new Image();
	this.src = src;
	this.savesrc = null;
	this.img.src = src;
	this.shape = sh;
	this.name="image";
	this.data = [];
	
	if(body && !copying){
		if(this.shape == null){
			this.shape = body.makesquare(this.pos.getpoint(),50,50,false);
			body.bound(this.shape);
		}
		this.pos = this.shape.origin;
		this.shape.visible = false;
		this.shape.hide = true;
		this.shape.children.push(this);
		//body.shapes.push(this.shape);
		this.pos = this.shape;
	}
	this.incopy = function(sh){
		var np = this.pos.getpoint();
		var po = new point(np[0],np[1]);
		var ans = new Img(this.src,po,false,sh);
		return ans;
	}
	this.copy = function(){
		var nsh = this.shape.copy();
		var ans = new Img(this.src,this.pos.copy(),true);
		if(body){
			body.shapes.push(nsh);
		}
		ans.addshape(nsh);
		return ans;
	}
	this.addorigin = function(ori){
		this.pos = ori;
	}
	this.mirrow = function(axis){
		var nsh = this.shape.mirrow(axis);
		var ans = new Img(this.src,this.pos.copy,true);
		if(body){
			body.shapes.push(nsh);
		}
		ans.addshape(nsh);
		return ans;
	}
	this.addshape = function(sh){
		this.shape = sh;
		this.pos = sh.origin;
	}
	this.collide = function(){
		return false;
	}
	this.getpoints = function(){
		return [];
	}
	this.move = function(dx,dy){
		this.pos.move(dx,dy);
	}
	this.rotatemove = function(dx,dy){
		this.pos.rotatemove(dx,dy);
	}
	this.getpos = function(){
		var p1 = this.shape.points[0].getpoint();
		var p2 = this.shape.points[2].getpoint();
		return ([(p1[0]+p2[0])/2,(p1[1]+p2[1])/2]);
	}
	this.width = function(){
		return (this.shape.lines[0].length());
	}
	this.height = function(){
		return (this.shape.lines[1].length());
	}
	this.invert = function(w,h){
		for (var i = 0; i < this.data.length; i += 4) {
			this.data[i]     = 255 - this.data[i];     // red
			this.data[i + 1] = 255 - this.data[i + 1]; // green
			this.data[i + 2] = 255 - this.data[i + 2]; // blue
		}
		
		can.putImageData(this.data,-w/2,-h/2);
	}
	this.draw = function(){
		//var pos = this.pos.getpoint();
		var pos = this.getpos();
		pos = body.toscreen(pos);
		can.save();
		var W = this.width()*body.getscale();
		var H = this.height()*body.getscale();
		can.translate(pos[0],pos[1]);
		//this.data = can.getImageData(-W/2,-H/2,W,H);
		can.rotate(this.pos.getangle());//rotate canvas
		can.globalAlpha = this.pos.alpha;
		can.beginPath();
		can.drawImage(this.img,-W/2,-H/2,W,H);
		can.closePath();
		can.globalAlpha = 1;
		can.restore();
	}
}
function ellipse(pos,a,b,copying= false,sh=null){
	this.pos = pos;
	this.a = a;
	this.b= b;
	this.curve = new curve(this.pos,a,b);
	this.shape = sh;
	this.type = "curve";
	
	if(body && !copying){
		if(this.shape==null){
			this.shape = body.makesquare(this.pos.getpoint(),50,50,false);
			body.bound(this.shape);
		}
		this.pos = this.shape.origin;
		this.curve.pos = this.pos;
		this.shape.visible = false;
		this.shape.hide = true;
		this.shape.children.push(this);
		//testing
		this.pos = this.shape;
		this.curve.pos = this.shape;
		//body.shapes.push(this.shape);
	}
	//function
	this.incopy = function(sh){
		var np = this.pos.getpoint();
		var po = new point(np[0],np[1]);
		//manipulate shape
		var ans = new ellipse(po,this.a,this.b,false,sh);
		return ans;
	}
	this.addorigin = function(ori){
		this.pos = ori;
		this.curve.pos = ori;
	}
	this.addshape = function(sh){
		this.shape = sh;
		this.pos = sh.origin;
	}
	this.collide = function(){
		return false;
	}
	this.getpoints = function(){
		return [];
	}
	this.move = function(dx,dy){
		this.pos.move(dx,dy);
	}
	this.rotatemove = function(dx,dy){
		this.pos.rotatemove(dx,dy);
	}
	this.draw = function(){
		var pos = this.shape.points;
		//update coordinates
		this.curve.a = myvec.length(pos[0].getpoint(),pos[1].getpoint())/2;
		this.curve.b = myvec.length(pos[1].getpoint(),pos[2].getpoint())/2;
		//now draw 
		this.curve.draw();
		//this.Point();
	}
	this.Point = function(){
		var p = this.pos.getpoint();
		p = body.toscreen(p);
		can.fillStyle="black";
		s=2;
		can.beginPath();
		can.arc(p[0],p[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
	}
}
function Text(word,pos,copying = false,sh=null){
	this.pos = pos;
	this.word = word;
	this.size = 25;
	this.color = "red";
	this.font = "sans-serif";
	this.name = "text";
	this.shape = sh;
	//boolean functions
	this.ishigh = true;
	this.iscursor = false;
	this.blink = false;
	this.time = 0;
	this.maxtime = 5;
	this.index = 1;
	//highlight variables
	this.hcolor = "#aae9eb";
	this.range = null;
	
	if(body && !copying){
		if(this.shape==null){
			this.shape = body.makesquare(this.pos.getpoint(),50,50,false);
			body.bound(this.shape);
			this.word = "TEXT";
		}
		this.shape.hide = true;
		this.pos = this.shape.origin;
		this.shape.visible = false; 
		this.shape.children.push(this);
		//body.shapes.push(this.shape);
		//alway stary at the center of the bounding box
		this.pos = this.shape;
	}
	this.incopy = function(sh){
		//console.log("in");
		var np = this.pos.getpoint();
		var po = new point(np[0],np[1]);
		var ans = new Text(this.word,po,false,sh);
		ans.pos = ans.shape;
		//update answer variables
		ans.size = this.size;
		ans.color = this.color;
		ans.font = this.font;
		ans.ishigh = false;
		return ans;
	}
	this.adjust = function(){
		if(this.shape!=null){
			this.shape.setwidth(this.getwidth()+40);
			//this.shape.setheight(this.getheight());
		}
	}
	this.addorigin = function(ori){
		this.pos = ori;
	}
	this.copy = function(){
		//var nsh = this.shape.copy();
		var nsh = body.makesquare(this.pos.getpoint(),this.shape.getwidth(),this.shape.getheight(),false);
		
		var ans = new Text(this.word,this.pos.copy(),true);
		ans.size = this.size;
		ans.font = this.font;
		ans.pos = ans.shape;
		if(body){
			body.shapes.push(nsh);
		}
		ans.addshape(nsh);
		return ans;
	}
	this.clear = function(){
		this.ishigh = false;
		this.iscursor = false;
	}
	this.show = function(){
		this.ishigh = true;
		this.iscursor = false;
	}
	this.mirrow = function(axis){
		var nsh = this.shape.mirrow(axis);
		var ans = new Text(this.word,this.pos.copy,true);
		ans.size = this.size;
		ans.font = this.font;
		if(body){
			body.shapes.push(nsh);
		}
		ans.addshape(nsh);
		return ans;
	}
	this.addshape = function(sh){
		this.shape = sh;
		this.pos = sh.origin;
	}
	//functions
	this.getfont = function(s=false){
		var nsi = this.size;
		if(s && false){
			nsi *=body.getscale();
		}
		var ans = ""+nsi+"px "+this.font;
		return ans;
	}
	this.getwidth = function(w=this.word){
		can.font = this.getfont();
		return can.measureText(w).width;
	}
	this.getheight = function(){
		return this.size;
		can.font = this.getfont();
		return can.measureText(this.word).height;
	}
	this.collide = function(){
		return false;
	}
	this.getpoints = function(){
		return [];
	}
	this.move = function(dx,dy){
		this.pos.move(dx,dy);
	}
	this.rotatemove = function(dx,dy){
		this.pos.rotatemove(dx,dy);
	}
	//time function
	this.confine = function(){
		//make the index is with the confinds
		if(this.index<0){
			this.index=0;
		}
		if(this.index>this.word.length){
			this.index=this.word.length;
		}
	}
	this.shift = function(v=1){
		this.index+=v;
		this.confine();
	}
	this.update = function(){
		if(this.iscursor){
			this.time++;
			if(this.time>this.maxtime){
				this.blink = !this.blink;//alternate
				this.time=0;
			}
		}
		else{
			this.blink = false;
		}
		
	}
	this.type = function(te){
		if(te==-1){
			this.addtext(te);
			return null;
		}
		var t = te.charAt(0);
		if(body.capon && te.length>1){
			t = te.charAt(1);
		}
		this.addtext(t);
	}
	this.lastt = true;
	this.addtext = function(t){
		if(t!=" " && this.lastt){
			barn.saveshape();
			this.lastt=false;
		}
		if(t==" "){
			this.lastt= true;
		}
		if(this.ishigh){
			this.clearhigh();
			if(t==-1){
				return null;
			}
		}
		if(t==-1 && this.index==0){
			return null;
		}
		var ans ="";
		for(var i=0;i<=this.word.length;i++){
			if((i==this.index)){
				if(t!=-1){
					ans+=t;
				}
			} 
			if(t!=-1 || i!=(this.index-1)){
				if(i<this.word.length){
					ans+=this.word.charAt(i);
				}
			}
		}
		if(t==-1){
			this.index-=1;
		}
		else{
			this.index+=1;
		}
		this.word = ans;
		this.adjust();
	}
	this.drawrect = function(){
		can.fillStyle = this.hcolor;
		var w = this.getwidth();
		var h = this.getheight();
		var x = -w/2;
		var y = -h/1.2;
		if(this.range!=null && this.range.length>1){
			x = this.getx(this.range[0]);
			var x1 = this.getx(this.range[1]);
			w = Math.abs(x1-x)*body.getscale();
		}
		/*
		x*=body.getscale();
		y*=body.getscale();
		w*=body.getscale();
		h*=body.getscale();
		*/
		can.beginPath();
		can.rect(x,y,w,h);
		can.closePath();
		can.fill();
		can.fillStyle=this.pos.color;
	}
	this.collide = function(p,f=true){
		var w = this.getwidth();
		var h = this.getheight();
		var pos = this.pos.getpoint();
		var np = myvec.subtract(p,[pos[0],pos[1]]);
		np = myvec.rot(np,-this.pos.angle);
		if(Math.abs(np[0])<(w/2)){
			if(Math.abs(np[1])<(h/2)){
				if(f){
					this.findindex(np[0]);
				}
				return true;
			}
		}
	}
	this.drag = function(p){
		if(this.collide(p)){
			if(this.range!=null && this.range.length==2){
				if(this.range[0]>this.index){
					this.range[0]=this.index;
				}
				if(this.range[1]<this.index){
					this.range[1]=this.index;
				}
				if(this.range[0]<this.index && this.range[1]>this.index){
					var a = Math.abs(this.range[0]-this.index);
					var b = Math.abs(this.range[1]-this.index);
					if(a<b){
						this.range[0]= this.index;
					}
					else{
						this.range[1]= this.index;
					}
					
				}
				if(this.range[0]!=this.range[1]){
					this.ishigh = true;
					this.iscursor = false;
				}
				else{
					this.ishigh = false;
					this.iscursor = true;
				}
			}
			if(this.range==null){
				this.range = [this.index,this.index];
			}
			return true;
		}
		return false;
	}
	this.clearhigh = function(){
		this.ishigh=false;
		this.iscursor = true;
		if(this.range==null){
			this.word="";
			this.index=0;
		}
		else{
			barn.saveshape();
			this.clearrange(this.range[0],this.range[1]);
		}
		
	}
	this.clearrange = function(a,b){
		var ans = "";
		for(var i=0;i<=this.word.length;i++){
			if(i>=a && i<b){
				ans+="";
			}
			else{
				ans+=this.word.charAt(i);
			}
		}
		this.word = ans;
		this.index=a;
	}
	this.hit = function(p){
		this.range=null;
		if(this.collide(p)){
			if(!this.ishigh && !this.iscursor){
				this.ishigh =true;
			}
			else if(this.ishigh){
				this.ishigh=false;
				this.iscursor = true;
			}
			return true;
		}
		return false;
	}
	this.drawcursor = function(x=null){
		can.fillStyle = "black";
		if(x==null){
			//x = this.getwidth()/2;
			//x = this.getx()*body.getscale();
			x = this.getx()
		}
		//var h = this.getheight()*body.getscale();
		var h = this.getheight();
		can.beginPath();
		can.rect(x,-h/1.2,1,h);
		can.closePath();
		can.fill();
		can.fillStyle=this.pos.getcolor();
		
	}
	this.getx = function(i= this.index){
		if(i==0){
			return (-this.getwidth()/2);
		}
		var w = this.word.substring(0,i);
		var ans = this.getwidth(w);
		ans-=(this.getwidth()/2);
		return ans;
	}
	this.findindex = function(x){
		var pl = 0;
		var w = this.getwidth();
		x = (x+w/2);
		for(var i=0;i<=this.word.length;i++){
			var nw = this.word.substring(0,i);
			var l = this.getwidth(nw);
			if(x<l){
				this.index = i;
				if((x-pl)<(l-pl)/2){
					this.index-=1;
				}
				return null;
			}
			pl = l;
		}
		this.index = this.word.length;
	}
	this.draw = function(){
		can.fillStyle=this.pos.getcolor();
		can.textAlign = "center";
		//var h = this.getheight()*body.getscale();
		var h = this.getheight();
		var pos = this.pos.getpoint();
		pos = body.toscreen(pos);
		can.font = this.getfont(true);
		can.save();
		can.translate(pos[0],pos[1]+h/2.7);
		can.rotate(this.pos.getangle());//rotate canvas
		var sc = body.getscale();
		can.scale(sc,sc);
		//check if the highlight is on
		if(this.ishigh){
			this.drawrect();
		}
		if(this.iscursor && this.blink){
			this.drawcursor();
		}
		can.globalAlpha = this.pos.getalpha();
		can.beginPath();
		can.fillText(this.word, 0, 0); 
		can.closePath();
		can.globalAlpha = 1;
		//can.rotate(-this.pos.angle);//undo rotation
		//can.translate(-pos[0],-pos[1]);
		can.restore();
		
	}
}
//shape represented by lines
function shape(lines,copying = false){
	var myvec = new vec();
	this.lines = lines;
	this.color = "#588de2";
	this.colliding =false;
	this.type = "polygon";
	this.alpha = 1;
	this.origin = null;
	this.savepos = null;
	this.visible = true;
	this.points = []; 
	this.lineWidth = 1;
	this.border = false; // is the current shape a border?
	this.ispath = false; //is this a path or a complete shape
	this.Parent = null;
	this.hide = false;
	this.angle = 0;
	this.iscontainer=false;
	this.children = [];//for storing text and images
	this.showpoints = false;// should the points be show?
	this.iscenter = false;
	//drawing variables for connected shapes
	this.color = "#588de2";
	this.alpha = 1;
	//line variables
	this.lcolor = "#000000";
	this.lalpha = 1;
	this.lsize = 1;
	//shadow variables
	this.soffx = 0;
	this.soffy = 0;
	this.sblur = 0;
	this.scolor = "#131314";
	//path motion variables
	this.dir = 1;
	this.index = 0;
	this.path = [];
	
	//pattern action 
	this.linepos = null;
	this.linevec = [0,0];
	this.lineangle = 0;
	//function for manually manipulating shape dangerous!
	this.setwidth = function(w){
		/*
		var nx =this.get(0)[0] +w;
		var ny = this.get(1)[1];
		this.set([nx,ny],1,true);
		*/
		if(w<2){
			return null;
		}
		var po = this.get(0);
		var xdir = 1;
		if(po[0]<0){
			xdir = -1;
		}
		var np = [(Math.abs(w/2)*xdir),po[1]];
		this.set([np[0],np[1]],0,true);
		this.Parent.recal();
	}
	this.setheight = function(h){
		/*
		var nx =this.get(3)[0];
		var ny = this.get(0)[1]+h;
		this.set([nx,ny],3,true);
		*/
		var po = this.get(0);
		var ydir = 1;
		if(po[1]<0){
			ydir = -1;
		}
		var np = [po[0],(Math.abs(h/2)*ydir)];
		//this.set([np[0],np[1]],0,true);
		//this.Parent.recal();
	}
	this.getwidth = function(){
		return myvec.length(this.get(0),this.get(1))/2;
	}
	this.getheight = function(){
		return myvec.length(this.get(1),this.get(2))/2;
	}
	this.get = function(i=0){
		if(i<this.points.length){
			return this.points[i].getpos();
		}
		return null;
	}
	this.set = function(pos,i=0,ad=false){
		if(i<this.points.length){
			this.points[i].update(pos[0],pos[1],ad);
		}
	}
	//end
	this.movepath = function(dl,dir=1){
		var no = 0;
		var limit = 50;
		while(dl>0 && no<limit){
			//console.log("index is " +this.index);
			var ans = this.lines[this.index].pathmove(dl,this.linepos,dir);
			//console.log("ans is " +ans);
			this.linepos = ans[0];
			dl = ans[1];
			if(dl>0){
				this.linepos = null;
				if(dir==-1){
					this.index--;
				}
				else{
					this.index++;
				}
				this.adjindex();
			}
			no++;
		}
		return this.linepos;
	}
	this.adjindex = function(){
		if(this.index <0){
			this.index += this.lines.length;
		}
		this.index = this.index%this.lines.length;
	}
	this.startpath = function(po,an=null){
		var small = null;
		this.index=0;
		for(var i=0;i<this.lines.length;i++){
			var ns = this.lines[i].startpoint(po,an);
			if(ns!=null){
				var dist = myvec.length(ns,po);
				if(small== null || small>dist){
					small = dist;
					this.linepos = ns;
					this.index = i;
					this.linevec = myvec.subtract(po,ns);
					this.lineangle = this.lines[i].getangle();
				}
			}
		}
		return this.linepos;
	}
	this.getpathpos = function(){
		if(this.linepos==null || this.linevec==null){
			return null;
		}
		var nl = this.lines[this.index];
		//var nan =  nl.getangle() + myvec.getangle(this.linevec);
		var nan = myvec.getangle(this.linevec) + this.getpathangle();
		var nv = myvec.getvec(myvec.mag(this.linevec),nan);
		return myvec.add(this.linepos,nv);
	}
	this.getpathangle = function(){
		var na = this.lines[this.index];
		return (na.getangle()-this.lineangle);
	}
	this.getpreview = function(){
		return this.origin.preview;
	}
	this.hasb = function(){
		for(var i=0;i<this.lines.length;i++){
			if(this.lines[i].hasb()){
				return true;
			}
		}
		return false;
	}
	//get more complex shape
	this.getshape = function(){
		return builder.drawshape(this.getpoints());
	}
	//path functions
	this.initpath = function(){
		this.clear();
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			var p = points[i].getpoint();
			this.path.push(new point(p[0],p[1]));
		}
		this.dir = this.getdir();
	}
	this.getdir = function(){
		var c1=0;
		var c2=0;
		for(var i=0;i<this.lines.length;i++){
			var j = (i+1)%this.lines.length;
			var d = this.linean(this.lines[i],this.lines[j]);
			if(d==1){
				c1++;
			}
			if(d==-1){
				c2++;
			}
		}
		if(c2<c1){
			return -1;
		}
		return 1;
	}
	this.linean = function(l1,l2){
		var a1 = l1.getangle();
		var a2 = l2.getangle();
		var diff = a2-a1;
		if(diff<0){
			return -1;
		}
		if(diff>0){
			return 1;
		}
		return 0;
	}
	this.addafter = function(p,af = null){
		if(af==null){
			this.path.push(p);
			return null;
		}
		var i = this.path.indexOf(af);
		var ve = this.getvel();
		ve = 1;
		i+=ve;
		//get the right location
		while(true){
			if((ve>0 && i>=this.path.length) || (ve<0 && this.path.length<=0)){
				break;
			}
			else{
				var l1 = myvec.length(af.getpoint(),this.path[i].getpoint());
				var l2 = myvec.length(af.getpoint(),p.getpoint());
				if(l2<=l1){
					break;
				}
				else if(!this.path[i].middle){
					break;
				}
				else{
					i+=ve;
					if(i <0){
						i+= this.lines.length;
					}
					//i = i%this.lines.length;
				}
			}
		}
		this.path.splice(i,0,p);
	}
	this.lookfor = function(p){
		var po = p.getpoint();
		for(var i=0;i<this.path.length;i++){
			if(myvec.length(po,this.path[i].getpoint())<0.00001){
				return this.path[i];
			}
		}
		return null;
	}
	this.lookpoint = function(po){
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			if(myvec.length(po,points[i].getpoint())<0.00001){
				return points[i];
			}
		}
		return null;
	}
	this.find = function(p,mo=false){
		var i = this.path.indexOf(p);
		if(i==-1){
			return null;
		}
		this.index = i;
		if(mo){
			this.step();
		}
		return p;
	}
	//
	this.redirect = function(p,s2,ad=true){
		var nex = this.step();
		this.moveback();
		if(nex==null){
			return null;
		}
		//Todo: use get vec for curves
		var v = myvec.subtract(nex.getpoint(),p.getpoint());
		//v = myvec.mult(v,0.3);
		v = myvec.getvec(1,myvec.getangle(v));
		var cp = myvec.add(p.getpoint(),v);
		console.log(collider.pointcollide(new point(cp[0],cp[1]),s2));
		if(collider.pointcollide(new point(cp[0],cp[1]),s2)){
			if(ad){
				this.turn();
			}
		}
		else{
			if(!ad){
				this.turn();
			}
		}
	}
	this.entering = function(p,s2){
		var nex = this.step();
		this.moveback();
		if(nex==null){
			return false;
		}
		console.log("passed");
		//Todo: use get vec for curves
		var v = myvec.subtract(nex.getpoint(),p.getpoint());
		//v = myvec.mult(v,0.3);
		v = myvec.getvec(1,myvec.getangle(v));
		var cp = myvec.add(p.getpoint(),v);
		console.log(collider.pointcollide(new point(cp[0],cp[1]),s2));
		if(collider.pointcollide(new point(cp[0],cp[1]),s2)){
			return true;
		}
		return false;
		
	}
	//change the direction of motion
	this.turn = function(){
		if(this.dir==1){
			this.dir = -1;
			return null;
		}
		this.dir = 1;
	}
	this.step = function(){
		var v = 1;
		//console.log(this.index);
		if(this.dir!=1){
			v=-1;
		}
		var ans = this.path[this.index];
		//points[this.index].seen = true;
		this.index +=v;
		this.calindex();
		if(ans.seen){
			return null;
		}
		return ans;
	}
	this.calindex = function(){
		if(this.index <0){
			this.index += this.path.length;
		}
		this.index = this.index%this.path.length;
	}
	this.moveback = function(){
		var v = 1;
		if(this.dir!=1){
			v=-1;
		}
		this.index-=v;
		this.calindex();
	}
	this.clear = function(){
		for(var i=0;i<this.path.length;i++){
			this.path[i].seen = false;
			this.path[i].middle = false;
		}
		this.path = [];
		this.index = 0;
		this.dir = 1;
		
	}
	this.semiclear = function(){
		
	}
	this.getvel = function(){
		var v = 1;
		if(this.dir!=1){
			v=-1;
		}
		return v;
	}
	//end
	if(body){
		body.lines.push(...this.lines);
	}
	
	this.setconstraints = function(){
		for(var i=0;i<this.lines.length;i++){
			var j = (i+1)%this.lines.length;
			var nc = new opposite(this.lines[i].h2,this.lines[j].h1);
			if(body){
				body.constraint.push(nc);
			}
		}
	}
	//add constraints
	if(this.lines.length>1){
		this.setconstraints();
	}
	//getters and setters
	this.setcolor = function(c){
		this.color = c;
		//this.origin.color = c;
	}
	this.setalpha = function(a){
		this.alpha =a;
		//this.origin.alpha = a;
	}
	this.getcolor = function(c){
		return this.color;
		//return this.origin.color;
	}
	this.getalpha = function(a){
		return this.alpha;
		//return this.origin.alpha;
	}
	this.addcollide = function(a){
		this.origin.addcollide(a);
	}
	this.setradius = function(v=0){
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			points[i].r = v;
		}
	}
	this.getradius = function(){
		return this.realpoints()[0].r;
	}
	//line getters and setters
	this.setlcolor = function(c){
		this.lcolor = c;
		//this.origin.lcolor = c;
	}
	this.setlalpha = function(a){
		this.lalpha = a;
		//this.origin.lalpha = a;
	}
	this.setlsize = function(a){
		this.lsize = a;
		//this.origin.lsize = a;
	}
	this.getlcolor = function(c){
		return this.lcolor;
		//return this.origin.lcolor;
	}
	this.getlalpha = function(a){
		return this.lalpha;
		//return this.origin.lalpha;
	}
	this.setshadow = function(x,y,bl,c=this.scolor){
		this.soffx = x;
		this.soffy = y;
		this.sblur = bl;
		this.scolor = c;
	}
	this.getlsize = function(a){
		return this.lsize;
		//return this.origin.lsize;
	}
	//end
	this.mypoints = function(me=true){
		return this.points;
	}
	this.mylines = function(me=true){
		return this.lines;
	}
	this.myorigin = function(me=true){
		return this.origin;
	}
	
	this.setborder = function(co){
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			points[i].container = co;
		}
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].h1.container = co;
			this.lines[i].h2.container = co;
		}
		this.origin.oldcontainer = co;
	}
	//turn of bezier point
	this.offbezier = function(){
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].isb = false;
		}
	}
	this.onborder = function(sh=null){
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			points[i].atborder = true;
			points[i].myshape = sh;
		}
	}
	//add lines
	this.addlines = function(nl){
		if(!this.ispath){
			return null;
		}
		//this.lines.splice(0,1);
		//this.points.splice(this.points.length-1,1);
		if(nl.length>0){
			var l = this.lastline();
			//var bl = new line(l.p2,nl[0].p2);
			//this.lines.push(bl);
		}
		for(var i=1;i<nl.length;i++){
			//nl[i].reverse();
			var bl = this.lastline();
			var ol = nl[i].copy();
			if(bl!=null){
				//this.lockhandle(bl,ol);
			}
			this.lines.push(ol);
		}
		this.points = this.realpoints(); 
	}
	this.addpoints = function(pos){
		if(!this.ispath){
			return null;
		}
		this.lines.splice(this.lines.length-1,1);
		this.points.splice(this.points.length-1,1);
		for(var i=1;i<pos.length;i++){
			this.push(pos[i]);
		}
	}
	//add a point to the end of the path
	this.push = function(p,nor=true){
		if(!this.ispath){
			return null;
		}
		var pos = p.getpoint();
		var l = this.getend();
		var ep = this.pointcollide(pos[0],pos[1],false,true);
		var over = false;
		if(nor && ep!=null && ep!=l && ep.end && this.points.length>2){
			p = ep;
			over = true;
		}
		if(this.ispath){
			l.end = false;
			p.end = true;
			if(!over){
				this.points.push(p);
				var l1 = this.lastline();
				this.lines.push(new line(l,p));
				var l2 = this.lastline();
				if(l1!=null){
					this.lockhandle(l1,l2);
				}
			}
			else{
				this.lines.splice(this.lines.length-1,1);
				this.points.splice(this.points.length-1,1);
				l = this.getend();
				var bl =this.lastline();
				this.lines.push(new line(l,p));
				var l1 = this.lastline();
				var l2 = this.lines[0];
				if(bl!=null){
					this.lockhandle(bl,l1);
				}
				if(l1!=null){
					this.lockhandle(l1,l2);
				}
				bl.h2.adjust();
				
			}
			this.removeorigin();
			this.getorigin();
			/*
			if(this.Parent!=null){
				this.Parent.addorigin(this.origin);
			}
			*/
		}
		if(over){
			this.ispath = false;
			this.showpoints = false;
			return null;
		}
		return p;
	}
	//get the last point added
	this.getend = function(no=0){
		return this.points[this.points.length-1-no];
	}
	//get the last line in the array
	this.lastline = function(){
		if(this.lines.length ==0){
			return null;
		}
		return this.lines[this.lines.length-1];
	}
	this.deleteend = function(){
		if(this.ispath){
			this.lines.splice(this.lines.length-1,1);
			this.points.splice(this.points.length-1,1);
			if(this.points.length>0){
				this.points[this.points.length-1].end = true;
			}
		}
	}
	this.getlend = function(no=0){
		if((this.lines.length-no) <=0){
			return null;
		}
		return this.lines[this.lines.length-1-no];
	}
	this.lockhandle = function(l1,l2){
		var nc = new opposite(l1.h2,l2.h1);
		if(body){
			body.constraint.push(nc);
		}
	}
	//functions
	this.getpoints  = function(off=false){
		var ans = [];
		var points = [];
		for(var i=0;i<this.lines.length;i++){
			var end = false;
			if(this.ispath && i == this.lines.length-1){
				end = true;
			}
			var pos = this.lines[i].drawpoints(off,end);
			points.push(...pos);
			/*
			for(var j=0;j<pos.length;j++){
				if(!ans.includes(pos[j])){
					ans.push(pos[j]);
					points.push(...pos[j].getpoints());
				}
			}
			*/
		}
		return points;
	}
	//get real point classes
	this.realpoints = function(){
		var ans = [];
		for(var i=0;i<this.lines.length;i++){
			var pos = this.lines[i].getpoints();
			for(var j=0;j<pos.length;j++){
				if(!ans.includes(pos[j])){
					ans.push(pos[j]);
				}
			}
		}
		return ans;
	}
	this.gethandles = function(){
		var ans = [];
		var al = false;
		if(body.tooltype == "bezier"){
			al = true;
		}
		for(var i=0;i<this.lines.length;i++){
			ans.push(...this.lines[i].gethandles(al));
		}
		return ans;
	}
	this.forcehandles = function(){
		var ans = [];
		for(var i=0;i<this.lines.length;i++){
			ans.push(this.lines[i].h1);
			ans.push(this.lines[i].h2);
		}
		return ans;
	}
	if(body){
		body.points.push(...this.realpoints());
		this.points = this.realpoints();
	}
	this.getorigin = function(){
		var points = this.getpoints();
		var sum = [0,0];
		var count =0;
		for(var i=0;i<points.length;i++){
			sum = myvec.add(sum,points[i]);
			count++;
		}
		var ans = [sum[0]/count,sum[1]/count];
		this.origin = new point(ans[0],ans[1]);
		this.addorigin(this.origin);
	}
	//point function
	this.getpoint = function(){
		var points = this.getpoints();
		var sum = [0,0];
		var count =0;
		for(var i=0;i<points.length;i++){
			sum = myvec.add(sum,points[i]);
			count++;
		}
		return [sum[0]/count,sum[1]/count];
	}
	this.getangle = function(){
		if(this.points.length>3){
			var p1 = this.points[3].getpoint();
			var p2 = this.points[0].getpoint();
			var a = myvec.angle(p2,p1);
			a += (Math.PI/2);
			return a;
		}
		return this.origin.getangle();
	}
	this.removeorigin = function(){
		var points = this.realpoints();
		this.angle = this.origin.getangle();//save angle
		for(var i=0;i<points.length;i++){
			var pos = points[i].getpoint();
			points[i].update(pos[0],pos[1]);
			points[i].removeconstraint(points[i].origin);
			points[i].origin = null;
			if(points[i].angle==0){
				points[i].angle = this.angle;//testing
			}
			else{
				this.angle = points[i].angle;
			}
			var ind = this.origin.children.indexOf(points[i]);
			body.deleteEle(this.origin.children,ind);
		}
		this.origin = null;
	}
	this.ungroup = function(a=0){
		var newa = a + this.angle;
		this.removeorigin();
		this.getorigin();
		this.clearangle();//testing
		if(body){
			body.bound(this,newa,false);
		}
		/*
		this.origin.angle = newa;
		for(var i=0;i<this.children.length;i++){
			this.children[i].pos = this.origin;
		}
		*/
	}
	this.clearangle = function(){
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			points[i].angle = 0;
		}
	}
	this.addorigin = function(ori,child= true){
		this.origin = ori;
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			var pos = points[i].getpoint();
			var np = myvec.subtract(pos,this.origin.getpoint());
			points[i].origin = this.origin;
			points[i].update(np[0],np[1]);
		}
		if(child){
			this.origin.children.push(...points);
		}
		/*
		for(var i=0;i<this.children.length;i++){
			this.children[i].addorigin(this.origin);
		}
		*/
		
	}
	if(!copying){
		this.getorigin();
		if(body){
			this.origin.children.push(...this.realpoints());
		}
	}
	//transfer shape properties to self
	this.transfer = function(ans){
		ans.visible = this.visible;
		//copy properties
		ans.color = this.color;
		ans.alpha = this.alpha;
		//line variables
		ans.lcolor = this.lcolor;
		ans.lalpha = this.lalpha;
		ans.lsize = this.lsize;
		//shadow variables
		ans.soffx = this.soffx;
		ans.soffy = this.soffy;
		ans.sblur = this.sblur;
		ans.scolor = this.scolor;
	}
	this.beziertransfer = function(sh){
		for(var a=0;a<this.lines.length;a++){
			for(var b=0;b<sh.lines.length;b++){
				if(this.lines[a].hasb()){
					if(this.lines[a].isthesame(sh.lines[b])){
						this.lines[a].transfer(sh.lines[b]);
					}
					else if(this.lines[a].risthesame(sh.lines[b])){
						this.lines[a].rtransfer(sh.lines[b]);
					}
				}
			}
		}
		this.radiustransfer(sh);
	}
	this.radiustransfer = function(sh){
		var myp = this.realpoints();
		var otp = sh.realpoints();
		for(var a=0;a<myp.length;a++){
			for(var b=0;b<otp.length;b++){
				if(myp[a].issame(otp[b])){
					otp[b].r = myp[a].r;
				}
			}
		}
	}
	this.copy = function(){
		var lines = [];
		for(var i=0;i<this.lines.length;i++){
			lines.push(this.lines[i].copy());
		}
		var ori = this.origin.copy();
		var ans =  new shape(lines,true);
		//make good
		if(!this.visible){
			ans = body.makesquare(this.origin.getpoint(),this.getwidth(),this.getheight(),false);
		}
		ans.ispath = this.ispath;
		ans.showpoints = this.showpoints;
		ans.addorigin(ori);
		//clear copies
		this.origin.clearcopy();
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			points[i].clearcopy();
		}
		this.transfer(ans);
		//this.beziertransfer(ans);
		//add children
		for(var i=0;i<this.children.length;i++){
			this.children[i].incopy(ans);
		}
		return ans;
	}
	this.getcopy = function(){
		//return this;
		var ans =  this.copy();
		if(this == body.tempshape){
			body.storeshape = ans;
			//get temp pos
			if(body.temppos!=null){
				body.storepos = this.lookpoint(body.temppos.getpoint());
			}
			
		}
		return ans;
	}
	this.mirrowmove = function(axis){
		//mirrow handles
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].mirrowhandle(axis);
		}
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			points[i].mirrowmove(axis);
		}
		this.origin.mirrowmove(axis);
		for(var i=0;i<points.length;i++){
			points[i].addorigin(this.origin);
		}
		//consolidate handles
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].fixhandles();
		}
		//mirrow shadow
		var or = axis.p1.getpoint();
		var sp = new point(this.soffx+or[0],this.soffy+or[1]);
		sp.mirrowmove(axis);
		sp = sp.getpoint();
		this.soffx = sp[0]-or[0];
		this.soffy = sp[1]-or[1];
	}
	this.mirrow = function(axis){
		var co = this.copy();
		co.mirrowmove(axis);
		return co;
	}
	this.move = function(dx,dy){
		this.origin.move(dx,dy);
	}
	this.rotatemove = function(dx,dy){
		this.origin.rotatemove(dx,dy);
	}
	this.dragmove = function(p1,p2){
		this.origin.dragmove(p1,p2);
	}
	this.findtext = function(){
		for(var i=0;i<this.children.length;i++){
			if(this.children[i].name == "text"){
				return this.children[i];
			}
		}
		return null;
	}
	//function
	this.draw = function(){
		if(this.origin.preview){
			//draw all kids related
			for(var i=0;i<this.children.length;i++){
				this.children[i].draw();
			}
			if(this.children.length>0){
				return null;
			}
			if(!this.visible){
				return null;
			}
			//save
			var ls = this.getlsize();
			var lc = this.getlcolor();
			var fs = this.getcolor();
			//setproperties
			this.setlsize(2);
			this.setcolor("#f8fc16");
			this.setlcolor("#f8fc16");
			//draw
			var points = this.getpoints();
			points = body.alltoscreen(points);//scale
			this.doublestroke(points,"#f8fc16");
			can.globalAlpha = 0.1;
			this.fill(points);
			can.globalAlpha = 1;
			//restore
			this.setlsize(ls);
			this.setcolor(fs);
			this.setlcolor(lc);
			return null;
		}
		//draw all kids related
		for(var i=0;i<this.children.length;i++){
			this.children[i].draw();
		}
		if(this.hide){
			return false;
		}
		//draw lines first
		var points = this.getpoints();
		points = body.alltoscreen(points);//scale
		if(this.lineWidth>0){
			if(this.border){
				if(this.origin.colliding){
					this.stroke(points,"#a0a4aa");
					this.drawpoints(null,"#a0a4aa");
				}
			}
			else{
				this.doublestroke(points);
				if(this.showpoints){
					this.drawpoints(null);
				}
			}
			
		}
		//draw the polygon based on the points representing the shape
		if(this.visible && !this.ispath){
			can.globalAlpha = this.getalpha();
			this.fill(points);
			can.globalAlpha = 1;
			//var po = this.origin.getpoint();
			//this.Point(po[0],po[1]);
		}
		if(!this.border){
			if(body.tooltype == "bezier"){
				this.drawhandles();
				this.drawselected();
			}
			else if(this.showpoints){
				this.drawhandles();
			}
			else{
				this.drawselected();
			}
			
		}
		
	}
	this.drawhandles = function(){
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].drawhandles(this.getlcolor());
		}
	}
	this.fillshadow = function(){
		if(this.soffx!=0 || this.soffy!=0){
			return true;
		}
		return false;
	}
	//fill shape with a color
	this.fill = function(points){
		can.fillStyle=this.getcolor();
		if(this.fillshadow()){
			can.shadowOffsetX = this.soffx;
			can.shadowOffsetY = this.soffy;
			can.shadowBlur = this.sblur;
			can.shadowColor=this.scolor;
		}
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=0;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		can.fill();
		can.closePath();
		//reset shadow
		can.shadowOffsetX = 0;
		can.shadowOffsetY = 0;
		can.shadowBlur = 0;
		
	}
	this.stroke = function(points,st=null){
		if(this.getlsize()==0){
			return null;
		}
		can.strokeStyle="black";
		can.lineWidth = this.lineWidth;
		var ls = can.lineWidth;
		if(!this.iscontainer){
			can.strokeStyle= this.getlcolor();
			can.lineWidth = this.getlsize()*body.getscale();
			can.globalAlpha = this.getlalpha();
		}
		if(st!=null){
			can.strokeStyle=st;
		}
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=0;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		if(!this.ispath){
			can.lineTo(points[0][0],points[0][1]);
		}
		can.stroke();
		can.closePath();
		can.globalAlpha = 1;
		can.lineWidth = ls;
	}
	this.doublestroke = function(points,st=null){
		this.stroke(points,st);
		var l = points.length;
		if(!this.ispath && l>2){
			var np = [points[l-2],points[l-1]];
			for(var i=0;i<points.length-2;i++){
				np.push(points[i])
			}
			this.stroke(np,st);
		}
	}
	this.drawpoints = function(points=null,st=null){
		if(points==null){
			points = this.getpoints(true);
			points = body.alltoscreen(points);
		}
		for(var i=0;i<points.length;i++){
			//var pos = points[i].getpoint();
			var pos = points[i];
			this.Point(pos[0],pos[1],st);
		}
	}
	this.drawselected = function(){
		this.drawpoints(this.selectedpoints());
	}
	this.selectedpoints = function(){
		var ans = [];
		var points = this.realpoints();
		for(var i=0;i<points.length;i++){
			if(points[i].colliding){
				ans.push(points[i].getpoint());
			}
		}
		return ans;
	}
	this.Point=function(x,y,st=null){
	    can.fillStyle="black";
		if(st!=null){
			can.fillStyle=st;
		}
		s=4;
		can.beginPath();
		can.arc(x,y,s,0,2*Math.PI);
		can.fill();
		can.closePath();
	}
	//functions
	this.shapecollide = function(sh){
		return collider.collide(this,sh);
	}
	
	this.collide = function(x,y){
		if(this.ispath){
			var l = this.linecollide(x,y);
			if(l==null){
				return false;
			}
			return true;
		}
		return collider.pointcollide(new point(x,y),this);
	}
	this.linecollide = function(x,y){
		for(var i=0;i<this.lines.length;i++){
			if(this.lines[i].collide([x,y])){
				return this.lines[i];
			}
		}
		return null;
	}
	this.reverse = function(){
		this.points.reverse();
		this.lines.reverse();
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].reverse();
		}
	}
	this.pointcollide = function(x,y,end=false,off=false){
		var points = [];
		//add handles
		if(!off){
			points.push(...this.gethandles());
		}
		//add main points
		points.push(...this.realpoints());
		var r = 9;
		for(var i=0;i<points.length;i++){
			var cu = new curve(points[i].getpoint(),r,r);
			if(collider.pointcurvecollide(new point(x,y),cu)){
				if(end){
					if(points[i].end){
						return points[i];
					}
				}
				else{
					return points[i];
				}
				
			}
		}
		return null;
	}
}


