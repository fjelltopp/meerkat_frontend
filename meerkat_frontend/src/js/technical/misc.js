
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
    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    return date.getDate()+" "+monthNames[date.getMonth()]+" "+date.getFullYear();
}
