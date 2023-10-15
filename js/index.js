// When the user scrolls down 80px from the top of the document, resize the navbar's padding and the logo's font size
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.getElementById("ham_toggled").checked)
  {
    document.getElementById("ham_toggled").checked = false;
    document.getElementById("navbar_right").style.display = "none";
    document.getElementById("header").style.height = "20vh";
    document.getElementById("navbar").style.height = "5vh";
  }

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

  

  // // window.screen.height;
  // // window.screen.width;
  // if (window.screen.width < 1000)  {
  //   console.log("testing")
  //   let x = document.getElementById("navbar_right");
  //   let header = document.getElementById("header");
  //   let navbar = document.getElementById("navbar");
  
  //   x.style.display = "none";
  //   header.style.height = "20vh";
  //   navbar.style.height = "5vh";
  // }


}
