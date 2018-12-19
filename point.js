
function point(x,y,base=null){
	var myvec = new vec();
	this.origin=base;
	this.type = "point";
	this.x=x;
	this.y=y;
	this.last = [x,y]; // the last position
	this.ratio = [0,0];
	this.vel=[0,0];
	this.angle=0;
	this.connections = [];
	this.children = [];
	this.r =0;
	this.end=false;
	this.constraints =[];
	this.moved = false;
	this.rotated = false;
	this.lastcopy = null;
	this.vec = [0,-1];
	this.container = null;//box where the point is stored
	this.headshape = null;
	this.hlock = true;// should the handle distances be held constant?
	this.ishandle = false;
	this.atborder = false;
	this.myshape = null;
	this.intype = null;
	this.lines = []; // list of connected lines
	this.handles = [];//list of all handles connect to the point
	this.topcontainer = null;
	this.saveh1 = null;
	this.saveh2 = null;
	//adjusting variables
	this.adj1 = null;
	this.adj2 = null;
	//drawing variables for connected shapes
	this.color = "#588de2";
	this.colliding =false;
	this.alpha = 1;
	//line function
	this.lcolor = "#000000";
	this.lalpha = 1;
	this.lsize = 1;
	this.seen = false;//has the pathing function been here
	//path variables
	this.middle = false;
	this.preview = false;
	
	//border-radius functions
	//check if the point has any handles connected to it
	this.geth1 = function(){
		for(var i=0;i<this.connections.length;i++){
			var n = this.connections[i];
			if(n.hasb() && this == n.p1){
				return [n.h1.x,n.h1.y];
			}
		}
		return null;
	}
	this.geth2 = function(){
		for(var i=0;i<this.connections.length;i++){
			var n = this.connections[i];
			if(n.hasb() && this == n.p2){
				return [n.h2.x,n.h2.y];
			}
		}
		return null;
	}
	this.getvec = function(p1,p2){
		var a = myvec.angle(p1.getpoint(),p2.getpoint());
		return myvec.getvec(1,a);
	}
	this.setradius = function(v=0){
		if(this.container!=null){
			this.r = v;
		}
	}
	//check if connected handles are connected
	this.hasb = function(){
		for(var i=0;i<this.lines.length;i++){
			var l = this.lines[i];
			if(l.hasb()){
				return true;
			}
		}
		
		return false;
	}
	this.getradius = function(){
		return this.r;
	}
	//make a line with the connections
	this.getline = function(i){
		if(this.connections.length>i){
			return new line(this,this.connections[i]);
		}
		return null;
	}
	this.addcollide = function(a,me= true){
		if(me){
			this.colliding=a;
		}
		if(this.origin!=null && this.atborder){
			this.origin.addcollide(a);
		}
	}
	//get the center of th border radius that would be drawn
	this.getcenter = function(){
		//console.log(this.connections.length);
		if(this.connections.length>1){
			var r = this.r;
			var l1 = myvec.length(this.getpoint(),this.connections[0].getpoint());
			var l2 = myvec.length(this.getpoint(),this.connections[1].getpoint());
			var li = [l1,l2];
			for(var i=0;i<li.length;i++){
				var nl = li[i]/1.5;
				if(r>nl){
					//r = li[i]/2;
					r = nl;
				}
			}
			//calculate center
			var v1 = this.getvec(this,this.connections[0]);
			var v2 = this.getvec(this,this.connections[1]);
			var nv = myvec.add(v1,v2);
			nv = myvec.normalize(nv,r);
			var np = myvec.add(this.getpoint(),nv);
			return np;
		}
		return null;
	}
	this.issame = function(p){
		if(myvec.length(this.getpoint(),p.getpoint())<0.001){
			return true;
		}
		return false;
	}
	this.getpoints = function(){
		if(this.r == 0){
			return [this.getpoint()];
		}
		var c = this.getcenter();
		if(c==null){
			return [this.getpoint()];
		}
		var cpos = new point(c[0],c[1]);
		var l1 = this.getline(0);
		var l2 = this.getline(1);
		//get the points
		var p1 = l1.closestpoint(cpos);
		var p2 = l2.closestpoint(cpos);
		if(p1 == null || p2 == null){
			return [this.getpoint()];
		}
		var np1 = new point(p1[0],p1[1]);
		var np2 = new point(p2[0],p2[1]);
		var cu = new tricurve(cpos,np1,np2);
		if(this.end){
			cu = new tricurve(cpos,np2,np1);
		}
		//console.log(cu.getpoints());
		return cu.getpoints();
		return [p1,p2];
	}
	//remove connection
	this.remove = function(p){
		var ans = [];
		var i = this.connections.indexOf(p);
		if(i>-1){
			this.connections.splice(i,1);
		}
	}
	//rotate angle
	this.rot=function(x,y,angle){
		var X=x*Math.cos(angle) -y*Math.sin(angle);
		
		var Y=y*Math.cos(angle) +x*Math.sin(angle);
		return [X,Y];
	}
	//get angle
	this.getangle = function(limit =null){
		if(this.origin==null){
			return this.angle;
		}
		if(limit!=null){
			if(limit==0){
				return this.angle;
			}
			limit--;
		}
		return (this.angle + this.origin.getangle(limit));
	}
	//get the coordinates of the point
	this.getpoint = function(){
		ans = [this.x,this.y];
		
		if(this.origin!=null){
			var l=null;
			if(this.ishandle){
				//l=0;
			}
			//rotate about origin
			ans = this.rot(this.x,this.y,this.origin.getangle(l));
			//increment relative to origin
			ans = this.add(ans,this.origin.getpoint());
		}
		return ans;
	}
	this.mappoint = function(p){
		var ans = myvec.subtract(p,this.getpoint());
		ans = this.rot(ans[0],ans[1],-this.getangle());
		return ans;
	}
	this.getpos = function(ori=null){
		return [this.x,this.y];
	}
	//replace add origin to the last origin recursively
	this.pushorigin = function(p){
		if(this.origin == null){
			this.origin = p;
		}
		else{
			this.origin.pushorigin(p);
		}
		
	}
	//make this point the origin of the parameter
	this.addpoint = function(p){
		p.origin = this;
	}
	//return current position as a class
	this.copy = function(){
		if(this.lastcopy!=null){
			return this.lastcopy;
		}
		var po = this.getpoint();
		var ans = new point(po[0],po[1]);
		ans.angle = this.angle;
		ans.r = this.r;
		ans.end = this.end;
		ans.hlock = this.hlock;
		ans.ishandle = this.ishandle;
		this.lastcopy = ans;
		//this.copyconstraint(); //make sure all constraints are copied
		return ans;
	}
	this.mirrow = function(axis){
		var co = this.copy();
		co.mirrowmove(axis);
		return co;
	}
	this.mirrowmove = function(axis){
		var pos = this.getpoint();
		var ansp = axis.closestpoint(this);
		var dv = myvec.subtract(ansp,pos);
		dv = myvec.mult(dv,2);
		var np = myvec.add(pos,dv);
		//update positions
		this.x = np[0];
		this.y = np[1];
		//mirrow angle
		//origin is not applicable
		this.origin = null;
	}
	this.mirrowangle = function(an,axis){
		var po = this.getpoint();
		var ve = myvec.getvec(1,an);
		var np = myvec.add(ve,po);
		var p1 = new point(po[0],po[1]);
		var p2 = new point(np[0],np[1]);
		p1.mirrowmove(axis);
		p2.mirrowmove(axis);
		return myvec.angle(p1.getpoint(),p2.getpoint());
	}
	this.getaxis = function(dp=null){
		var po = this.getpoint();
		var an = this.getangle();
		if(dp!=null){
			var mi = myvec.subtract(dp,po);
			var an = myvec.getangle(mi);
			//an+= (Math.PI/2);
		}
		an+= (Math.PI/2);
		var p1 =  new point(po[0],po[1]);
		var diff = myvec.getvec(1,an);
		var npo = myvec.add(po,diff);
		var p2 = new point(npo[0],npo[1]);
		return new line(p1,p2);
	}
	this.removeorigin = function(){
		var pos = this.getpoint();
		this.x = pos[0];
		this.y = pos[1];
		this.origin = null;
	}
	//add origin add make the necessary adjustments
	this.addorigin = function(ori){
		var np = myvec.subtract(this.getpoint(),ori.getpoint());
		np = ori.norm(np);
		//update pos
		this.x = np[0];
		this.y = np[1];
		this.origin = ori;
	}
	this.norm = function(p1){
		var pos = this.rot(p1[0],p1[1],-this.getangle());
		return pos;
	}
	this.copyconstraint = function(){
		for(var i=0;i<this.constraints.length;i++){
			this.constraints[i].copy();
		}
	}
	this.clearcopy = function(){
		this.lastcopy = null;
	}
	//return the sum of the point and vector
	this.addto = function(v){
		return new point(this.getpoint()[0]+v[0],this.getpoint()[1]+v[1]);
	}
	this.stillmove = function(dx,dy){
		var pos = [];
		for(var i=0;i<this.children.length;i++){
			pos.push(this.children[i].getpoint());
		}
		this.x+=dx;
		this.y+=dy;
		var np = this.getpoint();
		for(var i=0;i<this.children.length;i++){
			var an = myvec.subtract(pos[i],np);
			this.children[i].rotatemove(an[0],an[1],false);
		}
	}
	//move the points position
	this.move = function(dx,dy,ad=true){
		this.x+=dx;
		this.y+=dy;
		if(ad){
			this.adjust();
		}
		/*
		this.last = this.getpoint();
		if(this.origin==null){
			this.x+=dx;
			this.y+=dy;
		}
		else{
			this.origin.move(dx,dy);
		}
		*/
	}
	this.rotatemove = function(dx,dy,ad=true){
		var ans  = [dx,dy];
		if(this.origin!=null){
			ans = this.rot(dx,dy,-this.origin.getangle());
		}
		this.x+=ans[0];
		this.y+=ans[1];
		if(ad){
			this.adjust();
		}
		if(this.container!=null){
			this.container.recal();
			this.container.shape.points[0].adjust();//make sure the origin is at the center
		}
		
	}
	this.moveto = function(p2){
		var diff = myvec.subtract(p2,this.getpoint());
		this.rotatemove(diff[0],diff[1]);
	}
	//make sure the point is within constraint
	this.adjust = function(){
		for(var i=0;i<this.constraints.length;i++){
			this.constraints[i].adjust(this);
		}
	}
	//remove from constraints
	this.removeconstraint = function(c){
		var ans = [];
		for(var i=0;i<this.constraints.length;i++){
			if(this.constraints[i].contains(c)){
				var a =0;
			}
			else{
				ans.push(this.constraints[i]);
			}
		}
		this.constraints = ans;
	}
	this.dragmove = function(p1,p2){
		var a1 = myvec.angle(this.getpoint(),p1);
		var a2 = myvec.angle(this.getpoint(),p2);
		this.angle+= (a2 - a1);
	}
	this.update = function(x,y,ad=false){
		this.x = x;
		this.y = y;
		if(ad){
			this.adjust();
			if(this.container!=null){
				this.container.recal();
				this.container.shape.points[0].adjust();//make sure the origin is at the center
			}
		}
	}
	//add two vectors
	this.add = function(v1,v2){
		ans=[];
		for(var i=0;i<v1.length;i++){
			ans.push(v1[i]+v2[i]);
		}
		return ans;
	}
}


