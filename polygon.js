//polygon class consisting line to represent the outline the 
//lines of the polygon
function polygon(points,origin=null){
	this.lines = [];
	this.angle = 0;
	this.origin =[0,0];
	this.vel=[0,0];
	this.lastvel = [0,0];
	this.angle=0;
	this.points =[];
	this.tpoints=[];
	//boolean variables
	this.isRigid = false;
	this.colliding =false;
	this.isCyclic = true;
	//attributes
	this.color = "blue";
	this.type = "polygon";
	
	//calculate the origin of a polygon
	this.getorigin=function(ps=null){
		if(ps==null){
			ps = this.getpoints();
		}
		ans=[0,0];
		for(var i=0;i<ps.length;i++){
			ans[0]+=ps[i][0];
			ans[1]+=ps[i][1];
		}
		ans[0]= ans[0]/ps.length;
		ans[1]=ans[1]/ps.length;
		ori = new point(ans[0],ans[1]);
		return ori;
	}
	//get a list of point coordinates for all points
	this.getpoints = function(){
		ret=[];
		for(var i=0;i<this.points.length;i++){
			ret.push(this.points[i].getpoint());
		}
		//alert("ans "+this.points[3].getpoint());
		return ret;
	}
	
	//set up
	if(typeof points[0].getpoint === "function"){
		this.points = points;
		if(origin!=null){
			this.origin=origin;
		}
		else{
			this.origin=this.getorigin(this.getpoints());
			//adjust point values
			for(var i=0;i<points.length;i++){
				points[i].origin = this.origin;
				points[i].x = points[i].x - this.origin.x;
				points[i].y = points[i].y - this.origin.y;
				
			}
		}
		
	}
	else{
		if(origin!=null){
			this.origin=origin;
		}
		else{
			this.origin=this.getorigin(points);
		}
		//convert point to object
		for(var i=0;i<points.length;i++){
			ori = this.origin.getpoint();
			x = points[i][0]-ori[0];
			y = points[i][1]-ori[1];
			this.points.push(new point(x,y,this.origin));
		}
		//alert(this.points[1].getpoint());
	}
	//set up line
	for(var i=0;i<points.length;i++){
		j=i+1;
		if(i>points.length-2){
			j=0;
		}
		this.lines.push(new line(points[i],points[j]));
	}
	
	
	//modifiying functions
	this.move = function(dx,dy){
		if(!this.isRigid){
			this.origin.move(dx,dy);
		}
	}
	this.dragmove = function(p1,p2){
		this.origin.dragmove(p1,p2);
	}
	//rotate about origin default
	this.rotate =function(da,about=null){
		if(!this.isRigid && this.isCyclic){
			this.origin.angle+=da;
		}
	}
	this.retpoints = function(){
		return this.points;
	}
	//function
	this.draw = function(){
		//draw the polygon based on the points representing the shape
		this.fill(this.getpoints());
		
		//drawthis. origin
		var ori = this.origin.getpoint();
		//alert(ori);
		this.Point(ori[0],ori[1]);
		//draw t points
		for(var i=0;i<this.tpoints.length;i++){
			this.Point(this.tpoints[i][0],this.tpoints[i][1]);
		}
		this.tpoints=[];
	}
	
	this.addForce=function(F){
		if(!this.isRigid){
			this.vel[0]+=F[0];
			this.vel[1]+=F[1];
		}
		
	}
	//update the shape through on time step
	this.update=function(t=1){
		var newv = myvec.mult(this.vel,t);
		this.move(newv[0],newv[1]);
	}
	//fill shape with a color
	this.fill = function(points){
		can.fillStyle=this.color;
		if(this.colliding){
			can.fillStyle="green";
		}
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=0;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		can.fill();
	}
	//draw a point
	this.Point=function(x,y){
	    can.fillStyle="black";
		s=2;
		can.beginPath();
		can.arc(x,y,s,0,2*Math.PI);
		can.fill();
		can.closePath();
   }
}

