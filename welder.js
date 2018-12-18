//Class for creating complex shapes
function welder(){
	this.store = null;
	//
	this.drawshape = function(points){
		var nps = [];
		for(var i=0;i<points.length;i++){
			var np = new point(points[i][0],points[i][1]);
			nps.push(np);
		}
		return this.getshape(nps);
	}
	//create a shape from points
	this.getshape = function(points,sh=null){
		var poses = [];
		var lines = [];
		for(var i=0;i<points.length;i++){
			var pos1 = points[i].getpoint();
			var np = new point(pos1[0],pos1[1]);
			if(i==0){
				np.end = true;
			}
			poses.push(np);
			
		}
		for(var j=0;j<poses.length;j++){
			var k = (j+1)%poses.length;
			var pos2 = poses[k];
			var l = new line(poses[j],pos2);
			lines.push(l);
		}
		var ans = new shape(lines);
		if(sh!=null){
			sh.transfer(ans);
			sh.beziertransfer(ans);
		}
		return ans;
	}
	this.makeshape = function(points){
		body.bound(this.getshape(points));
	}
	this.getother = function(s,sh1,sh2){
		if(s==sh1){
			return sh2;
		}
		return sh1;
	}
	this.add = function(sh1,sh2,ad=true){
		sh1.initpath();
		sh2.initpath();
		var nlines = collider.combine(sh1,sh2);
		this.store = new shape(nlines);
		var points = [];
		var conti = true;
		var sh = sh1; //start with the first shape
		//var p = sh.step();
		var p = this.getstart(sh1,sh2,ad);
		if(p == null){
			//Todo check if it is inside
			return null;
		}
		points.push(p);
		//console.log(p.getpoint());
		p.seen = true;
		while(conti){
			var p = sh.step();
			if(p==null){
				conti= false;
			}
			else{
				points.push(p);
				//console.log(p.getpoint());
				p.seen = true;
				if(p.middle){
					//console.log("middle");
					sh = this.getother(sh,sh1,sh2);
					sh.find(p);
					//console.log("calculating");
					if(sh.entering(p,this.getother(sh,sh1,sh2))){
						//console.log("Entering!");
						sh.turn();
					}
					//sh.redirect(p,this.getother(sh,sh1,sh2),ad);
					sh.find(p,true);
				}
			}
		}
		//this.notseen(sh2);
		sh1.clear();
		sh2.clear();
		var ans = this.getshape(points,sh1);
		sh2.beziertransfer(ans);
		if(this.store!=null){
			this.store.beziertransfer(ans);
		}
		return ans;
		//this.makeshape(points);
		
	}
	this.notseen = function(sh){
		var pa = sh.path;
		for(var i=0;i<pa.length;i++){
			if(!pa[i].seen){
				console.log("Not seen");
			}
		}
		
	}
	this.getstart = function(sh1,sh2,ad = true){
		var conti = true;
		var p = null;
		var no=0;
		var limit = sh1.path.length;
		for(var i=0;i<sh1.path.length;i++){
			if(p!=null){
				//p.seen=true;;
			}
			//p = sh1.step();
			p = sh1.path[i];
			if(p == null){
				//console.log("LoLoLo");
				return null;
			}
			if(!p.middle && !p.seen){
				if(collider.pointcollide(p,sh2)){
					if(!ad){
						sh1.index = (i+sh1.getvel());
						sh1.calindex();
						return p;
					}
				}
				else{
					if(ad){
						sh1.index = (i+sh1.getvel());
						sh1.calindex();
						return p;
					}
				}
			}
			/*
			if(no>=limit){
				return null;
			}
			no++;
			*/
		}
		return null;
	}
	this.subtract = function(sh1,sh2){
		var ans = [];
		sh1.initpath();
		sh2.initpath();
		collider.combine(sh1,sh2);
		while(true){
			var p = this.getstart(sh1,sh2,true);
			if(p==null){
				sh1.clear();
				sh2.clear();
				return ans;
			}
			var an = this.subtract1(sh1,sh2,p);
			if(an!=null){
				ans.push(an);
			}
			//return ans;
		}
		return ans;
	}
	this.subtract1 = function(sh1,sh2,p=null){
		//sh1.initpath();
		//sh2.initpath();
		//collider.combine(sh1,sh2);
		var points = [];
		var conti = true;
		var sh = sh1; //start with the first shape
		//var p = sh.step();
		if(p==null){
			p = this.getstart(sh1,sh2,true);
		}
		if(p == null){
			//Todo check if it is inside
			return null;
		}
		points.push(p);
		//console.log(p.getpoint());
		p.seen = true;
		while(conti){
			var p = sh.step();
			if(p==null){
				conti= false;
			}
			else{
				points.push(p);
				//console.log(p.getpoint());
				p.seen = true;
				if(p.middle){
					sh = this.getother(sh,sh1,sh2);
					sh.find(p);
					if(sh == sh1){
						if(sh.entering(p,this.getother(sh,sh1,sh2))){
							//console.log("Entering!");
							sh.turn();
						}
						else{
							//console.log("NOT! Entering!");
						}
					}
					else{
						if(!sh.entering(p,this.getother(sh,sh1,sh2))){
							//console.log("Entering!");
							sh.turn();
						}
						else{
							//console.log("NOT! Entering!");
						}
					}
					sh.find(p,true);
				}
			}
		}
		//sh1.clear();
		//sh2.clear();
		return this.getshape(points,sh1);
		
	}
	this.intersect = function(sh1,sh2,ad=true){
		var nl = collider.ncombine(sh1,sh2);
		var ans = new shape(nl[0]);
		console.log(ans);
		return ans;
		sh1.initpath();
		sh2.initpath();
		collider.combine(sh1,sh2);
		var points = [];
		var conti = true;
		var sh = sh1; //start with the first shape
		//var p = sh.step();
		var p = this.getstart(sh1,sh2,false);
		if(p == null){
			//Todo check if it is inside
			return null;
		}
		points.push(p);
		//console.log(p.getpoint());
		p.seen = true;
		while(conti){
			var p = sh.step();
			if(p==null){
				conti= false;
			}
			else{
				points.push(p);
				p.seen = true;
				if(p.middle){
					sh = this.getother(sh,sh1,sh2);
					sh.find(p);
					if(!sh.entering(p,this.getother(sh,sh1,sh2))){
						sh.turn();
					}
					sh.find(p,true);
				}
			}
		}
		sh1.clear();
		sh2.clear();
		return this.getshape(points,sh1);
		
	}
	/*
	this.intersect = function(sh1,sh2){
		var ma = this.add(sh1,sh2);
		var e1 = this.subtract(sh1,sh2);
		var e2 = this.subtract(sh2,sh1);
		var ans = this.subtract(e1,ma);
		ans = this.subtract(ans,e2);
		return this.add(e1,e2);
	}
	*/
}
function storegrid(){
	//store shapes
	this.before = [];
	this.after = [];
	this.variables = ["mytext","temppos","temppos"];
	this.shapes = null;
	//extra varaibles
	this.mytext = null;
	this.temppos = null;
	this.tempshape = null;
	this.current = selection;
}

