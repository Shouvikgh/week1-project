const message = document.querySelector("#message");
const list = document.querySelector("#campaign-list");
const showFormBtn = document.querySelector("#show-form");
const form = document.querySelector("#campaign-form");
const cancelBtn = document.querySelector("#cancel-form");
const details = document.querySelector("#details");
const previewFrame = document.querySelector("#preview-frame");

let selectedCampaign = null;
let selectedCreative = null;

async function getJson(path) {
    const response = await fetch(API_URL + path);
    if (!response.ok) {
        throw new Error("Server answered with status " + response.status);
    }
    return response.json();
}

async function postJson(path, body) {
    const response = await fetch(API_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }
    return data;
}

async function loadCampaigns() {
    try {
        const campaigns = await getJson("/campaigns");

        list.innerHTML = "";
        message.textContent = campaigns.length === 0 ? "No campaigns yet. Create one!" : "";

        campaigns.forEach((campaign) => {
            const item = document.createElement("li");

            const name = document.createElement("span");
            name.textContent = campaign.name;

            const badge = document.createElement("span");
            badge.textContent = campaign.status;
            badge.className = "badge " + campaign.status;

            item.append(name, badge);
            item.addEventListener("click", () => showDetails(campaign._id));
            list.append(item);
        });
    } catch (error) {
        message.textContent = "Could not load campaigns: " + error.message;
        console.error(error);
    }
}

function closeForm() {
    form.reset();
    form.hidden = true;
    showFormBtn.hidden = false;
}

showFormBtn.addEventListener("click", () => {
    form.hidden = false;
    showFormBtn.hidden = true;
});

cancelBtn.addEventListener("click", closeForm);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const value = (selector) => document.querySelector(selector).value;

    try {
        const campaign = await postJson("/campaigns", {
            name: value("#f-name"),
            status: value("#f-status"),
            budget: Number(value("#f-budget")),
            click_url: value("#f-click")
        });

        await postJson("/creatives", {
            campaign: campaign._id,
            name: value("#f-name"),
            headline: value("#f-headline"),
            tail: value("#f-tail"),
            description: value("#f-description"),
            cta_text: value("#f-cta"),
            image_url: value("#f-image"),
            click_url: value("#f-click")
        });

        closeForm();
        loadCampaigns();
    } catch (error) {
        message.textContent = "Could not create campaign: " + error.message;
        loadCampaigns();
    }
});

async function loadStats(campaignId) {
    const stats = await getJson("/events/summary?campaign=" + campaignId);
    document.querySelector("#d-impressions").textContent = stats.impressions;
    document.querySelector("#d-clicks").textContent = stats.clicks;
}

async function showDetails(id) {
    try {
        const campaign = await getJson("/campaigns/" + id);
        const creatives = await getJson("/creatives?campaign=" + id);

        selectedCampaign = campaign;
        selectedCreative = creatives[0] || null;

        document.querySelector("#d-name").textContent = campaign.name;
        document.querySelector("#d-creative").textContent = selectedCreative ? selectedCreative.name : "(none yet)";
        document.querySelector("#d-status").textContent = campaign.status;
        document.querySelector("#d-budget").textContent = campaign.budget;
        document.querySelector("#d-click").textContent = campaign.click_url || "(none)";

        previewFrame.hidden = true;
        previewFrame.removeAttribute("src");

        await loadStats(id);
        details.hidden = false;
    } catch (error) {
        message.textContent = "Could not load details: " + error.message;
    }
}

document.querySelector("#preview-btn").addEventListener("click", () => {
    if (!selectedCreative) {
        message.textContent = "This campaign has no creative yet.";
        return;
    }

    const campaignId = selectedCampaign._id;
    previewFrame.src = "ad.html?creative=" + selectedCreative._id;
    previewFrame.hidden = false;

    setTimeout(() => {
        loadStats(campaignId).catch(console.error);
    }, 1500);
});

document.querySelector("#refresh-btn").addEventListener("click", async () => {
    if (!selectedCampaign) {
        return;
    }
    try {
        await loadStats(selectedCampaign._id);
    } catch (error) {
        message.textContent = "Could not refresh: " + error.message;
    }
});

document.querySelector("#delete-btn").addEventListener("click", async () => {
    if (!selectedCampaign) {
        return;
    }

    const sure = confirm("Delete " + selectedCampaign.name + "?");
    if (!sure) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/campaigns/" + selectedCampaign._id, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Server answered with status " + response.status);
        }

        details.hidden = true;
        previewFrame.hidden = true;
        selectedCampaign = null;
        selectedCreative = null;
        loadCampaigns();
    } catch (error) {
        message.textContent = "Could not delete: " + error.message;
    }
});

loadCampaigns();