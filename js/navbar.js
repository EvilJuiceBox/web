// loads navbar

$(function() { // shorthand for `$(document).ready(function() {
    $("#header").load("./shared/navbar.html");
});

// $(function () {
//     // Scroll to function 
//     function scrollTo(ele) {
//         $("html, body").animate({
//             scrollTop: $(ele).offset().top - $("#header").height()
//         });
//     }

//     // Detect location hash
//     if (window.location.hash) {
//         scrollTo(window.location.hash);
//     }

//     // Detect click event
//     $("header a[href^='#']").click(function (e) {
//         var target = $(this).attr("href");
//         scrollTo(target);
//         e.preventDefault();
//     });
// });