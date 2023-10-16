
// This script loads a random string from random_text and displays it on the frontpage.



function rotateRandomText(text_object, random_text) {
    document.getElementById("random").setAttribute("class", "random_fade");
    
    setTimeout(() => {
        text_object.innerText = "Random: " + random_text[Math.floor(Math.random()*random_text.length)];
        document.getElementById("random").setAttribute("class", "random_show");
    }, 1000);
    // setTimeout("rotateRandomText()", 1000);
}

$(function() { // shorthand for `$(document).ready(function() {
    const text_object = document.getElementById("random_quote");
    // list of random facts
    const random_text = ["I grow my hair out to donate it annually for charity!", "Go Green!", "Pasta is my favourite food.", "I apprenticed under Michigan State University's head chef Kurt Kwiatkowski during my undergrad.", "My favourite colour is amethyst", "Standing on the shoulders of giants", "Ed Sheeran is my favourite artist.", "I enjoy building Gundam Models as a hobby."];
    setInterval(rotateRandomText, 8000, text_object, random_text);
});

