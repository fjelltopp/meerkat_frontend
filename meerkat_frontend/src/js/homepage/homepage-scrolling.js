
$( function(){
//SCROLLING BUTTONS-------------------------------------------
//Handle the scrolling buttons

  // navigation click actions
  $('.scroll-link').on('click', function(event){
	 event.preventDefault();
	 var sectionID = $(this).attr("data-id");
	 scrollToID('#' + sectionID, 750);
    resetMapView(map);
  });

  // scroll to top action
  $('.scroll-top').on('click', function(event) {
	 event.preventDefault();
	 $('html, body').animate({scrollTop:0}, 'slow');
    $('.navbar-nav li.active').removeClass('active');
    resetMapView(map);
  });

  //Manage the link highlighting
  $('.navbar-nav li').on('click', function(event){
    $('.navbar-nav li.active').removeClass('active');
	 $(this).addClass('active');
  });  

  // Auto close mobile nav menu after selection
  $('.nav a').on('click', function(){
    if ($(document).width() <= 991){
      $(".navbar-toggle").click();
    }
  });

  // Auto closs mobile nav menu after selection
  $('a.navbar-brand').on('click', function(){
    if ($(document).width() <= 991 && !$(".navbar-toggle").hasClass("collapsed")){
      $(".navbar-toggle").click();
    }
  });

// scroll function
function scrollToID(id, speed){
  var offSet = 0;
  var targetOffset = $(id).offset().top - offSet;
  var mainNav = $('#main-nav');
  $('html,body').animate({scrollTop:targetOffset}, speed);
}

});
