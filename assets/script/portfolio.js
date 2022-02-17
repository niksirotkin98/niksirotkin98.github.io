
const colors = [
    //default
    {
        "caption" : "light",
        "main-color" : "#12B8FF",
        "background-color" : "#F0F0F0",
        "inactive-color" : "rgba(0, 0, 0, 0.5)",
        "main-text-color" : "#444444"
    },
    //dark
    {
        "caption" : "dark",
        "main-color" : "#FF6712",
        "background-color" : "#1D1D1D",
        "inactive-color" : "rgba(255, 255, 255, 0.3)",
        "main-text-color" : "rgba(255, 255, 255, 0.9)"
    },
    //dark
    {
        "caption" : "dark",
        "main-color" : "#093FFF",
        "background-color" : "#E6FF81",
        "inactive-color" : "rgba(0, 0, 0, 0.5)",
        "main-text-color" : "#444444"
    },
    //default
    {
        "caption" : "dark",
        "main-color" : "#DE12FF",
        "background-color" : "#000A2D",
        "inactive-color" : "rgba(255, 255, 255, 0.3)",
        "main-text-color" : "rgba(255, 255, 255, 0.9)"
    },
];

function ChangeTheme(colorsObj, index, dark = 0){
    for(let property in colorsObj){
        document.body.style.setProperty("--"+property, colorsObj[property]);
    }
    saveTheme(index, dark);
}

function saveTheme(index, dark = 0){
    if(localStorage){
        localStorage.setItem("theme", index);
        localStorage.setItem("dark", dark);
    }
}

function CheckTheme(){
    if(localStorage){
        let theme = parseInt(localStorage.getItem("theme")),
            dark = parseInt(localStorage.getItem("dark"));
        if(theme){
            ChangeTheme(colors[theme], theme, dark || 0);
            document.body.style.setProperty(dark==1?"--dark-color":"--light-color", colors[theme]["background-color"]);
            if(dark == 1){
                try{
                    document.querySelector(".theme-indicator").classList.add("dark");
                    document.querySelector("#themeSwitcher > input").checked = true;
                }
                catch(e){
                    console.log(e);
                }
            }
        }else{
            ChangeTheme(colors[0], 0 , dark || 0);
        }
    }
}