function Store(){
	this.index = -1;
	this.maxindex = 30;
	this.grids = [];
	this.roll = false;
	
	this.saveshape = function(be,af=[]){
		this.grids = this.grids.slice(0,(this.index+1));
		var sg = new storegrid();
		/*
		for(var i=0;i<be.length;i++){
			sg.before.push(be[i]);
		}
		for(var i=0;i<af.length;i++){
			sg.after.push(af[i]);
		}
		
		console.log("Before is "+be);
		console.log("After is "+af);
		*/
		sg.shapes = body.copyshapes();
		sg.mytext = body.mytext;
		sg.temppos = body.storepos;
		sg.tempshape = body.storeshape;
		this.grids.push(sg);
		this.index++;
		this.calibrate();
		this.roll = false;
	}
	this.savetemps = function(){
		this.grids = this.grids.slice(0,(this.index+1));
		var sg = new storegrid();
		
		sg.mytext = body.mytext;
		sg.temppos = body.temppos;
		sg.tempshape = body.tempshape;
		/*
		if(this.tempshape!=null){
			
		}
		*/
		this.grids.push(sg);
		this.index++;
		this.calibrate();
		this.roll = false;
	}
	this.savetemp = function(pos,sh=null){
		this.grids = this.grids.slice(0,(this.index+1));
		var sg = new storegrid();
		sg.temppos = pos;
		sg.tempshape = sh;
		this.index++;
		this.calibrate();
		this.roll = false;
	}
	this.savetext = function(tex){
		this.grids = this.grids.slice(0,(this.index+1));
		var sg = new storegrid();
		sg.mytext = tex;
		this.index++;
		this.calibrate();
		this.roll = false;
	}
	this.calibrate = function(){
		if(this.maxindex<this.index){
			this.grids.splice(0,1);
			this.index--;
		}
		
	}
	//save the last screen state before 
	this.lastsave = function(){
		if(!this.roll && this.index>=0 && (this.index==this.grids.length-1)){
			var sg = new storegrid();
			if(body.tempshape!=null){
				sg.shapes = body.copyshapes();
			}
			sg.mytext = body.mytext;
			sg.temppos = body.storepos;
			sg.tempshape = body.storeshape;
			this.grids.push(sg);
		}
	}
	this.undo = function(){
		if(body.mytext!=null){
			body.mytext.clear();
			body.mytext = null;
		}
		
		this.lastsave();//make sure last state is saved
		if(this.index>=0 && this.index==this.grids.length-1){
			this.index--;
		}
		if(this.index>=0 && this.index<this.grids.length){
			var sg = this.grids[this.index];
			if(sg.shapes!=null){
				body.shapes = sg.shapes; 
			}
			body.mytext = sg.mytext;
			body.temppos = sg.temppos;
			body.tempshape = sg.tempshape;
			this.index--;
			this.roll = true;
			//update pointer
			if(selection!=null){
				selection.classList.remove("selected");
			}
			sg.current.classList.add("selected");
			selection = sg.current;
		}
			
	}
	this.redo = function(){
		if(body.mytext!=null){
			body.mytext.clear();
			body.mytext = null;
		}
		this.index++;
		if(this.index==0){
			this.index++;
		}
		if(this.index>=0 && this.index<this.grids.length){
			var sg = this.grids[this.index];
			if(sg.shapes!=null){
				body.shapes = sg.shapes; 
			}
			body.mytext = sg.mytext;
			body.temppos = sg.temppos;
			body.tempshape = sg.tempshape;
			this.roll = true;
			//update pointer
			if(selection!=null){
				selection.classList.remove("selected");
			}
			sg.current.classList.add("selected");
			selection = sg.current;
		}
		else if(this.index>=0){
			this.index --;
		}
	}
}

















