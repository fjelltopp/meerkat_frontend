
//Get the epi week from the current date.
//The epi week is the week number counted from the begining of Jan 2015.
function get_epi_week(){

    date=new Date();
    ms2=date.getTime();
    date_early= new Date(2015,0,1);
    date_early=date_early.getTime();
    days=Math.floor((ms2-date_early)/(3600*24*1000));

    return Math.floor(days/7)+1;
}

//Get the current date in text format.
function get_date(){

    date=new Date();
    date=new Date(date.getTime()-3600*24*1000);
    var monthNames = [ "January", "February", "March", "April", 
	                    "May", "June", "July", "August", "September", 
	                    "October", "November", "December" ];

    return date.getDate()+" "+monthNames[date.getMonth()]+" "+date.getFullYear();
}

//Format a number with commas for the thousands.
function format(number){

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Calculate no as a percentage of denom. Returns 0 if denom <= 0.
function calc_percent(no,denom){
	if (denom>0){
		return Math.round(no/denom*100);
	}else{
		return 0;
	}
}

//Given an array of values, calulate what percentage each value is of the total.
function calc_percent_dist( array ){

	var total = 0;	
	var ret = [];

	for( var i=0; i<array.length; i++ ){
		total += array[i];
	}

	for( var j=0; j<array.length; j++ ){
		ret[j] = calc_percent(array[j], total);
	}

	return ret;
}

//Returns the vlue if the key exists in vari, returns zero if it doesn't. 
function if_exists(vari,key){

	if ($.inArray(key,Object.keys(vari)) != -1 || $.inArray(key.toString(),Object.keys(vari)) != -1 ){
		return vari[key];
	}else{
		return 0;
	}

}

//Select the webkit event to listen for when determining when the side bar has transitioned.
function whichTransitionEvent(){

    var t;
    var el = document.getElementById('sidebar-wrapper');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
}

//Utility function to capitalise the first character of a string.
function capitalise( string ){
	return string.charAt(0).toUpperCase() + string.slice(1);
}

