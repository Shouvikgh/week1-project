let clz =document.querySelector("#close");
let shop =document.querySelector(".shop");
let div= document.querySelector(".container");
let body= document.querySelector("body");
let form= document.querySelector("#submit_form");
let heading= document.querySelector(".text1");
let heading2= document.querySelector(".text2");
let heading3= document.querySelector(".text3");
let shop_text= document.querySelector("#shop_text");
let see_more= document.querySelector("#see_more");

let parah= document.createElement("p");
parah.innerText="If you want to see again then click on SHOW AGAIN button";
parah.style.color="white";

let newBtn= document.createElement("button");
newBtn.innerText="SHOW AGAIN";
newBtn.style.display="none";
newBtn.style.color="black";

if (clz && div) {
    body.append(newBtn);

    clz.addEventListener("click", ()=>{
        div.style.visibility="hidden";
        body.append(parah);
        newBtn.style.display="inline-block";
        parah.style.display="inline-block";
    })

    newBtn.addEventListener("click", ()=>{
        div.style.visibility="visible";
        newBtn.style.display="none";
        parah.style.display="none";
    })
}

if (form) {
    form.addEventListener("click",()=>{
        alert("Your order has been placed successfully");
    })
}
//Dynamic Content
let config={
    headline: "Run Faster",
    tail: "Go further",
    description: "Aero Run — 180 g cushioned racer with free returns. Ends tonight",
    cta_text: "Shop now"
}
if(heading){
    heading.textContent=config.headline;
}
if(heading2){
    heading2.textContent=config.tail;
}
if(heading3){
    heading3.textContent=config.description;
}
if(shop_text){
    shop_text.textContent=config.cta_text;
}
//click tracking
function log(eventName){
    console.log(eventName);
    console.log(new Date().toLocaleTimeString());
}
if(shop_text){
    shop_text.addEventListener("click",()=>{
    console.log("Shop now button clicked",log("click"));
})
}
//impression tracking
if(div){
    const watcher= new IntersectionObserver((entries)=>{
    if(entries[0].isIntersecting){
        console.log("The ad is on the screen");
        log("impression");
        watcher.disconnect();
    }
}, {threshold: 0.5});
    watcher.observe(div);
}
//expand/collapse
if(div && see_more){
    see_more.addEventListener("click",()=>{
        const isOpen = div.classList.toggle("open");
        see_more.innerText = isOpen ? "See Less" : "See More";
    });
}
