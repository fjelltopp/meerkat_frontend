$( function() {

	//SHOW THE KEY_INDICATORS ----------------------------------------------
	$.getJSON( "api/key_indicators", function( data ){
	  $.each( data, function( x, y ){ 
		 $.each( y, function( w, z){
		   $.each( z, function( key, val ){ 
		     $("#"+key).text(Math.round(val));
		   });
		 });
	  });
	});

	//Enable the left and righ buttons for the key indicator viewer.
	$('#leftButton').click( function(){
	  pos = parseInt($('#keyIndicatorsList').css("left"));
	  //If a button is pressed before animation is complete, the viewing window can endup straddling a panel.
	  //We don't want this, so remove the "straddle" distance from the panel-list's position.
	  pos = pos - (pos % 210);
	  
	  if( window.matchMedia( "(max-width: 700px)" ).matches ) bounce=630;
	  else bounce = 210;

	  if( pos > -210 ){
		 $('#keyIndicatorsList').animate( {"left": "-" + bounce +"px" }, "slow");
	  }else{
		 $('#keyIndicatorsList').animate( {"left": (pos+210)+"px"}, "slow");
	  }
	});

	$('#rightButton').click( function(){
	  pos = parseInt($('#keyIndicatorsList').css("left"));
	  pos = pos - (pos % 210);
	  if( window.matchMedia( "(max-width: 700px)" ).matches ) bounce=630;
	  else bounce = 210;
	  if( pos  <= -bounce ){
		 $('#keyIndicatorsList').animate( {"left": "0px"}, "slow");
	  }else{
		 $('#keyIndicatorsList').animate( {"left": (pos-210)+"px"}, "slow");
	  }
	});
});
