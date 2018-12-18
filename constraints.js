//make sure the each point remains vertical to each other
function vertical(p1,p2){
	this.p1 = p1;
	this.p2 = p2;
	this.p1.constraints.push(this);
	this.p2.constraints.push(this);
	this.points = [p1,p2];
	
	this.contains = function(h){
		return this.points.includes(h);
	}
	this.getother = function(p){
		if(p!=this.p1){
			return this.p1;
		}
		return this.p2;
	}
	this.adjust = function(p){
		var op = this.getother(p);
		var op1 = op.getpos();
		var pos = p.getpos();
		var v = myvec.subtract(pos,op1);
		op.move(0,v[1],false);
		op.moved = true;
	}
	this.copy = function(){
		if(this.p1.lastcopy!=null && this.p2.lastcopy!=null){
			var ans = new vertical(this.p1.lastcopy,this.p2.lastcopy);
			if(body){
				body.constraint.push(ans);
			}
			return ans;
		}
		return null;
	}
}
function horizontal(p1,p2){
	this.p1 = p1;
	this.p2 = p2;
	this.p1.constraints.push(this);
	this.p2.constraints.push(this);
	this.points = [p1,p2];
	
	this.contains = function(h){
		return this.points.includes(h);
	}
	
	this.getother = function(p){
		if(p!=this.p1){
			return this.p1;
		}
		return this.p2;
	}
	this.adjust = function(p){
		var op = this.getother(p);
		var op1 = op.getpos();
		var pos = p.getpos();
		var v = myvec.subtract(pos,op1);
		op.move(v[0],0,false);
		op.moved = true;
	}
	this.copy = function(){
		if(this.p1.lastcopy!=null && this.p2.lastcopy!=null){
			var ans = new horizontal(this.p1.lastcopy,this.p2.lastcopy);
			if(body){
				body.constraint.push(ans);
			}
			return ans;
		}
		return null;
	}
}
function center(pos,p1,p2){
	this.pos = pos;
	this.p1 = p1;
	this.p2 = p2;
	this.p1.constraints.push(this);
	this.p2.constraints.push(this);
	this.pos.constraints.push(this);
	this.points = [pos,p1,p2];
	
	this.contains = function(h){
		return this.points.includes(h);
	}
	this.getother = function(p){
		if(p!=this.p1){
			return this.p1;
		}
		return this.p2;
	}
	
	this.adjust = function(p){
		if(p==this.pos){
			return false;
		}
		//remove the origin of the children
		for(var i=0;i<this.pos.children.length;i++){
			this.pos.children[i].removeorigin();
		}
		var p1 = this.p1.getpoint();
		var p2 = this.p2.getpoint();
		//
		var npos = [(p1[0]+p2[0])/2,(p1[1]+p2[1])/2]; 
		this.pos.update(npos[0],npos[1]);
		
		for(var i=0;i<this.pos.children.length;i++){
			this.pos.children[i].addorigin(this.pos);
		}
	}
	this.copy = function(){
		if(this.pos.lastcopy!=null && this.p1.lastcopy!=null && this.p2.lastcopy!=null){
			var ans = new center(this.pos.lastcopy,this.p1.lastcopy,this.p2.lastcopy);
			if(body){
				body.constraint.push(ans);
			}
			return ans;
		}
		return null;
	}
}
//edit the dimensions of points in a bounding box
function ratio(p,box){
	this.p = p;
	this.box = box;
	this.p.constraints.push(this);
	this.points = [p,box];
	this.contains = function(h){
		return this.points.includes(h);
	}
	
	this.adjust = function(p){
		this.box.updateall();
	}
	this.copy = function(){
		return null;
	}
	
}
function opposite(p1,p2){
	this.p1 = p1;
	this.p2 = p2;
	this.points = [p1,p2];
	this.p1.constraints.push(this);
	this.p2.constraints.push(this);
	
	this.getother = function(p){
		if(p!=this.p1){
			return this.p1;
		}
		return this.p2;
	}
	this.adjust = function(p){
		var op = this.getother(p);
		if(op.origin!=null && !op.origin.hlock){
			return false;
		}
		//console.log("Opposing");
		op.x = -p.x;
		op.y = -p.y;
		return true;
	}
	
}
//make the variable is equals to the distance between the two points
function dista(cur, p1,p2){
	this.cur = cur;
	this.p1 = p1;
	this.p2 = p2;
	
	this.adjust = function(p){
		this.cur.a = myvec.length(this.p1.getpoint(),this.p2.getpoint());
	}
	
	this.copy = function(){
		return null;
	}
}
function distb(cur, p1,p2){
	this.cur = cur;
	this.p1 = p1;
	this.p2 = p2;
	
	this.adjust = function(p){
		this.cur.b = myvec.length(this.p1.getpoint(),this.p2.getpoint());
	}
	
	this.copy = function(){
		return null;
	}
}
//Path Actions
function amirrow(){
	this.index = 0;
	this.list = ["axis","mobject"];
	this.current = null;
	this.params = [];
	this.store = [];
	
	//functions
	this.init = function(){
		this.current = null;
		this.index = 0;
		this.param = [];
		this.get();
	}
	this.move = function(){
		this.index++;
		this.get();
		this.preview();
	}
	this.get = function(){
		if(this.index>=this.list.length){
			return null;
		}
		if(this.current!=null){
			this.current.style.border = "1px solid black";
		}
		this.current = document.getElementById(this.list[this.index]);
		this.current.style.border = "3px solid yellow";
	}
	this.clear = function(){
		for(var i=0;i<this.list.length;i++){
			var el = document.getElementById(this.list[i]);
			el.value = "";
			el.style.border = "1px solid black";
			//this.params[i].style.border = 
		}
		if(this.current!=null){
			this.current.style.border = "1px solid black";
		}
		this.params = [];
		this.index=0;
	}
	this.search = function(ev){
		for(var i=0;i<this.list.length;i++){
			if(document.getElementById(this.list[i]).contains(ev.target)){
				this.index = i;
				this.get();
				return null;
			}
		}
		this.preview();
	}
	this.add = function(v){
		if(v.type == "point"){
			return null;
		}
		if(this.current!=null){
			if(this.index>this.params.length-1){
				this.params.push(v);
			}
			else{
				this.params[this.index] = v;
			}
			this.current.value = v;
		}
		this.move();
	}
	this.addpoint = function(p){
		if(this.index==0){
			var np = body.gridcollide(p);
			var ans = null;
			if(np[0]!=null){
				var p1 = new point(np[0],p[1]);
				var p2 = new point(np[0],p[1]+1);
				ans = new line(p1,p2);
			}
			if(np[1]!=null){
				var p1 = new point(p[0],np[1]);
				var p2 = new point(p[0]+1,np[1]);
				ans = new line(p1,p2);
			}
			if(ans!=null){
				this.add(ans);
			}
		}
	}
	this.calculate = function(){
		if(this.params.length<2){
			return null;
		}
		var ax = this.params[0];
		
		var el = this.params[1];
		if(ax.type == "container" && el.type =="container"){
			//ax = ax.getaxis(el.pos.getpoint());
			ax = ax.getaxis();
		}
		this.deleteall();
		return el.mirrow(ax);
	}
	this.preview = function(){
		var s = this.calculate();
		if(s!=null){
			s.shape.origin.preview = true;
			this.store.push(s);
		}
	}
	this.deleteall = function(){
		for(var i=0;i<this.store.length;i++){
			body.deleteshape(this.store[i]);
		}
		this.store = [];
	}
	this.mergeall = function(nstore){
		if(!document.getElementById("Mmerge").checked){
			return null;
		}
		if(this.params.length<2){
			return null;
		}
		body.unselect();
		//body.selectele(this.params[1]);
		for(var i=0;i<nstore.length;i++){
			body.selectele(nstore[i]);
		}
		console.log("merge");
	}
}
//revolve
function arevolve(){
	this.index = 0;
	this.list = ["rorigin","robject"];
	this.variables=["dangle","rangle"];
	this.current = null;
	this.params = [];
	this.store = [];
	
	//functions
	this.init = function(){
		this.current = null;
		this.index = 0;
		this.param = [];
		this.get();
	}
	this.move = function(){
		this.index++;
		this.get();
		this.preview();
	}
	this.get = function(){
		if(this.index>=this.list.length){
			return null;
		}
		if(this.current!=null){
			this.current.style.border = "1px solid black";
		}
		this.current = document.getElementById(this.list[this.index]);
		this.current.style.border = "3px solid yellow";
	}
	this.clear = function(){
		for(var i=0;i<this.list.length;i++){
			var el = document.getElementById(this.list[i]);
			el.value = "";
			el.style.border = "1px solid black";
			//this.params[i].style.border = 
		}
		if(this.current!=null){
			this.current.style.border = "1px solid black";
		}
		this.params = [];
		this.index=0;
	}
	this.search = function(ev){
		for(var i=0;i<this.list.length;i++){
			if(document.getElementById(this.list[i]).contains(ev.target)){
				this.index = i;
				this.get();
				return null;
			}
		}
		this.preview();
	}
	this.add = function(v){
		if(this.index == 0 && v.type == "line"){
			return null;
		}
		if(this.index == 0){
			v = v.getpoint();
		}
		if(this.current!=null){
			if(this.index>this.params.length-1){
				this.params.push(v);
			}
			else{
				this.params[this.index] = v;
			}
			this.current.value = v;
		}
		this.move();
	}
	this.addpoint = function(p){
		if(this.index==0){
			this.add(new point(p[0],p[1]));
		}
	}
	this.checkgood = function(){
		for(var i=0;i<this.variables.length;i++){
			var v = parseFloat(document.getElementById(this.variables[i]).value);
			if(v==NaN || v==0){
				return false;
			}
		}
		return true;
	}
	this.calculate = function(){
		if(this.params.length<2){
			return null;
		}
		if(!this.checkgood()){
			return null;
		}
		this.deleteall();
		return this.revolveall();
	}
	this.revolveall = function(){
		var da = parseFloat(document.getElementById(this.variables[0]).value);
		var ea = parseFloat(document.getElementById(this.variables[1]).value);
		var no = Math.abs(ea/da);
		var ans = [];
		if(ea == 360){
			no-=1;
		}
		var po = this.params[0];
		var lsh = this.params[1];
		var nan = this.torad(da);
		if(document.getElementById("Rreverse").checked){
			nan*=-1;
		}
		for(var i=0;i<no;i++){
			if(ans.length>0){
				lsh = ans[ans.length-1];
			}
			
			ans.push(lsh.revolve(po,nan));
		}
		return ans;
	}
	this.torad = function(v){
		 return ((v/180)*Math.PI);
	}
	this.preview = function(){
		var s = this.calculate();
		if(s!=null){
			for(var i=0;i<s.length;i++){
				s[i].shape.origin.preview = true;
				this.store.push(s[i]);
			}
		}
	}
	this.deleteall = function(){
		for(var i=0;i<this.store.length;i++){
			body.deleteshape(this.store[i]);
		}
		this.store = [];
	}
	this.mergeall = function(nstore){
		if(!document.getElementById("rmerge").checked){
			return null;
		}
		if(this.params.length<2){
			return null;
		}
		body.unselect();
		body.selectele(this.params[1]);
		for(var i=0;i<nstore.length;i++){
			body.selectele(nstore[i]);
		}
		console.log("merge");
	}
}
//path pattern
function apattern(){
	this.index = 0;
	this.list = ["path","pobject"];
	this.variables=["pnumber","pdistance"];
	this.current = null;
	this.params = [];
	this.store = [];
	
	//functions
	this.init = function(){
		this.current = null;
		this.index = 0;
		this.param = [];
		this.get();
	}
	this.move = function(){
		this.index++;
		this.get();
		this.preview();
	}
	this.get = function(){
		if(this.index>=this.list.length){
			return null;
		}
		if(this.current!=null){
			this.current.style.border = "1px solid black";
		}
		this.current = document.getElementById(this.list[this.index]);
		this.current.style.border = "3px solid yellow";
	}
	this.clear = function(){
		for(var i=0;i<this.list.length;i++){
			var el = document.getElementById(this.list[i]);
			el.value = "";
			el.style.border = "1px solid black";
			//this.params[i].style.border = 
		}
		if(this.current!=null){
			this.current.style.border = "1px solid black";
		}
		this.params = [];
		this.index=0;
	}
	this.search = function(ev){
		for(var i=0;i<this.list.length;i++){
			if(document.getElementById(this.list[i]).contains(ev.target)){
				this.index = i;
				this.get();
				return null;
			}
		}
		this.preview();
	}
	this.add = function(v){
		if(v.type != "container"){
			return null;//for now
		}
		if(this.current!=null){
			if(this.index>this.params.length-1){
				this.params.push(v);
			}
			else{
				this.params[this.index] = v;
			}
			this.current.value = v;
		}
		this.move();
	}
	this.addpoint = function(p){
	}
	this.checkgood = function(){
		for(var i=0;i<this.variables.length;i++){
			var v = parseFloat(document.getElementById(this.variables[i]).value);
			if(v==NaN || v==0){
				return false;
			}
		}
		return true;
	}
	this.calculate = function(){
		if(this.params.length<2){
			return null;
		}
		if(!this.checkgood()){
			return null;
		}
		this.deleteall();
		return this.patternall();
	}
	this.patternall = function(){
		var num = parseFloat(document.getElementById(this.variables[0]).value);
		var dist = parseFloat(document.getElementById(this.variables[1]).value);
		//var no = Math.abs(ea/da);
		num = Math.abs(num);
		dist = Math.abs(dist);
		var ans = [];
		//var nan = this.torad(da);
		var dir = 1;
		if(document.getElementById("preverse").checked){
			dir=-1;
		}
		//init
		var sb = this.params[0].startpath(this.params[1].getpoint());
		for(var i=0;i<num;i++){
			var co = this.params[0].movepath(this.params[1],dist,dir);
			if(co==null){
				console.log("Error");
				break;
			}
			else{
				ans.push(co);
			}
			
		}
		return ans;
	}
	this.torad = function(v){
		 return ((v/180)*Math.PI);
	}
	this.preview = function(){
		var s = this.calculate();
		if(s!=null){
			for(var i=0;i<s.length;i++){
				s[i].shape.origin.preview = true;
				this.store.push(s[i]);
			}
		}
	}
	this.deleteall = function(){
		for(var i=0;i<this.store.length;i++){
			body.deleteshape(this.store[i]);
		}
		this.store = [];
	}
	this.mergeall = function(nstore){
		if(!document.getElementById("pmerge").checked){
			return null;
		}
		if(this.params.length<2){
			return null;
		}
		body.unselect();
		body.selectele(this.params[1]);
		for(var i=0;i<nstore.length;i++){
			body.selectele(nstore[i]);
		}
		console.log("merge");
	}
}