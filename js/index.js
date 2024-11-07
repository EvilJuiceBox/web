// When the user scrolls down 80px from the top of the document, resize the navbar's padding and the logo's font size
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
// ORDER OF OPERATION MATTERS
  // First close the menu bar if open

  ham_toggled = document.getElementById("ham_toggled")
  if (typeof(ham_toggled) != 'undefined' && ham_toggled != null) {
    if (document.getElementById("ham_toggled").checked)
    {
      document.getElementById("ham_toggled").checked = false;
      document.getElementById("navbar_right").style.display = "none";
      document.getElementById("header").style.height = "20vh";
      document.getElementById("navbar").style.height = "5vh";
    }
  }

  // make header smaller
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.getElementById("header").style.padding = "2vh 2vh";
    document.getElementById("header").style.height = "5vh";
    document.getElementById("main").style.padding = "padding: 6vh 0 0 0";
    // document.getElementById("navbar-right").style.display = "flex";
  } else {
    document.getElementById("header").style.padding = "0 0 0 0";
    document.getElementById("header").style.height = "20vh";
    document.getElementById("main").style.padding = "padding: 22vh 0 0 0";
    // document.getElementById("navbar-right").style.display = "flex";
  }
  document.getElementById("navbar_right").style.display = "";
}
