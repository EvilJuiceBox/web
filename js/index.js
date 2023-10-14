// When the user scrolls down 80px from the top of the document, resize the navbar's padding and the logo's font size
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("header").style.padding = "30px 10px";
    document.getElementById("header").style.height = "5em";
    document.getElementById("main").style.padding = "padding: 6em 0 0 0";
  } else {
    document.getElementById("header").style.padding = "0 0 0 0";
    document.getElementById("header").style.height = "15em";
    document.getElementById("main").style.padding = "padding: 11em 0 0 0";
  }
}