function toggleHamburger() {
    // const ham = window.getComputedStyle(document.getElementById("hamburger_button"), null);
    let ham = document.getElementById("hamburger_button")
    let x = document.getElementById("navbar_right");
    let header = document.getElementById("header");
    let navbar = document.getElementById("navbar");
    const target = document.querySelector('#hamburger_button');

    style = window.getComputedStyle(document.getElementById("hamburger_button"));

    if (style.fontSize === "0px") {
        // hide the menu
        x.style.display = "none";
        header.style.height = "20vh";
        navbar.style.height = "5vh";
        ham.style.fontSize= "1px";
        // setting fontsize to be true
      } else {
        // show the menu
        x.style.display = "flex";
        header.style.height = "40vh";
        navbar.style.height = "23vh";
        ham.style.fontSize= "0px";
        // setting fontsize to be false
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

// object.addEventListener("scroll", resetHamburger);


// function resetHamburger() {
//     console.log("testing")
//     let x = document.getElementById("navbar_right");
//     let header = document.getElementById("header");
//     let navbar = document.getElementById("navbar");

//     x.style.display = "none";
//     header.style.height = "20vh";
//     navbar.style.height = "5vh";

// }