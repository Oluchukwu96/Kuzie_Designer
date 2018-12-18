
var keymap = new Object();
keymap[65] = "aA";
keymap[66] = "bB";
keymap[67] = "cC";
keymap[68] = "dD";
keymap[69] = "eE";
keymap[70] = "fF";
keymap[71] = "gG";
keymap[72] = "hH";
keymap[73] = "iI";
keymap[74] = "jJ";
keymap[75] = "kK";
keymap[76] = "lL";
keymap[77] = "mM";
keymap[78] = "nN";
keymap[79] = "oO";
keymap[80] = "pP";
keymap[81] = "qQ";
keymap[82] = "rR";
keymap[83] = "sS";
keymap[84] = "tT";
keymap[85] = "uU";
keymap[86] = "vV";
keymap[87] = "wW";
keymap[88] = "xX";
keymap[89] = "yY";
keymap[90] = "zZ";
keymap[32] = " ";
keymap[8] = -1;
keymap[188]=",<";
keymap[190]=".>";
keymap[219]="[{";
keymap[221]="]}";
keymap[191]="/?";
keymap[187]="=+";
keymap[189]="-_";
keymap[221]="\|";

//numbers
keymap[48] = "0)";
keymap[49] = "1!";
keymap[50] = "2@";
keymap[51] = "3#";
keymap[52] = "4$";
keymap[53] = "5%";
keymap[54] = "6^";
keymap[55] = "7&";
keymap[56] = "8*";
keymap[57] = "9(";
/*
for(var i=0;i<10;i++){
	var j = 48+i;
	var v = ""+i;
	keymap[j] = v;
}
*/


window.onkeydown = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;
	if(key==16){
		body.capon=true;
		body.enddraw(true);
	}
	if(key==13){
		body.enddraw(true);
	}
	if(key ==17){
		body.ctrl = true;
	}
	if(body.ctrl){
		if(key==90){
			barn.undo();
		}
		if(key==89){
			barn.redo();
		}
	}
	if(key==17){
		body.ctron = true;
	}
	if(key == 18){
		body.unhold();
	}
	if(body.mytext!=null){
		var t = keymap[key];
		if(t!=null){
			//body.mytext.addtext(t);
			body.mytext.type(t);
		}
		//other actions
		if(key==39){
			body.mytext.shift(1);
		}
		if(key==37){
			body.mytext.shift(-1);
		}
	}
}

window.onkeyup = function(e) {
	var key = e.keyCode ? e.keyCode : e.which;
	if(key==16){
		body.capon=false;
	}
	if(key==17){
		body.ctron = false;
	}
}