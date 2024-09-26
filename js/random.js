
// This script loads a random string from random_text and displays it on the frontpage.


let counter = 0;

function initRandomText(text_object, random_text) {
    // inits the basic quote.
    setTimeout(() => {
        text_object.innerText = "Random: " + random_text[Math.floor(Math.random()*random_text.length)];
        document.getElementById("random").setAttribute("class", "random_show");
    }, 0);
}


function rotateRandomText(text_object, random_text) {
    document.getElementById("random").setAttribute("class", "random_fade");
    
    setTimeout(() => {
        // Add a random number based on random text length, make sure its not the same one with -1, and mod length.
        counter = (counter + Math.ceil(Math.random()*random_text.length) - 1) % random_text.length;
        // console.log(counter);
        text_object.innerText = "Random: " + random_text[counter];
        document.getElementById("random").setAttribute("class", "random_show");
    }, 1000);
    // setTimeout("rotateRandomText()", 1000);
}

$(function() { // shorthand for `$(document).ready(function() {
    const text_object = document.getElementById("random_quote");
    // list of random facts
    const random_text = [
        "I grow my hair out to donate it annually for charity!", 
        "Go Green!",
        "Go White!", 
        "Pasta is my favourite food.", 
        "I apprenticed under Michigan State University's head chef Kurt Kwiatkowski during my undergrad.", 
        "My favourite colour is amethyst.", 
        "Standing on the shoulders of giants.", 
        "Ed Sheeran is my favourite artist.", 
        "I enjoy building Gundam Models as a hobby.",
        "Caramel is my favourite coffee flavour.",
        "I work with the High Performance Computing Center (HPCC) at MSU.",
        "My favourite pizza toppings are bacon and mushrooms.",
        "Autumn is my favourite season.",
        "Pachelbel's Canon in D is my favourite classical piece.",
        "I had a pet turtle growing up.",
        "I belong to the Ravenclaw house.",
        "Probably out coffee hunting.",
        "My favourite number is 20.",
        "42 is the ultimate question of life, the universe, and everything."
        ];
    initRandomText(text_object, random_text);
    setInterval(rotateRandomText, 6000, text_object, random_text);
});

