$("#infoToggler").click(function() {
    $(this).find('img').toggle();
});

$("#infoToggler2").click(function() {
    $(this).find('img').toggle();
});

$("#infoToggler3").click(function() {
    $(this).find('img').toggle();
});



$(document).ready(function() { 
	$('.showHide>span').click(function () {
		$(this).next().slideToggle("slow");
		return false; 
	});
    $(".showHide>span").toggle(function() {
            $(this).children("#changeArrow").text("↓");
        }, function() {
            $(this).children("#changeArrow").text("↑");
        });
    
});
   