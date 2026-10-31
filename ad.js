const API_URL = "http://localhost:3000";

const params = new URLSearchParams(window.location.search);
const creativeId = params.get("creative");

const ad = document.querySelector("#ad");
const shoe = document.querySelector("#shoe");
const headline = document.querySelector("#headline");
const tail = document.querySelector("#tail");
const description = document.querySelector("#description");
const cta = document.querySelector("#cta");
const seeMore = document.querySelector("#see_more");
const closeBtn = document.querySelector("#close");
const closedNote = document.querySelector("#closed-note");
const showAgain = document.querySelector("#show-again");
const adMessage = document.querySelector("#ad-message");

const fallbackCreative = {
    headline: "Run Faster",
    tail: "Go further",
    description: "Aero Run — 180 g cushioned racer with free returns. Ends tonight",
    cta_text: "Shop Now",
    image_url: "shoes.png",
    click_url: "form.html"
};

function log(eventName, message = "") {
    console.log(eventName, message, new Date().toLocaleTimeString());
}

function isSafeUrl(url) {
    try {
        const parsed = new URL(url, window.location.href);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
}

async function loadCreative() {
    if (!creativeId) {
        throw new Error("No creative id in the address");
    }
    const response = await fetch(API_URL + "/creatives/" + creativeId);
    if (!response.ok) {
        throw new Error("Server answered with status " + response.status);
    }
    return response.json();
}

function render(creative) {
    headline.textContent = creative.headline;
    tail.textContent = creative.tail || "";
    description.textContent = creative.description || "";
    cta.textContent = creative.cta_text || "Shop Now";

    if (creative.click_url && isSafeUrl(creative.click_url)) {
        cta.href = creative.click_url;
    } else {
        cta.removeAttribute("target");
    }

    if (creative.image_url && isSafeUrl(creative.image_url)) {
        shoe.style.backgroundImage = 'url("' + creative.image_url + '")';
    }
}

async function sendEvent(type, creative) {
    if (!creative._id || !creative.campaign) {
        log("skipped", type + " (this creative has no id)");
        return;
    }

    try {
        const response = await fetch(API_URL + "/events/" + type, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                campaign_id: creative.campaign,
                creative_id: creative._id
            }),
            keepalive: true
        });
        if (!response.ok) {
            throw new Error("Server answered with status " + response.status);
        }
        log(type, "saved");
    } catch (error) {
        log("error", "could not send " + type + ": " + error.message);
    }
}

function setupTracking(creative) {
    const watcher = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            sendEvent("impression", creative);
            watcher.disconnect();
        }
    }, { threshold: 0.5 });
    watcher.observe(ad);

    cta.addEventListener("click", () => {
        sendEvent("click", creative);
    });
}

function setupInteractions() {
    seeMore.addEventListener("click", () => {
        const isOpen = ad.classList.toggle("open");
        seeMore.textContent = isOpen ? "See Less" : "See More";
        log(isOpen ? "expand" : "collapse");
    });

    closeBtn.addEventListener("click", () => {
        ad.style.visibility = "hidden";
        closedNote.hidden = false;
        log("close");
    });

    showAgain.addEventListener("click", () => {
        ad.style.visibility = "visible";
        closedNote.hidden = true;
        log("show again");
    });
}

async function init() {
    let creative;
    try {
        creative = await loadCreative();
    } catch (error) {
        log("error", error.message);
        adMessage.textContent = "Could not load this creative. Showing backup content.";
        creative = fallbackCreative;
    }

    render(creative);
    setupTracking(creative);
    setupInteractions();
}

init();