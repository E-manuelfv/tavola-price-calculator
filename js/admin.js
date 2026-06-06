document.addEventListener("DOMContentLoaded", () => {
    const inputs = [
        "filamentPrice", "weightUsed", "printHours", "printerType",
        "energyCost", "wearCost", "primerCost", "consumablesCost",
        "failRate", "adminPaintToggle", "colorCount", "adminPaintCategory",
        "painterPayout", "marketplace", "profitMargin"
    ];

    const elements = {};
    inputs.forEach(id => elements[id] = document.getElementById(id));

    const payoutSuggestions = { simples: 20, media: 30, premium: 40, ultra: 60 };
    const marketFees = { shopee: 0.20, instagram: 0.00, mercado_livre: 0.15 };

    const cached = TPS_Storage.load("admin_input", {});
    Object.keys(cached).forEach(key => {
        if(elements[key]) {
            if(elements[key].type === "checkbox") elements[key].checked = cached[key];
            else elements[key].value = cached[key];
        }
    });

    elements.adminPaintCategory.addEventListener("change", () => {
        elements.painterPayout.value = payoutSuggestions[elements.adminPaintCategory.value];
        calculateAdminPrice();
    });

    function calculateAdminPrice() {
        document.getElementById("failLabel").innerText = `Taxa de Falha Estimada: ${elements.failRate.value}%`;
        document.getElementById("profitLabel").innerText = `Lucro Desejado: ${elements.profitMargin.value}%`;

        const isPainted = elements.adminPaintToggle.checked;
        document.getElementById("adminPaintSection").style.display = isPainted ? "block" : "none";

        let materialCost = (parseFloat(elements.filamentPrice.value) / 1000) * parseFloat(elements.weightUsed.value);
        let runHours = parseFloat(elements.printHours.value);
        let energy = runHours * parseFloat(elements.energyCost.value);
        let wear = runHours * parseFloat(elements.wearCost.value);
        
        let subtotalInsumos = materialCost + parseFloat(elements.primerCost.value) + parseFloat(elements.consumablesCost.value);
        let machineOverhead = energy + wear;
        
        let totalCostBase = subtotalInsumos + machineOverhead;
        totalCostBase += totalCostBase * (parseFloat(elements.failRate.value) / 100);

        let painterFee = isPainted ? parseFloat(elements.painterPayout.value) : 0;
        let totalCostWithArt = totalCostBase + painterFee;

        let marginMultiplier = 1 + (parseFloat(elements.profitMargin.value) / 100);
        let marketFee = marketFees[elements.marketplace.value];

        let precoFinalCalculado = (totalCostWithArt * marginMultiplier) / (1 - marketFee);
        let finalPriceRecommended = roundToTavolaPattern(precoFinalCalculado);
        let minAcceptablePrice = roundToTavolaPattern(precoFinalCalculado * 0.85);
        let netProfit = finalPriceRecommended - totalCostWithArt - (finalPriceRecommended * marketFee);

        document.getElementById("calcCostBruto").innerText = `R$ ${subtotalInsumos.toFixed(2)}`;
        document.getElementById("calcCostTotal").innerText = `R$ ${totalCostWithArt.toFixed(2)}`;
        document.getElementById("calcLucroLiquido").innerText = `R$ ${netProfit.toFixed(2)} (${elements.profitMargin.value}%)`;
        document.getElementById("adminPriceMin").innerText = `R$ ${minAcceptablePrice.toFixed(2)}`;
        document.getElementById("adminPriceRec").innerText = `R$ ${finalPriceRecommended.toFixed(2)}`;

        let stateToSave = {};
        inputs.forEach(id => {
            stateToSave[id] = elements[id].type === "checkbox" ? elements[id].checked : elements[id].value;
        });
        TPS_Storage.save("admin_input", stateToSave);
    }

    inputs.forEach(id => elements[id].addEventListener("input", calculateAdminPrice));

    document.getElementById("btnGenSummary").addEventListener("click", () => {
        const textRow = `✨ *ORÇAMENTO TÁVOLA 3D* ✨\n\n` +
                        `📦 *Peça:* Produção Personalizada 3D\n` +
                        `⏳ *Tempo de Impressão:* ${elements.printHours.value} Horas\n` +
                        `🎨 *Pintura:* ${elements.adminPaintToggle.checked ? elements.adminPaintCategory.value.toUpperCase() : 'Cor Base do Filamento'}\n` +
                        `💳 *Valor Final:* ${document.getElementById("adminPriceRec").innerText}\n\n` +
                        `Válido por 7 dias. Deseja fechar o pedido conosco?`;
        
        document.getElementById("summaryText").innerText = textRow;
        document.getElementById("summaryCard").style.display = "block";
    });

    document.getElementById("btnCopyClip").addEventListener("click", () => {
        navigator.clipboard.writeText(document.getElementById("summaryText").innerText);
        alert("Copiado com sucesso! É só colar na conversa do WhatsApp.");
    });

    calculateAdminPrice();
});
