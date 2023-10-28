function toggleHamburger() {
    let x = document.getElementById("navbar_right");
    let header = document.getElementById("header");
    let navbar = document.getElementById("navbar");

    let ham_toggled = document.getElementById("ham_toggled")
    if (typeof(ham_toggled) != 'undefined' && ham_toggled != null) {
      if (ham_toggled.checked) {
          // hide the menu
          x.style.display = "none";
          header.style.height = "20vh";
          navbar.style.height = "5vh";
        } else {
          // show the menu
          x.style.display = "flex";
          header.style.height = "40vh";
          navbar.style.height = "23vh";
        }
      }
  }


function resetHamburger() {
    console.log("testing")
    let x = document.getElementById("navbar_right");
    let header = document.getElementById("header");
    let navbar = document.getElementById("navbar");

    x.style.display = "none";
    header.style.height = "20vh";
    navbar.style.height = "5vh";

}