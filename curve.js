
function tricurve(pos,p1,p2,r=null){
	var myvec = new vec();
	this.pos = pos;
	this.p1 = p1;
	this.p2 = p2;
	this.r = r;
	this.interval = 0.5;
	this.alpha = 1;
	if(r==null){
		this.r = myvec.length(pos.getpoint(),p1.getpoint())
	}
	//function to get the point on an ellipse at an angle
	this.getpointat = function(angle){
		//length = this.getlength(angle);
		var length = this.r;
		var p = myvec.getvec(length,angle);
		return p;
	}
	this.getvec = function(p1,p2){
		var a = myvec.angle(p1.getpoint(),p2.getpoint());
		return myvec.getvec(1,a);
	}
	this.getpoints = function(p1=this.p1,p2=this.p2,store=[],type ="none"){
		if(type!="front" && type!="both"){
			store.push(p1.getpoint());
		}
		if(myvec.length(p1.getpoint(),p2.getpoint())>this.interval){
			var v1 = this.getvec(this.pos,p1);
			var v2 = this.getvec(this.pos,p2);
			var nv = myvec.add(v1,v2);
			nv = myvec.normalize(nv,this.r);
			var tp = myvec.add(this.pos.getpoint(),nv);
			var np = new point(tp[0],tp[1]);
			store = this.getpoints(p1,np,store,"front");
			store = this.getpoints(np,p2,store,"both");
		}
		if(type!="back" && type!="both"){
			store.push(p2.getpoint());
		}
		return store;
	}
	
	
}
function curve(pos,a,b,sector = (Math.PI*2),origin=null){
	this.pos=pos;
	this.a=a;
	this.b=b;
	this.sector = sector;
	myvec = new vec();
	this.angle=0;
	this.type = "curve";
	this.index = 1;
	this.color =  "#588de2";
	this.colliding=false;
	this.vel=[0,0];
	this.alpha=1;
	this.lastvel = [0,0];
	this.isRigid=false;
	this.isCyclic=true;
	
	//setup convert to point
	if(typeof this.pos.getpoint === "function"){
		no=1;//do nothing
	}
	else{
		this.pos = new point(this.pos[0],this.pos[1]);
	}
	//update origin if necessary
	if(origin!=null){
		this.pos.origin=origin;
	}
	//getters and setters
	this.setcolor = function(c){
		this.pos.color = c;
	}
	this.setalpha = function(a){
		this.pos.alpha = a;
	}
	this.getcolor = function(c){
		return this.pos.color;
	}
	this.getalpha = function(a){
		return this.pos.alpha;
	}
	//line getters and setters
	this.setlcolor = function(c){
		this.pos.lcolor = c;
	}
	this.setlalpha = function(a){
		this.pos.lalpha = a;
	}
	this.setlsize = function(a){
		this.pos.lsize = a;
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
	//end
	this.draw = function(){
		//vary angle by 360 at a certain interval
		pos = this.pos.getpoint();
		interval = 0.1;
		angle=0;
		points = [];
		var ls = can.lineWidth;
		//set line variables
		can.strokeStyle= this.getlcolor();
		can.lineWidth = this.getlsize();
		can.globalAlpha = this.getlalpha();
		//end
		while(angle<this.sector){
			//translate
			p1= this.getpointat(angle);
			p2= this.getpointat(angle+interval);
			//translate
			p1 = [p1[0]+pos[0],p1[1]+pos[1]];
			p2 = [p2[0]+pos[0],p2[1]+pos[1]];
			points.push(p1);
			//draw
			//this.Line(p1[0],p1[1],p2[0],p2[1]);
			//increment
			angle+=interval;
		}
		//scale
		points = body.alltoscreen(points);
		this.doublestroke(points);
		can.lineWidth = ls;
		can.globalAlpha = this.pos.alpha;
		if(this.pos.getpreview()){
			can.globalAlpha = 0.1;
		}
		this.fill(points);
		can.globalAlpha = 1;
	}
	//function to get the point on an ellipse at an angle
	this.getpointat = function(angle){
		length = this.getlength(angle);
		p = myvec.getvec(length,angle);
		return p;
	}
	//collision functions
	this.pointcollide = function(p){
		pos = this.pos.getpoint();
		angle = myvec.angle(this.pos,p);
		length = this.getlength(angle);//calculate the radius at that angle
		if(myvec.length(this.pos,p)<=length){
			return true;
		}
		return false;
	}
	this.pcollide = function(p){
		return this.pointcollide(p);
	}
	this.getpoints = function(){
		pos = this.pos.getpoint();
		interval = 0.1;
		angle=0;
		points = [];
		while(angle<this.sector){
			//translate
			p1= this.getpointat(angle);
			p1 = myvec.add(p1,this.pos.getpoint());
			points.push(p1);
			//increment
			angle+=interval;
		}
		return points;
	}
	//drawing functions
	this.rot = function(p){
		var X=p[0]*Math.cos(this.angle)
		       -p[1]*Math.sin(this.angle);
		var Y=p[1]*Math.cos(this.angle)
		       +p[0]*Math.sin(this.angle);
		return [X,Y];
	}

	//a different get length fucntion
	this.getlength = function(angle){
		angle = this.minus(angle,this.pos.getangle());
		a = angle % (Math.PI/2);
		edge = Math.floor(angle/(Math.PI/2));
		//assign edge values
		if(edge%2==0){
			s=this.a;//start angle
			e=this.b;//end angle
		}
		else{
			s=this.b;
			e=this.a;
		}
		//new
		var dem = (Math.pow(s,2)*Math.pow(Math.sin(a),2));
		dem+= (Math.pow(e,2)*Math.pow(Math.cos(a),2));
		dem = Math.pow(dem,0.5);
		var length = (s*e)/dem;
		return length;
	}
	this.gety = function(x,a,b){
		var ans = Math.pow(x,2)/Math.pow(a,2);
		ans = 1- ans;
		ans = Math.pow(b,2)*ans;
		ans = Math.pow(ans,0.5);
		/*
		var x = s*Math.cos(a);
		var y = this.gety(x,s,e);
		var length = Math.pow(x,2)+Math.pow(y,2);
		length=Math.pow(length,0.5);
		*/
		return ans;
	}
	this.move = function(dx,dy){
		//update velocity of the shape
		if(!this.isRigid){
			this.pos.move(dx,dy);
		}
	}
	this.rotatemove = function(dx,dy){
		//update velocity of the shape
		if(!this.isRigid){
			this.pos.rotatemove(dx,dy);
		}
	}
	this.expand = function(p1,p2){
		var nl = myvec.length(this.pos.getpoint(),p2);
		var angle = myvec.angle(this.pos.getpoint(),p);
		angle = this.minus(angle,this.pos.getangle());
		a = angle % (Math.PI/2);
		edge = Math.floor(angle/(Math.PI/2));
		var s = (nl*Math.cos(a));
		var e = (nl*Math.sin(a));
		var s = nl;
		var e = nl;
		if(edge%2==0){
			this.a =s;//start angle
			this.b = e;//end angle
		}
		else{
			this.b =s;
			this.a = e;
		}
	}
	this.rotate =function(da,about=null){
		if(!this.isRigid && this.isCyclic){
			this.pos.angle+=da;
		}
	}
	this.addForce=function(F){
		//alert("the force is "+F);
		if(!this.isRigid){
			this.vel[0]+=F[0];
			this.vel[1]+=F[1];
		}
		
	}
	this.collide = function(p){
		var r = 7;
		var angle = myvec.angle(this.pos.getpoint(),p);
		var length = this.getlength(angle);//calculate the radius at that angle
		if(myvec.length(this.pos.getpoint(),p)<=length+(r/2)){
			if(myvec.length(this.pos.getpoint(),p)>=length-(r/2)){
				return true;
			}
		}
		return false;
	}
	//update the shape through on time step
	this.update=function(t=1){
		newv = myvec.mult(this.vel,t);
		this.move(newv[0],newv[1]);
	}
	//minus two angles from each other
	this.minus = function(a1,a2){
		ans=a1-a2;
		while(ans<0){
			ans+=(2*Math.PI);
		}
		return ans;
	}
	this.pointadjust = function(){}
	//drawing functions
	this.Line=function(x1,y1,x2,y2,c="#000000"){
		can.strokeStyle=c;
		can.beginPath();
		can.moveTo(x1,y1);
		can.lineTo(x2,y2);
		can.stroke();
		can.closePath();
   }
   this.Point=function(x,y){
	    //can.fillStyle="red";
		var np = body.toscreen([x,y])
		s=2;
		can.beginPath();
		can.arc(np[0],np[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
   }
   //fill shape with a colorDepth
   this.fill = function(points,c="blue"){
	  can.fillStyle=this.pos.color;
	  if(this.colliding){
		  can.fillStyle="green";
	  }
	  if(this.pos.fillshadow()){
		can.shadowOffsetX = this.pos.soffx;
		can.shadowOffsetY = this.pos.soffy;
		can.shadowBlur = this.pos.sblur;
		can.shadowColor=this.pos.scolor;
	  }
	  if(this.pos.getpreview()){
			can.fillStyle= "#f8fc16";
		}
	  can.beginPath();
	  can.moveTo(points[0][0],points[0][1]);
	  for(var i=0;i<points.length;i++){
		  can.lineTo(points[i][0],points[i][1]);
	  }
	  can.fill();
	  //reset shadow
	  can.shadowOffsetX = 0;
	  can.shadowOffsetY = 0;
	  can.shadowBlur = 0;
   }
   //draw color path
   this.stroke = function(points){
	   if(this.getlsize()==0){
			return null;
		}
		var ls = can.lineWidth;
		//set line variables
		can.strokeStyle= this.getlcolor();
		can.lineWidth = this.getlsize();
		can.globalAlpha = this.getlalpha();
		if(this.pos.getpreview()){
			can.strokeStyle= "#f8fc16";
			can.lineWidth = 2*body.getscale();
			can.globalAlpha = 0.9;
		}
		//end
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=0;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		can.lineTo(points[0][0],points[0][1]);
		can.stroke();
		can.closePath();
		can.globalAlpha = 1;
		can.lineWidth = ls;
	}
	this.doublestroke = function(points){
		this.stroke(points);
		var l = points.length;
		if(l>2){
			var np = [points[l-2],points[l-1]];
			for(var i=0;i<points.length-2;i++){
				np.push(points[i])
			}
			this.stroke(np);
		}
	}
	
}





