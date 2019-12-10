function checkEnter(event){
    event.target.mouseEntered = true;  
}

function checkleave(event){
    event.target.mouseEntered = false;
    event.target.parentNode.querySelector("img").classList.remove("left","right");
}

function checkMove(event){
    let img = event.target.parentNode.querySelector("img"),
        hasLeftOrRightClass = (img.classList.contains("right") || img.classList.contains("left")),
        fromRight = event.layerX >= event.target.clientWidth/2;

    fromRight = fromRight?"left":"right";

    if(!hasLeftOrRightClass){
        img.classList.add(fromRight);
    }
}

let main = document.createElement("div"),
    container = document.createElement("div"),
    layout = document.createElement("div"),
    img = document.createElement("img"),
    h1 = document.createElement("h1"),
    p = document.createElement("p");

img.src = "./avatar.png";
img.id = "imgRun";

layout.classList.add("layout");
layout.id = "layoutIn";

h1.innerText = "Nikita Sirotkin";
p.innerText = "niksirotkin98@gmail.com";

container.classList.add("container");
container.id = "container";
container.mousemoved = false;
container.append(img);
container.append(layout);

main.classList.add("main");

layout.addEventListener("mouseenter",checkEnter);
layout.addEventListener("mousemove",checkMove);
layout.addEventListener("mouseleave",checkleave);


main.append(container);
main.append(h1, p);
document.body.append(main);
