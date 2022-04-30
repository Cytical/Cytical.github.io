$(document).scroll(function() {
	var y = $(this).scrollTop();
	if (y > 550 && $( window ).width() < 1160){
		$('#extra-header').fadeIn();
	} else {
		$('#extra-header').fadeOut();
	}

	if (y > 1 && $( window ).width() >= 1160) {
		$('#navigation').addClass('moved-navigation')
	} else {
		$('#navigation').removeClass('moved-navigation')
	}
	
      });

$(window).resize(function(){
	checkHeaders();
});

$(document).ready(function(){
	checkHeaders();
});

function checkHeaders(){
	var y = $(this).scrollTop();
	if ( $(window).width() >= 1160){
		$('#navigation').css({position:'fixed'});
		$('#extra-header').fadeOut();
	} else {
		$('#navigation').css({position:'absolute'});
		if (y > 550){
			$('#extra-header').fadeIn();
		}
	}
}


// function to toggle between light and dark theme
function toggleTheme() {
   if (document.getElementById('slider').checked) {
       document.getElementById('theme-style').href = 'dark.css';
   } else {
       document.getElementById('theme-style').href = 'default.css';
   }
}

