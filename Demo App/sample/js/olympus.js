$("#infoToggler").click(function() {
    $(this).find('img').toggle();
});

$("#infoToggler2").click(function() {
    $(this).find('img').toggle();
});

$("#infoToggler3").click(function() {
    $(this).find('img').toggle();
});

$("#infoToggler4").click(function() {
    $(this).find('img').toggle();
});




$('document').ready(function() {
    $('#show1, #show2, #show3').click( function() {
        var $div = $('#' + $(this).data('href'));
        $('.delete-the-contact').not($div).hide();
        $div.slideToggle();
    });
});

