let clz =document.querySelector("#close");
let shop =document.querySelector(".shop");
let div= document.querySelector(".container");
let body= document.querySelector("body");
let form= document.querySelector("#submit_form");

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
