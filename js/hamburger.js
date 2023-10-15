function toggleHamburger() {
    let x = document.getElementById("navbar_right");
    let header = document.getElementById("header");
    let navbar = document.getElementById("navbar");
    console.log("toggling")
    if (x.style.display === "inline-block") {
      x.style.display = "none";
      header.style.height = "20vh";
      navbar.style.height = "5vh";
    } else {
      x.style.display = "inline-block";
      header.style.height = "40vh";
      navbar.style.height = "20vh";
    }
  }