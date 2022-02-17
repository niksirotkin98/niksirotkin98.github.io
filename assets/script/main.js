let themeIndicator = document.querySelector(".theme-indicator"), colorSheme, colorShemeIndex = 0;

if(localStorage){
    colorShemeIndex = parseInt(localStorage.getItem("theme")) || 0;
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
}
catch(e){
    console.error(e);
}


function deleteSpaces(src){
    let out = "", deleted = 0;
    for(let i = 0; i < src.length; i++){
        if(src[i] === ' ' && 
            (src[i+1] === ' ' 
            || i == (src.length-1) 
            || i == 0 + deleted)){
            deleted++;
            continue;
        }else{
            out += src[i];
        }
    }
    return out;
}

function markdown(src, target){
    try{
        let out = "", links = {};

        out = src;

        out = out.replaceAll(/(?:\$(?:([\*\>\-\=\+\_\^\~\#\[\]\(\)\/])|(?<=^\/{2}.*)([\*\>\-\=\+\_\^\~\#\[\]\(\)])))/mg, (matched, captured) => {
            return `\$\$code:${captured.codePointAt(0)}\$\$`;
        });
        //console.log(out);

        out = out.replaceAll(/(?:(^[ ]{0,3}\#{1,6}[ ]*.*)|(^[ ]{0,3}[\-\=\_]{3,})|((?:^[ ]{0,3}\>.*(?:\n|\r|\0|\z))+))/mg, "\n$1$2$3\n");
        //console.log(out);

            
        for(let founded_link of out.matchAll(/\[(\S.*?\S)\](?:\:[ ]{1,4}(\S.*?)[ ]{1,4}(\S.*?)\s|[ ]{0,4}\((.+?)\)|\:[ ]{1,4}(.+?)\s|\[\])/gm)){
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
        }

        out = out.replaceAll(/\[[^\[\]]*?\]\:[ ]{1,4}(?:\S.*?[ ]{1,4}\S.*?\s|.+?)[ ]*$/gm, "");

        console.log(links);

        out = out.replaceAll(/\[(\S.*?\S)\](?:\:[ ]{1,4}(\S.*?)[ ]{1,4}(\S.*?)\s|[ ]{0,4}\((.+?)\)|\:[ ]{1,4}(.+?)\s|\[\])/gm,
            (matched, name, ...args)=>{
                let link = links["link_"+name.toLowerCase()] || null;
                if(!link) return "";
                console.log("link_"+name.toLowerCase() ,link, args);
                return `<a href="${link.address||""}">${link.title}</a>`;
            }
        );

        out = out.replaceAll(/((?:\S.*(?:\n|\r|\0|\z|$))+)/gm, "$1\n");
        //console.log(out);
        out = out.replaceAll(/((?:(?:^[ ]*(\n|\0|\r|\z))|(?:[\n\0\r]\z))+)/gm, "\n");
        //console.log(out);
        out = out.replaceAll(/(?:((?:^[ ]{4,}.*(?:\n|\0|\r|\z))+)|^[ ]{0,3}(\#{1,6}[ ]*.*)(?:\n|\0|\r|\z)|^[ ]*([\-\_]+)(?:\n|\0|\r|\z)|((?:^[ ]{0,3}\>.*(?:\n|\0|\r|\z))+)|((?:^\/{2}.*(?:\n|\0|\r|\z))+)|((?:^[ ]{0,3}\S.*(?:\n|\0|\r|\z))+))/gm,
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
                    return `<blockquote><p>${blockquote.replaceAll(/(\>[ ]*)/gm, "")}</p></blockquote>`;
                }else if(typeof(insert) != "undefined"){
                    return `${insert.replaceAll(/(\/{2})/gm, "")}`;
                }else {
                    return `<p>${p}</p>`;
                }

                return "";
            });
        //console.log(out);

        out = out.replaceAll(/(\*{3})(.*?)(\*{3})/mg, "<strong><em>$2</em></strong>");
        out = out.replaceAll(/(\>{3})/mg, "<br>");
        out = out.replaceAll(/(\<{3})/mg, "<span class='whspace'></span>");
        out = out.replaceAll(/(\*{2})(.*?)(\*{2})/mg, "<strong>$2</strong>");
        out = out.replaceAll(/(\*{1})(.*?)(\*{1})/mg, "<em>$2</em>");
        out = out.replaceAll(/(\~{3})(.*?)(\~{3})/mg, "<del><ins>$2</ins></del>");
        out = out.replaceAll(/(\~{2})(.*?)(\~{2})/mg, "<del>$2</del>");
        out = out.replaceAll(/(\~{1})(.*?)(\~{1})/mg, "<ins>$2</ins>");
        out = out.replaceAll(/(\^{2})(.*?)(\^{2})/mg, "<span style='color:var(--inactive-color);'>$2</span>");
        out = out.replaceAll(/(\^{1})(.*?)(\^{1})/mg, "<span style='color:var(--main-color);'>$2</span>");

        out = out.replaceAll(/\$\$code:(\d*)\$\$/mg, (matched, captured) => {
                return `${String.fromCodePoint(parseInt(captured))}`;
            });
        
        target.insertAdjacentHTML("beforeend", out);
    }
    catch(e){
        console.log("Something gone wrong: ", e);
    }
}

let src
let elements = document.createElement("div")

async function init(){
    try{
        let r = await fetch('./assets/bio.md')
        src = await r.text()
    } catch(e){
        src = '## Error with loading "bio.md"!'
    }

    markdown(src, elements)

    let content = document.querySelector(".content")
    let data = [...elements.children]
    let index = 0
    let interval
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
        }
    };
    
    setTimeout(()=>{
        document.querySelector(".plug-holder").remove();
        interval = setInterval(handler, 150);
    }, 2000)
    
}

window.addEventListener('load', init)