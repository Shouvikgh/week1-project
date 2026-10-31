const API_URL = "http://localhost:3000";

const message = document.querySelector("#message");
const list = document.querySelector("#campaign-list");
const showFormBtn = document.querySelector("#show-form");
const form = document.querySelector("#campaign-form");
const cancelBtn = document.querySelector("#cancel-form");
const details = document.querySelector("#details");

let selectedCampaign = null;

async function loadCampaigns() {
    try {
        const response = await fetch(API_URL + "/campaigns");
        if (!response.ok) {
            throw new Error("Server answered with status " + response.status);
        }
        const campaigns = await response.json();

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

    const newCampaign = {
        name: document.querySelector("#f-name").value,
        status: document.querySelector("#f-status").value,
        budget: Number(document.querySelector("#f-budget").value),
        click_url: document.querySelector("#f-click").value
    };

    try {
        const response = await fetch(API_URL + "/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCampaign)
        });

        if (!response.ok) {
            const problem = await response.json();
            throw new Error(problem.error || "Could not save");
        }

        closeForm();
        loadCampaigns();
    } catch (error) {
        message.textContent = "Could not create campaign: " + error.message;
    }
});

async function showDetails(id) {
    try {
        const response = await fetch(API_URL + "/campaigns/" + id);
        if (!response.ok) {
            throw new Error("Server answered with status " + response.status);
        }
        const campaign = await response.json();

        selectedCampaign = campaign;
        document.querySelector("#d-name").textContent = campaign.name;
        document.querySelector("#d-status").textContent = campaign.status;
        document.querySelector("#d-budget").textContent = campaign.budget;
        document.querySelector("#d-click").textContent = campaign.click_url || "(none)";
        details.hidden = false;
    } catch (error) {
        message.textContent = "Could not load details: " + error.message;
    }
}

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
        selectedCampaign = null;
        loadCampaigns();
    } catch (error) {
        message.textContent = "Could not delete: " + error.message;
    }
});

document.querySelector("#preview-btn").addEventListener("click", () => {
    alert("The preview comes in Stage 5!");
});

loadCampaigns();