// When the user scrolls down 80px from the top of the document, resize the navbar's padding and the logo's font size
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("header").style.padding = "2rem 1rem";
    document.getElementById("header").style.height = "5vh";
    document.getElementById("main").style.padding = "padding: 6rem 0 0 0";
    // document.getElementById("navbar-right").style.display = "flex";
  } else {
    document.getElementById("header").style.padding = "0 0 0 0";
    document.getElementById("header").style.height = "20vh";
    document.getElementById("main").style.padding = "padding: 11rem 0 0 0";
    // document.getElementById("navbar-right").style.display = "flex";
  }
}