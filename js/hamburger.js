function toggleHamburger() {
    let x = document.getElementById("navbar_right");
    let header = document.getElementById("header");
    let navbar = document.getElementById("navbar");

    if (document.getElementById("ham_toggled").checked) {
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
    // if (x.style.display === "flex") {
    //   x.style.display = "none";
    //   header.style.height = "20vh";
    //   navbar.style.height = "5vh";
    // } else {
    //   x.style.display = "flex";
    //   header.style.height = "40vh";
    //   navbar.style.height = "23vh";
    // }
  }

// addEventListener("scroll", resetHamburger);


function resetHamburger() {
    console.log("testing")
    let x = document.getElementById("navbar_right");
    let header = document.getElementById("header");
    let navbar = document.getElementById("navbar");

    x.style.display = "none";
    header.style.height = "20vh";
    navbar.style.height = "5vh";

}