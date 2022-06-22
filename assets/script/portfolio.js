
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

function ChangeLang(lang){
    url = lang == 0? docs.ru: docs.en
    saveLang(lang)
    clearInterval(interval)
    document.querySelector(".plug-holder").classList.remove("hidden")
    init()
}

function saveTheme(index, dark = 0){
    if(localStorage){
        localStorage.setItem("theme", index);
        localStorage.setItem("dark", dark);
    }
}

function saveLang(lang){
    if(localStorage){
        localStorage.setItem('lang', lang)
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

function markdown(src, target){
    try{
        let out = "", links = {};

        out = src;

        out = out.replace(/(?:\$(?:([\*\>\-\=\+\_\^\~\#\[\]\(\)\/])|(?<=^\/{2}.*)([\*\>\-\=\+\_\^\~\#\[\]\(\)])))/mg, (matched, captured) => {
            return `\$\$code:${captured.codePointAt(0)}\$\$`;
        });
        //console.log(out);

        out = out.replace(/(?:(^[ ]{0,3}\#{1,6}[ ]*.*)|(^[ ]{0,3}[\-\=\_]{3,})|((?:^[ ]{0,3}\>.*(?:\n|\r|\0|\z))+))/mg, "\n$1$2$3\n");
        //console.log(out);

        /*for(let founded_link of out.match(/\[(\S.*?\S)\](?:\:[ ]{1,4}(\S.*?)[ ]{1,4}(\S.*?)\s|[ ]{0,4}\((.+?)\)|\:[ ]{1,4}(.+?)\s|\[\])/gm)){
            if(typeof(founded_link[4]) != "undefined"){
                links[`link_${founded_link[1].toLowerCase()}`] = { 
                    title : founded_link[1],
                    address : founded_link[4]
                }
            }else if(typeof(founded_link[5]) != "undefined"){
                links[`link_${founded_link[1].toLowerCase()}`] = { 
                    title : founded_link[1],
                    address : founded_link[5]
                }
            }else if(typeof(founded_link[2]) != "undefined" && typeof(founded_link[2]) != "undefined"){
                links[`link_${founded_link[1].toLowerCase()}`] = { 
                    title : founded_link[3],
                    address : founded_link[2]
                }
            }
        } */

        out = out.replace(/\[[^\[\]]*?\]\:[ ]{1,4}(?:\S.*?[ ]{1,4}\S.*?\s|.+?)[ ]*$/gm, "");

        /* console.log(links); */

        out = out.replace(/\[(\S.*?\S)\](?:\:[ ]{1,4}(\S.*?)[ ]{1,4}(\S.*?)\s|[ ]{0,4}\((.+?)\)|\:[ ]{1,4}(.+?)\s|\[\])/gm,
            (matched, name, ...args)=>{
                let link = links["link_"+name.toLowerCase()] || null;
                if(!link) return "";
                console.log("link_"+name.toLowerCase() ,link, args);
                return `<a href="${link.address||""}">${link.title}</a>`;
            }
        );

        out = out.replace(/((?:\S.*(?:\n|\r|\0|\z|$))+)/gm, "$1\n");
        //console.log(out);
        out = out.replace(/((?:(?:^[ ]*(\n|\0|\r|\z))|(?:[\n\0\r]\z))+)/gm, "\n");
        //console.log(out);
        out = out.replace(/(?:((?:^[ ]{4,}.*(?:\n|\0|\r|\z))+)|^[ ]{0,3}(\#{1,6}[ ]*.*)(?:\n|\0|\r|\z)|^[ ]*([\-\_]+)(?:\n|\0|\r|\z)|((?:^[ ]{0,3}\>.*(?:\n|\0|\r|\z))+)|((?:^\/{2}.*(?:\n|\0|\r|\z))+)|((?:^[ ]{0,3}\S.*(?:\n|\0|\r|\z))+))/gm,
            (matched, code, h, hr, blockquote, insert, p)=>{
                //console.log({matched, h, hr, blockquote, p});
                if(typeof(code) != "undefined"){
                    return `<pre><code>${code}</pre></code>`;
                }else if(typeof(h) != "undefined"){
                    let size = h.match(/\#/g).length,
                        text = h.replace(/\#{1,6}[ ]*(.*)/, "$1");
                    return `<h${size}>${text}</h${size}>`;
                }else if(typeof(hr) != "undefined"){
                    return "<hr>";
                }else if(typeof(blockquote) != "undefined"){
                    return `<blockquote><p>${blockquote.replace(/(\>[ ]*)/gm, "")}</p></blockquote>`;
                }else if(typeof(insert) != "undefined"){
                    return `${insert.replace(/(\/{2})/gm, "")}`;
                }else {
                    return `<p>${p}</p>`;
                }

                return "";
            });
        //console.log(out);

        out = out.replace(/(\*{3})(.*?)(\*{3})/mg, "<strong><em>$2</em></strong>");
        out = out.replace(/(\>{3})/mg, "<br>");
        out = out.replace(/(\<{3})/mg, "<span class='whspace'></span>");
        out = out.replace(/(\*{2})(.*?)(\*{2})/mg, "<strong>$2</strong>");
        out = out.replace(/(\*{1})(.*?)(\*{1})/mg, "<em>$2</em>");
        out = out.replace(/(\~{3})(.*?)(\~{3})/mg, "<del><ins>$2</ins></del>");
        out = out.replace(/(\~{2})(.*?)(\~{2})/mg, "<del>$2</del>");
        out = out.replace(/(\~{1})(.*?)(\~{1})/mg, "<ins>$2</ins>");
        out = out.replace(/\/cnts:(.*?):(.*?)(?::(.*?)){0,1}\//gm, '<span class="cnts">$1 <a target="blank" href="$2" data-cnts-type="$1" data-cnts="true" data-href="$2" data-title="$3">^$2^</a></span>');
        out = out.replace(/(\^{2})(.*?)(\^{2})/mg, "<span style='color:var(--inactive-color);'>$2</span>");
        out = out.replace(/(\^{1})(.*?)(\^{1})/mg, "<span style='color:var(--main-color);'>$2</span>");

        out = out.replace(/\$\$code:(\d*)\$\$/mg, (matched, captured) => {
                return `${String.fromCodePoint(parseInt(captured))}`;
            });
        
        target.insertAdjacentHTML("beforeend", out);
        for(let link of target.querySelectorAll('[data-cnts="true"]')){
            link.innerHTML = `<span style='color:var(--main-color);'>${link.dataset.title || link.dataset.href}</span>`
            switch(link.dataset.cntsType){
                case 'email':
                    link.href = `mailto:${link.dataset.href}`
                    break
                case 'telegram':
                    link.href = `https://t.me/${link.dataset.href}`
                    break
                case 'instagram':
                    link.href = `https://www.instagram.com/${link.dataset.href}`
                    break
                case 'skype':
                    link.href = `skype:${link.dataset.href}?chat`
                    break
                default:
                    link.href = link.dataset.href
                    break
            }
        }
    }
    catch(e){
        console.log("Something gone wrong: ", e);
    }
}
