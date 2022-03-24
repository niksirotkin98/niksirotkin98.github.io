const src = {
    ru: './assets/bio.md?ver=24-03-22-1',
    en: './assets/bio_en.md'
}

let themeIndicator = document.querySelector(".theme-indicator"), 
    colorSheme, 
    colorShemeIndex = 0,
    langShemeIndex = 0;


if(localStorage){
    colorShemeIndex = parseInt(localStorage.getItem("theme")) || colorShemeIndex;
    langShemeIndex = parseInt(localStorage.getItem("lang")) || langShemeIndex;
}
colorSheme = colors[colorShemeIndex];

function Plug(){
    return;
} 

try{
    document.querySelector("#themeSwitcher").addEventListener("input", (e)=>{
        colorShemeIndex = (colorShemeIndex + 1) % colors.length;
        colorSheme = colors[colorShemeIndex];
        if(e.target.checked){
            ChangeTheme(colorSheme, colorShemeIndex, 1);
            themeIndicator.classList.add("dark");
            document.body.style.setProperty("--dark-color", colorSheme["background-color"]);
        }
        else{
            ChangeTheme(colorSheme, colorShemeIndex);
            themeIndicator.classList.remove("dark");
            document.body.style.setProperty("--light-color", colorSheme["background-color"]);
        }
    });
    document.querySelector('#langSwitcher').addEventListener('input', e => {
        langShemeIndex = langShemeIndex == 0? 1: 0
        e.target.setAttribute("disabled", true)
        ChangeLang(langShemeIndex)
    })
    document.querySelector('#langSwitcher > input').checked = langShemeIndex != 0
}
catch(e){
    console.error(e);
}

let src
let interval
let url = langShemeIndex == 0? src.ru: src.en

async function init(){
    src = ""
    try{
        let r = await fetch(url)
        src = await r.text()
    } catch(e){
        src = '## Error with loading "bio.md"!'
    }

    let elements = document.createElement("div")

    markdown(src, elements)

    let content = document.querySelector(".content")
    content.innerHTML = ""
    
    let data = [...elements.children]
    let index = 0
    let handler = ()=>{
        let div = document.createElement("div");
    
        div.classList.add("element");
        div.classList.add("hidden");
    
        div.insertAdjacentHTML("afterbegin", `<div class="slide"></div>`);
        div.insertAdjacentElement("beforeend", data[index]);
    
        content.insertAdjacentElement("beforeend", div);
    
        setTimeout(()=>{
            div.classList.remove("hidden");
            setTimeout(()=>{
                div.removeChild(div.firstChild);
            }, 150)
        }, 150);
    
        index++;
    
        if(index == data.length){
            clearInterval(interval);
            document.querySelector('#langSwitcher > input').removeAttribute("disabled")
        }
    };
    
    setTimeout(()=>{
        document.querySelector(".plug-holder").classList.add("hidden")
        if(elements.children.length > 0){
            interval = setInterval(handler, 150);
        }
    }, 2000)
    
}

window.addEventListener('load', init)