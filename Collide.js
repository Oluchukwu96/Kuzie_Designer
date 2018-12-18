
//class for coordinating collisions between shapes and points
function Collide(){
	var myvec = new vec();
	this.rscale = 1;
	this.fscale = 0.95; // friction coeffient
	
	this.collide = function(s1,s2){
		//set up 
		var c =0;
		var p =0;
		var c1;
		var p1;
		
		if(s1.type == "curve"){
			c++;
			c1=s1;
		}
		else if(s1.type == "polygon"){
			p++;
			p1=s1;
		}
		if(s2.type == "curve"){
			c++;
			c1=s2;
		}
		else if(s2.type == "polygon"){
			p++;
			p1=s2;
		}
		//collision things
		if(c == 2){
			return this.curvecurvecollide(s1,s2);
		}
		if(p==2){
			return this.polygonpolygoncollide(s1,s2);
		}
		if(c==1 && p==1){
			return this.curvepolygoncollide(c1,p1);
		}
		return false;//for now
	}
	this.pointcollide = function(p,s){
		if(s.type=="curve"){
			return this.pointcurvecollide(p,s);
		}
		if(s.type=="polygon"){
			return this.pointpolygoncollide(p,s);
		}
		return false;//for now
	}

	
	this.pointcollide = function(p,s){
		if(s.type == "curve"){
			return this.pointcurvecollide(p,s);
		}
		if(s.type =="polygon"){
			return this.pointpolygoncollide(p,s);
		}
		return false;
	}
	//collide point with a line
	//point shape collision
	this.pointcurvecollide = function(p,curve){
		if(curve.type!="curve"){
			return false;
		}
		var angle = myvec.angle(curve.pos.getpoint(),p.getpoint());
		var length = curve.getlength(angle);//calculate the radius at that angle
		if(myvec.length(curve.pos.getpoint(),p.getpoint())<=length){
			return true;
		}
		return false;
	}
	this.pointpolygoncollide = function(p,poly){
		var count = 0;
		var ray = new line(p,p.addto([1,1]));
		for(var i =0;i<poly.lines.length;i++){
			if(poly.lines[i].isshot(ray)){
				count++;
			}
		}
		if(count%2==1){
			return true;
		}
		return false;//for now
	}
	//shapes colliding with one another
	this.curvecurvecollide = function(c1,c2){
		//alert("Got here");
		var a1 = myvec.angle(c1.pos.getpoint(),c2.pos.getpoint());
		var a2 = myvec.angle(c2.pos.getpoint(),c1.pos.getpoint());
		var length = c1.getlength(a1)+c2.getlength(a2);
		if(myvec.length(c1.pos.getpoint(),c2.pos.getpoint())<=length){
			return true;
		}
		return false;
	}
	this.polygonpolygoncollide = function(poly1,poly2){
		//check if poly1 is inside poly2
		if(this.pointpolygoncollide(poly2.points[0],poly1)){
			return true;
		}
		//check if any of the lines are colliding
		for(var a =0 ; a<poly1.lines.length;a++){
			for(var b =0 ; b<poly2.lines.length;b++){
				if(poly1.lines[a].iscolliding(poly2.lines[b])){
					return true;
				}
			}
		}
		//return false;
		
		return this.pointpolygoncollide(poly1.points[0],poly2);
	}
	this.lcombine = function(poly1,poly2){
		for(var a =0 ; a<poly1.lines.length;a++){
			for(var b =0 ; b<poly2.lines.length;b++){
				var p = poly1.lines[a].lcollide(poly2.lines[b]);
				if(p!=null){
					var np = new point(p[0],p[1]);
					np.middle = true;
					var op1 = poly1.lines[a].p1;
					var op2 = poly2.lines[b].p1;
					op1 = poly1.lookfor(op1);
					op2 = poly2.lookfor(op2);
					poly1.addafter(np,op1);
					poly2.addafter(np,op2);
				}
			}
		}
	}
	this.combine = function(poly1,poly2){
		var lines = [];
		for(var a =0 ; a<poly1.lines.length;a++){
			for(var b =0 ; b<poly2.lines.length;b++){
				var ans = poly1.lines[a].selfcollide(poly2.lines[b]);
				for(var i=0;i<ans.length;i++){
					var p = ans[i];
					var np = new point(p[0],p[1]);
					np.middle = true;
					var op1 = poly1.lines[a].p1;
					var op2 = poly2.lines[b].p1;
					var L1 = poly1.lines[a].timeline(i,ans);
					console.log(L1);
					if(L1!=null){
						lines.push(...L1);
					}
					var L2 = poly1.lines[b].timeline(i,ans);
					if(L2!=null){
						lines.push(...L2);
					}
					op1 = poly1.lookfor(op1);
					op2 = poly2.lookfor(op2);
					poly1.addafter(np,op1);
					poly2.addafter(np,op2);
				}
			}
		}
		return lines;
	}
	this.ncombine = function(poly1,poly2){
		var fp1 = poly1.lines[0].p1.copy();
		var fp2 = poly1.lines[0].p2.copy();
		var bp1 = poly2.lines[0].p1.copy();
		var bp2 = poly2.lines[0].p2.copy();
		var newl = [[],[]];
		for(var a =0;a<poly1.lines.length;a++){
			for(var b =0;b<poly2.lines.length;b++){
				var ans = poly1.lines[a].selfcollide(poly2.lines[b]);
				if(ans.length>0){
					var fp1 = poly1.lines[a].p1;
					var fp2 = poly1.lines[a].p2;
					var bp1 = poly2.lines[b].p1;
					var bp2 = poly2.lines[b].p2;
					for(var i=0;i<ans.length;i++){
						var np = new point(ans[0],ans[1]);
						newl[0].push(new line(fp1,np));
						newl[1].push(new line(bp1,np));
						fp1 = np;
						bp1 = np;
					}
					newl[0].push(new line(fp1,fp2));
					newl[1].push(new line(bp1,bp2));
				}
				else{
					newl[0].push(poly1.lines[a].copy());
					newl[1].push(poly2.lines[b].copy());
				}
			}
		}
		//console.log(newl);
		return newl;
	}
	this.curvepolygoncollide = function(c,poly){
		for(var a =0;a<poly.points.length;a++){
			if(this.pointcurvecollide(poly.points[a],c)){
				return true;
			}
		}
		//check if any of the lines are colliding
		for(var b = 0;b<poly.lines.length;b++){
			if(poly.lines[b].curvecollide(c)){
				return true;
			}
		}
		return this.pointpolygoncollide(c.pos,poly);;
	}
	//adjustments
	this.adjust = function(s1,s2,testv = null){
		//set up 
		var c =0;
		var p =0;
		var c1;
		var p1;
		//
		var vect=null;
		var S1=null;
		var S2=null;
		
		if(s1.type == "curve"){
			c++;
			c1=s1;
		}
		else if(s1.type == "polygon"){
			p++;
			p1=s1;
		}
		if(s2.type == "curve"){
			c++;
			c1=s2;
		}
		else if(s2.type == "polygon"){
			p++;
			p1=s2;
		}
		//determine the right function to use
		if(c==2){
			vel = myvec.subtract(s1.vel,s2.vel);
			vect = this.curvecurveadjust(s1,s2);
			S1=s1;
			S2=s2;
		}
		if(p==1 && c==1){
			vel = myvec.subtract(c1.vel,p1.vel);
			vect = this.curvepolygonadjust(c1,p1);
			S1=p1;
			S2=c1;
		}
		if(p==2){
			vel = myvec.subtract(s1.vel,s2.vel);
			vect = this.polygonpolygonadjust(s1,s2);
			S1=s1;
			S2=s2;
		}
		if(vect!=null){
			var v1 = myvec.getvec((vect[0]*0.5),vect[1]);
			//get dir 2
			var dir= myvec.getvec(1,vect[1]);
			dir= myvec.rot(dir,Math.PI); 
			var v2 = myvec.getvec((vect[0]*0.5),myvec.getangle(dir));
			//move them
			S1.move(v1[0],v1[1]);
			S2.move(v2[0],v2[1]);
		}
	}
	//curve-curve adjust
	this.curvecurveadjust = function(c1,c2,v=0){
		a1 = myvec.angle(c1.pos.getpoint(),c2.pos.getpoint());
		a2 = myvec.angle(c2.pos.getpoint(),c1.pos.getpoint());
		length = c1.getlength(a1)+c2.getlength(a2);
		diff = length-myvec.length(c1.pos.getpoint(),c2.pos.getpoint());
		if(v!=0 && v!=null){
			sub = myvec.subtract(c2.pos.getpoint(),c1.pos.getpoint());
			vsub = myvec.subtract(c1.vel,c2.vel);
			if((!c1.colliding || !c2.colliding) && myvec.isFacing(sub,vsub)){
				//calculate the new length
				diff = (length + myvec.length(c1.pos,c2.pos));
				//rotate direction
				a1 = myvec.angle(c2.pos,c1.pos);
				a2 = myvec.angle(c1.pos,c2.pos);
			}
		}
		if(diff>0){
			return [diff,a2];
		}
		return null;
	}
	this.pointcurveadjust = function(p,c,v=0){
		a1 = myvec.angle(p.getpoint(),c.pos.getpoint());
		a2 = myvec.angle(c.pos.getpoint(),p.getpoint());
		length = c.getlength(a2);
		diff = length-myvec.length(p.getpoint(),c.pos.getpoint());
		if(v!=0 && v!=null){
			sub = myvec.subtract(c.pos.getpoint(),p.getpoint());
			vsub = myvec.subtract(p.vel,c2.vel);
			if((!c1.colliding || !c2.colliding) && myvec.isFacing(sub,vsub)){
				//calculate the new length
				diff = (length + myvec.length(c1.pos,c2.pos));
				//rotate direction
				a1 = myvec.angle(c2.pos,c1.pos);
				a2 = myvec.angle(c1.pos,c2.pos);
			}
		}
		if(diff>0){
			return [diff,a2];
		}
		return null;
	}
	this.linecurveadjust = function(l,c){
		var po = l.shortestpoint(c.pos);
		if(po!=null){
			po = new point(po[0],po[1]);
			return this.pointcurveadjust(po,c);
		}
		return null;
	}
	//polygon collision helper functions
	this.pointlineadjust = function(po,tline,v=[0,0]){
		v = myvec.rot(v,Math.PI);//rotate the velocity
		var ml = new line(po,po.addto(v));
		var ans = tline.shoot(ml);
		
		if(ans!=null){
			ans = tline.adjustpoint(po);
			return ans;
		}
		if(ans!=null){
			var dist = myvec.length(po.getpoint(),ans);
			var an = myvec.angle(po.getpoint(),ans);
			return [dist,an];
		}
		return null;
		
	}
	this.pointpolygonadjust = function(p,poly,v=[0,0]){
		var ans = null;
		if(this.pointpolygoncollide(p,poly)){
			for(var i=0;i<poly.lines.length;i++){
				var vect = this.pointlineadjust(p,poly.lines[i],v);
				if(vect!=null){
					if(ans==null || ans[0]>vect[0]){
						ans = vect;
					}
				}
			}
		}
		return ans;
	}
	this.ppadjust = function(poly1,poly2,v=[0,0]){
		var ans = null;
		for(var i=0;i<poly1.points.length;i++){
			var vect = this.pointpolygonadjust(poly1.points[i],poly2,v);
			if(vect!=null){
				if(ans==null || ans[0]<vect[0]){
					ans = vect;
				}
			}
		}
		return ans;
	}
	this.polygonpolygonadjust = function(poly1,poly2,v=null){
		//create vel if no exists
		if(v == null){
			var p2 = poly2.getorigin().getpoint();
			var p1 = poly1.getorigin().getpoint();
			v = myvec.subtract(p2,p1);
			//v = myvec.subtract(poly1.lastvel,poly2.lastvel);
		}
		var ans = null;
		ans = this.ppadjust(poly1,poly2,v);
		v = myvec.rot(v,Math.PI);//turn back
		var newa= this.ppadjust(poly2,poly1,v);
		if(newa!=null){
			if(ans==null || ans[0]<newa[0]){
				ans = newa;
				ans[1]+= Math.PI; //rotate back to normal
			}
		}
		return ans;
	}
	//
	this.curvepolygonadjust = function(c,poly){
		var ans = null;
		//line first
		for(var a =0;a<poly.lines.length;a++){
			var vect = this.linecurveadjust(poly.lines[a],c);
			if(vect!=null){
				if(ans==null || ans[0]<vect[0]){
					ans = vect;
				}
			}
		}
		//points
		for(var b =0;b<poly.points.length;b++){
			var vect = this.pointcurveadjust(poly.points[b],c);
			if(vect!=null){
				if(ans==null || ans[0]<vect[0]){
					ans = vect;
				}
			}
		}
		return ans;
	}


}

