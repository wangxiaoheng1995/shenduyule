var tiredul = document.getElementById('tiredul');
		var tiredli = tiredul.getElementsByTagName('li');

		for(var i=0;i<tiredli.length;i++){
			
			tiredli[i].onmouseover = function(){
				var This = this;	
				for(var i=0;i<tiredli.length;i++){
					tiredli[i].className ='';
					This.className = ' active';
				}
				
			}			
		}