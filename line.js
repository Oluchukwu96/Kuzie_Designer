
function tline(p1,p2,p3,p4){
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;
	this.p4 = p4;
	this.type ="line";
	this.dx = 0.2;
	this.times = [];//array to save the times of all points
	//x is between one and zero
	this.getat = function(x1,x2,x3,x4,t=0){
		var ans = Math.pow((1-t),3)*x1;
		ans+= (3*Math.pow((1-t),2)*t*x2);
		ans+= (3*(1-t)*Math.pow(t,2)*x3);
		ans+=(Math.pow(t,3)*x4);
		return ans;
	}
	this.getpointat = function(t){
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		var p3 = this.p3.getpoint();
		var p4 = this.p4.getpoint();
		this.l = 0;
		var x = this.getat(p1[0],p2[0],p3[0],p4[0],t);
		var y = this.getat(p1[1],p2[1],p3[1],p4[1],t);
		return [x,y];
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
		//can.lineTo(points[0][0],points[0][1]);
		can.stroke();
	}
	this.getdt = function(t){
		var dt = 5;
		this.l = myvec.length(this.p1.getpoint(),this.p4.getpoint());
		if(this.l<0.5){
			return dt;
		}
		dt= dt/this.l;
		return dt;
	}
	//split for 0<=t<=1
	this.frontsplit = function(t=0.5){
		var points = [this.p1.getpoint(),this.p2.getpoint(),
					this.p3.getpoint(),this.p4.getpoint()];
		var ans = [];
		var no = 0;
		while(points.length>1){
			ans.push(points[0]);
			points= this.addall(points,t);
			no++;
		}
		ans.push(points[0]);
		return new tline(this.P(ans[0]),this.P(ans[1]),this.P(ans[2]),
				  this.P(ans[3]));
	}
	this.backsplit = function(t=0.5){
		var points = [this.p1.getpoint(),this.p2.getpoint(),
					this.p3.getpoint(),this.p4.getpoint()];
		var ans = [];
		var no = 0;
		while(points.length>1){
			ans.push(points[points.length-1]);
			points= this.addall(points,t);
			no++;
		}
		ans.push(points[0]);
		return new tline(this.P(ans[0]),this.P(ans[1]),this.P(ans[2]),
				  this.P(ans[3]));
	}
	this.betweensplit = function(t1=0.33,t2=0.67){
		var ans = this.backsplit(t1);
		var nt = (1-t2)/(1-t1);
		ans = ans.backsplit(nt);
		return ans;
	}
	this.polate = function(x1,x2,t){
		return (x1+(x2-x1)*t);
	}
	this.getcenter = function(p1,p2,t=0.5){
		var ans = [this.polate(p1[0],p2[0],t),this.polate(p1[1],p2[1],t)];
		return ans;
	}
	this.addall = function(points,t){
		var ans = [];
		//console.log(points);
		for(var i=0;i<points.length-1;i++){
			ans.push(this.getcenter(points[i],points[i+1],t));
		}
		return ans;
	}
	this.P = function(n){
		return new point(n[0],n[1]);
	}
	this.testsplit = function(t=0.5){
		var n1 = this.p1.copy();
		var n4 = this.getpointat(t);
		var v1 = myvec.subtract(this.p2.getpoint(),this.p1.getpoint());
		var v2 = myvec.subtract(this.p3.getpoint(),this.p4.getpoint());
		var v1 = myvec.mult(v1,t);
		var v2 = myvec.mult(v2,(1-t));
		n2 = myvec.add(this.p1.getpoint(),v1);
		n3 = myvec.add(n4,v2);
		return new tline(n1,this.P(n2),this.P(n3),this.P(n4));
	}
	this.getpoints = function(){
		var t = 0;
		var dt = 0.02;
		var ans = [];
		this.times = [];
		this.l = myvec.length(this.p1.getpoint(),this.p4.getpoint());
		if(this.l==0){
			return ans;
		}
		while(t<1){
			ans.push(this.getpointat(t));
			this.times.push(t);
			t+=this.getdt(t);
		}
		ans.push(this.getpointat(1));
		return ans;
	}
	this.getline = function(){
		var nl = new line(this.p1,this.p4);
		var h1 = myvec.subtract(this.p2.getpoint(),this.p1.getpoint());
		var h2 = myvec.subtract(this.p3.getpoint(),this.p4.getpoint());
		nl.h1.rotatemove(h1[0],h1[1]);
		nl.h2.rotatemove(h2[0],h2[1]);
		return nl;
	}
	this.getlines = function(){
		var ans = [];
		var points = this.getpoints();
		for(var i=0;i<points.length-1;i++){
			var p1 = new point(points[i][0],points[i][1]);
			var p2 = new point(points[i+1][0],points[i+1][1]);
			ans.push(new line(p1,p2));
		}
		return ans;
	}
	this.drawpoint = function(po){
		var p = po.getpoint();
		can.fillStyle="black";
		s=4;
		can.beginPath();
		can.arc(p[0],p[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
	}
	this.draw = function(){
		var points = this.getpoints();
		this.drawpoint(this.p1);
		this.drawpoint(this.p2);
		this.drawpoint(this.p3);
		this.drawpoint(this.p4);
		this.strokepoints([this.p1.getpoint(),this.p2.getpoint()]);
		this.strokepoints([this.p3.getpoint(),this.p4.getpoint()]);
		this.strokepoints(points);
	}
}


function line(p1,p2,dir=1){
	var myvec = new vec();
	//variables
	this.p1 = p1;
	this.p2 = p2;
	this.p1.connections.push(this.p2);
	this.p2.connections.push(this.p1);
	this.type = "line";
	this.index = 1;
	this.dir = dir; //either 1 or 2
	this.dist = 3;
	this.isaxis = false;
	this.color = "black";
	this.alpha = 1;
	//bezier function
	this.h1 = new point(0,0,this.p1); //bezier handle one
	this.p1.handles.push(this.h1);
	this.p1.lines.push(this);
	this.h2 = new point(0,0,this.p2);//bezier handle two
	this.p2.handles.push(this.h2);
	this.p2.lines.push(this);
	this.h1.ishandle = true;
	this.h2.ishandle = true;
	this.isb = true; // is this line a bezier line?
	//functions
	this.transfer = function(l){
		l.isb = this.isb;
		l.h1.ishandle = this.h1.ishandle;
		l.h2.ishandle = this.h2.ishandle;
		//calculate position
		var nh1 = this.h1.getpoint();
		var nh2 = this.h2.getpoint();
		nh1 = myvec.subtract(nh1,this.p1.getpoint());
		nh2 = myvec.subtract(nh2,this.p2.getpoint());
		//update
		l.h1.rotatemove(nh1[0],nh1[1],false);
		l.h2.rotatemove(nh2[0],nh2[1],false);
		//transfer border radius
		l.p1.r = this.p1.r;
		l.p2.r = this.p2.r;
		
	}
	this.rtransfer = function(l){
		l.isb = this.isb;
		l.h1.ishandle = this.h2.ishandle;
		l.h2.ishandle = this.h1.ishandle;
		//calculate position
		var nh1 = this.h1.getpoint();
		var nh2 = this.h2.getpoint();
		nh1 = myvec.subtract(nh1,this.p1.getpoint());
		nh2 = myvec.subtract(nh2,this.p2.getpoint());
		//update
		l.h1.rotatemove(nh2[0],nh2[1],false);
		l.h2.rotatemove(nh1[0],nh1[1],false);
		//transfer border radius
		l.p1.r = this.p1.r;
		l.p2.r = this.p2.r;
	}
	this.isthesame = function(l){
		if(this.p1.issame(l.p1) && this.p2.issame(l.p2)){
			return true;
		}
		return false;
	}
	this.risthesame = function(l){
		if(this.p1.issame(l.p2) && this.p2.issame(l.p1)){
			return true;
		}
		return false;
	}
	this.pathmove = function(dl,Pos=null,dir=1){
		var p1 = this.p1;
		var p2 = this.p2;
		if(dir ==-1){
			p1 = this.p2;
		    p2 = this.p1;
		}
		if(Pos == null){
			Pos = p1.getpoint();
		}
		var v = this.getvec();
		if(dir ==-1){
			v = myvec.subtract(p2.getpoint(),p1.getpoint());
		}
		v = myvec.normalize(v);
		var dis = myvec.mult(v,dl);
		var np = myvec.add(Pos,dis);
		var diff = myvec.length(np,p1.getpoint()) - this.length();
		//console.log("Diff is "+diff);
		return [np,diff];
	}
	//just a normal point
	this.startpoint = function(pos,an=null){
		if(an==null){
			an = this.getangle() +(Math.PI/2);
		}
		else{
			an+=(Math.PI/2);
		}
		pos = new point(pos[0],pos[1]);
		var v = myvec.getvec(1,an);
		var newl = new line(pos.copy(),pos.addto(v));
		var p = this.intersect(newl);
		if(!this.isInside(p)){
			return null;
		}
		return p;
	}
	this.getvec = function(){
		var P1=this.p1.getpoint();
		var P2=this.p2.getpoint();
		return [P2[0]-P1[0],P2[1]-P1[1]];
	}
	this.issame = function(l){
		var v1 = this.getvec();
		var P1=this.p1.getpoint();
		var P2 = l.p1.getpoint();
		var v2 = [P2[0]-P1[0],P2[1]-P1[1]];
		var a1 = myvec.getangle(v1)+(2*Math.PI);
		var a2 = myvec.getangle(v2)+(2*Math.PI);
		var diff = Math.abs(a1-a2);
		diff = diff%Math.PI;
		if(Math.abs(diff)<0.1){
			return true;
		}
		return false;
	}
	this.getangle = function(){
		return myvec.getangle(this.getvec());
	}
	this.P1 = function(){
		return this.p1.getpoint();
	}
	this.P2 = function(){
		return this.p2.getpoint();
	}
	this.setradius = function(v=0){
		this.p1.setradius(v);
		this.p2.setradius(v);
	}
	this.getradius = function(){
		return p1.r;
	}
	this.copy = function(){
		var ans = new line(this.p1.copy(),this.p2.copy());
		ans.isaxis = this.isaxis;
		ans.dist = this.dist;
		//copy handles
		ans.h1 = new point(this.h1.x,this.h1.y,ans.p1);
		ans.h2 = new point(this.h2.x,this.h2.y,ans.p2);
		ans.h1.ishandle = this.h1.ishandle;
		ans.h2.ishandle = this.h2.ishandle;
		ans.isb = this.isb; 
		return ans;
	}
	this.mirrowhandle = function(ax){
		this.h1.mirrowmove(ax);
		this.h2.mirrowmove(ax);
	}
	this.fixhandles = function(){
		this.h1.addorigin(this.p1);
		this.h2.addorigin(this.p2);
	}
	this.reverse = function(){
		var p1 = this.p1;
		var p2 = this.p2;
		var h1 = this.h1;
		var h2 = this.h2;
		this.p1 = p2;
		this.p2 = p1;
		this.h1 = h2;
		this.h2 = h1;
	}
	this.addcollide = function(a){
		this.p1.addcollide(a,false);
	}
	//delete all relevant info 
	this.clear = function(){
		this.p1.remove(this.p2);
		this.p2.remove(this.p1);
	}
	//switch the p1 and p2 vectors
	this.reverse = function(){
		var temp = this.p1;
		this.p1 = this.p2;
		this.p2 = temp;
	}
	//get the distance between two points 
	this.length = function(){
		var x = Math.abs(this.P2()[0]-this.P1()[0]);
		var y = Math.abs(this.P2()[1]-this.P1()[1]);
		var ans = Math.pow(x,2)+Math.pow(y,2);
		ans = Math.pow(ans,0.5);
		return ans;
	}
	this.shortdistance = function(p){
		var ret = this.facingdistance(p);
		//is the ans with the boundaries of the line
		if(p1[0]>=this.P1()[0] && p1[0]<=(this.P1()[0]+this.length())){
			return ret;
		}
		return null;
	}
	this.move = function(dx,dy){
		this.p1.move(dx,dy);
		if(!this.p2.moved){
			this.p2.move(dx,dy);
		}
		this.p1.moved = false; 
		this.p2.moved = false; 
		
	}
	this.rotatemove = function(dx,dy){
		this.p1.rotatemove(dx,dy);
		if(!this.p2.moved){
			this.p2.rotatemove(dx,dy);
		}
		this.p1.moved = false; 
		this.p2.moved = false; 
	}
	this.moveto = function(p2){
		var po = this.closestpoint(new point(p2[0],p2[1]));
		var diff = myvec.subtract(p2,po);
		this.rotatemove(diff[0],diff[1]);
	}
	this.facingdistance = function(p){
		var p1 =p.getpoint();
		//rotate point
		var pv =myvec.subtract(p1,this.P1());
		pv =myvec.rot(pv,-myvec.getangle(this.getvec()));
		var p1= myvec.add(this.P1(),pv);
		return (p1[1]-this.P1()[1]);
	}
	//make the collision area face a certian point
	this.face = function(p){
		var distance = this.facingdistance(p);
		if(distance>=0){
			this.dir = 1;
		}
		else{
			this.dir = 2;
		}
	}
	this.isonside = function(p){
		var distance = this.facingdistance(p);
		if(distance==null){
			return false;
		}
		if(this.dir == 1 && distance>=0){
			return true;
		}
		if(this.dir == 2 && distance<=0){
			return true;
		}
		return false;
	}
	this.isfacing=function(p){
		if(myvec.length(this.P1(),p)==0 || myvec.length(this.P2(),p)==0){
			return true;
		}
		if(Math.abs(myvec.angle(this.P1(),this.P2())-myvec.angle(this.P1(),p))<0.01){
			return true;
		}
		return false;
	}
	this.show = function(){
		return [this.P1(),this.P2()];
	}
	this.isFacing = function(p){
		if(myvec.length(this.P1(),p)==0 || myvec.length(this.P2(),p)==0){
			return true;
		}
		var v1 = myvec.subtract(this.P2(),this.P1());
		var v2 = myvec.subtract(p,this.P1());
		if(myvec.newangle(v1,v2)<0.01){
			return true;
		}
		return false;
	}
	//line line interactions
	this.shoot = function(line){
		//shoot this line with the input line
		var ans = this.intersect(line);
		//return ans;//why?
		if(line.isfacing(ans) && this.isInside(ans)){
			return ans;
		}
		return null;
	}
	//is this line shot by a ray?
	this.isshot = function(line){
		var ans = this.shoot(line);
		if(ans!=null){
			return true;
		}
		return false;
	}
	//infinite line in both direction
	this.doubleshoot = function(l){
		var ans = this.intersect(l);
		if(this.isInside(ans)){
			return ans;
		}
		return null;
	}
	//is this line shot by a ray?
	this.isdoubleshot = function(line){
		var ans = this.doubleshoot(line);
		if(ans!=null){
			return true;
		}
		return false;
	}
	this.lineinside = function(l){
		var p1 = l.p1.getpoint();
		var p2 = l.p2.getpoint();
		if(this.isInside(p1)){
			return p1;
		}
		if(this.isInside(p2)){
			return p2;
		}
		return null;
	}
	this.checkcenter = function line(l){
		var an = myvec.angleBetween(this.getvec(),l.getvec());
		an = Math.abs(an%(Math.PI));
		if(true){
			var p = l.lineinside(this);
			if(p!=null){
				return p;
			}
			var p = this.lineinside(l);
			if(p!=null){
				return p;
			}
			
		}
		return null;
	}
	this.lcollide = function(line){
		var p = this.checkcenter(line);
		if(p!=null){
			return p;
		}
		var ans = this.intersect(line);
		if(this.isInside(ans) && line.isInside(ans)){
			return ans;
		}
		return null;
	}
	this.addtime = function(an,l,i){
		if(this.hasb()){
			var d1 = Math.abs(myvec.length(an,l.p1.getpoint()));
			var d2 = Math.abs(myvec.length(l.p2.getpoint(),l.p1.getpoint()));
			var dt = (d1/d2)*this.mytimes[i+1];
			var ans = dt+ this.mytimes[i+1];
			this.coltimes.push(ans);
		}
	}
	this.coltimes = [];
	this.timeline = function(i,ans){
		if(!this.hasb() || (i)>this.coltimes.length-1){
			return null;
		}
		var tl = new tline(this.p1,this.h1,this.h2,this.p2);
		//getpoints
		var p1 = this.p1.getpoint();
		var p2 = ans[i];
		var p3 = this.p2.getpoint();
		//get line
		var t1 = 0;
		var t2 = this.coltimes[i];
		var t3 = 1;
		if(i>0){
			t1 = this.coltimes[i-1];
			var p1 = ans[i-1];
		}
		if((i+1)<this.coltimes.length){
			t3 = this.coltimes[i+1];
			var p3 = ans[i+1];
		}
		var L1 = tl.betweensplit(t1,t2).getline();
		var L2 = tl.betweensplit(t2,t3).getline();
		L1.p1.rotatemove(p1[0],p1[1]);
		L1.p2.rotatemove(p2[0],p2[1]);
		L2.p1.rotatemove(p2[0],p2[1]);
		L2.p2.rotatemove(p3[0],p3[1]);
		return [L1,L2];
	}
	this.selfcollide = function(line){
		var ans =[];
		var ml1 = this.getlines();
		var ml2 = line.getlines();
		var t1 = this.times;
		var t2 = line.times;
		for(var i=0;i<ml1.length;i++){
			for(var j=0;j<ml2.length;j++){
				var an = ml1[i].lcollide(ml2[j]);
				//console.log(an);
				if(an!=null){
					ans.push(an);
					this.addtime(an,ml1[i],i);
					line.addtime(an,ml2[j],j);
				}
			}
		}
		return ans;
	}
	this.mytimes = [];
	this.getlines = function(){
		if(this.hasb()){
			var tl = new tline(this.p1,this.h1,this.h2,this.p2);
			var ans = tl.getlines();
			this.mytimes = tl.times;
			return ans;
		}
		else{
			this.mytimes = [0.5];
			return [this];
		}
	}
	this.iscolliding = function(line){
		var val = this.lcollide(line);
		if(val!=null){
			return true;
		}
		return false;
	}
	this.curvecollide = function(c){
		var p = this.shortestpoint(c.pos);
		if(p!=null){
			var an = myvec.angle(c.pos.getpoint(),p);
			var leng = c.getlength(an);
			if(myvec.distance(c.pos.getpoint(),p)<=length){
				return true;
			}
		}
		return false;
		//var an = myvec.angle(c.pos.getpoint(),);
	}
	this.shortestpoint = function(pos){
		var an = this.getangle() +(Math.PI/2);
		var v = myvec.getvec(1,an);
		var newl = new line(pos.copy(),pos.addto(v));
		var p = this.doubleshoot(newl);
		return p;
	}
	//just a normal point
	this.closestpoint = function(pos){
		var an = this.getangle() +(Math.PI/2);
		var v = myvec.getvec(1,an);
		var newl = new line(pos.copy(),pos.addto(v));
		var p = this.intersect(newl);
		return p;
	}
	//adjusting functions
	//return the motion vector needed to return a point to a line
	this.adjustpoint = function(pos){
		var p = this.shortestpoint(pos);
		if(p!=null){
			var ans = myvec.subtract(p,pos.getpoint());
			return [myvec.mag(ans),myvec.getangle(ans)];
		}
		return null;
	}
	//return readjustment vector a curve
	this.adjustcurve = function(c){
		var p = this.shortestpoint(c.pos);
		if(p!=null){
			var an = myvec.angle(c.pos.getpoint(),p);
			var leng = c.getlength(an);
			var dist = length - myvec.mag(c.pos.getpoint());
			var newan = an + Math.PI;
			return myvec.getvec(dist,newan);
		}
		return null;
	}
	//fundamental functions
	this.calparam=function(p1,p2){
		var dinum=p2[0]-p1[0];
		//prevent the zero error
		if(dinum===0){
			dinum=0.000001;
		}
		var m=(p2[1]-p1[1])/dinum;
		var c= p1[1] -(m*p1[0]);
		return [m,c];
	}
	this.intersect=function(line){
		var C1=this.calparam(this.p1.getpoint(),this.p2.getpoint());
		var C2=this.calparam(line.p1.getpoint(),line.p2.getpoint());
		var g=C2[0]-C1[0];
		if(g===0){
			g=0.00001;
		}
		var x=(C1[1]-C2[1])/g;
		var y=(C1[0]*x)+C1[1];
		var ans = [x,y];
		return ans;
	}
	//booleans for checking point positions
	this.isInside=function(p){
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		if(myvec.length(p1,p)==0){
			return true;
		}
		if(myvec.length(p2,p)==0){
			return false;
		}
		if(Math.abs(myvec.angle(p1,p2)-myvec.angle(p1,p))<0.01){
			if(Math.abs(myvec.angle(p2,p1)-myvec.angle(p2,p))<0.01){
				return true;
			}
		}
		return false;
	}
	this.isinside = function(p){
		//declare variables
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		
		if(myvec.length(p1,p)==0 || myvec.length(p2,p)==0){
			return true;
		}
		
		var v1 = myvec.subtract(p2,p1);
		var v2 = myvec.subtract(p,p1);
		var v3 = myvec.subtract(p1,p2);
		var v4 = myvec.subtract(p,p2);
		
		if(myvec.newangle(v1,v2)<0.01){
			if(myvec.newangle(v3,v4)<0.01){
				return true;
			}
		}
		return false;
	}
	this.collide = function(p){
		var r = 3;
		var po = new point(p[0],p[1]);
		var np = this.shortestpoint(po);
		if(np!=null){
			if(myvec.length(np,p)<=r && this.isInside(np)){
				return true;
			}
		}
		return false;
	}
	this.getpoints = function(){
		return [this.p1,this.p2];
		
	}
	this.gethandles = function(al = true){
		var stop = false;
		if(!al ){
			stop = true;
		}
		if(!this.isb || stop){
			return [];
		}
		return [this.h1,this.h2];
		var ans = [];
		if(this.hasb1()){
			ans.push(this.h1);
		}
		if(this.hasb2()){
			ans.push(this.h2);
		}
		return ans;
	}
	this.hasb = function(){
		if(this.h1.x==0 && this.h1.y==0){
			if(this.h2.x==0 && this.h2.y==0){
				return false
			}
		}
		return true;
	}
	this.hasb1 = function(){
		if(this.h1.x==0 && this.h1.y==0){
			return false;
		}
		return true;
	}
	this.hasb2 = function(){
		if(this.h2.x==0 && this.h2.y==0){
			return false;
		}
		return true;
	}
	this.offb = function(){
		this.h1.x =0;
		this.h1.y = 0;
		this.h2.x =0;
		this.h2.y = 0;
		this.p1.hlock = false;
	}
	//transfer curve properties to point
	this.giveb = function(po){
	}
	// get the point that would be used for drawing
	this.drawpoints = function(off=false,end=false){
		var ans = [this.p1.getpoint()];
		
		if(!this.p1.hasb()){
			ans = [];
			ans.push(...this.p1.getpoints());
		}
		//add tline
		if(this.isb && !off && this.hasb()){
			var tl = new tline(this.p1,this.h1,this.h2,this.p2);
			ans.push(...tl.getpoints());
		}
		if(end){
			ans.push(this.p2.getpoint());
		}
		return ans;
	}
	this.drawhandles = function(color="black",thick=1){
		if(!this.isb || !this.hasb()){
			return null;
		}
		if(this.hasb1()){
			this.strokepoints([this.h1.getpoint(),this.p1.getpoint()],color);
			this.drawpoint(this.h1,color);
		}
		if(this.hasb2()){
			this.strokepoints([this.h2.getpoint(),this.p2.getpoint()],color);
			this.drawpoint(this.h2,color);
		}
	}
	this.drawpoint = function(po,color="black"){
		var p = po.getpoint();
		p= body.toscreen(p);
		can.fillStyle=color;
		s=4;
		can.beginPath();
		can.arc(p[0],p[1],s,0,2*Math.PI);
		can.fill();
		can.closePath();
	}
	this.strokepoints = function(points,color="black"){
		if(points.length==0){
			return null;
		}
		can.strokeStyle=color;
		can.lineWidth = 1;
		points = body.alltoscreen(points);
		can.beginPath();
		can.moveTo(points[0][0],points[0][1]);
		for(var i=0;i<points.length;i++){
			can.lineTo(points[i][0],points[i][1]);
		}
		//can.lineTo(points[0][0],points[0][1]);
		can.stroke();
	}
	this.draw = function(){
		can.strokeStyle = this.color;
		var p1 = this.P1();
		var p2 = this.P2();
		p1 = body.toscreen(p1);
		p2 = body.toscreen(p2);
		can.globalAlpha = this.alpha;	
		can.beginPath();
		if(this.isaxis){
			this.drawaxis(p1,p2);
		}
		else{
			this.drawline(p1,p2);
		}
		can.closePath();
		can.stroke();
		can.globalAlpha = 1;
	}
	this.drawline = function(p1,p2){
		can.moveTo(p1[0],p1[1]);
		can.lineTo(p2[0],p2[1]);
	}
	this.drawaxis = function(p1,p2){
		var v = myvec.subtract(p2,p1);
		var drawing = true;
		var st = [p1[0],p1[1]];
		v = myvec.normalize(v,this.dist);
		while(myvec.length(p1,st)<myvec.length(p1,p2)){
			var nx = myvec.add(st,v);
			if(drawing){
				if(myvec.length(p1,nx)>myvec.length(p1,p2)){
					nx = p2;
				}
				this.drawline(st,nx);
			}
			st = nx;
			drawing = !drawing;
		}
	}
}

