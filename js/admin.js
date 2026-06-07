document.addEventListener("DOMContentLoaded", () => {
    const inputs = [
        "filamentPrice", "weightUsed", "printHours", "printerType",
        "energyCost", "wearCost", "primerCost", "consumablesCost",
        "failRate", "adminPaintToggle", "colorCount", "adminPaintCategory",
        "painterPayout", "marketplace", "profitMargin"
    ];

    const elements = {};
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) elements[id] = el;
    });

    const payoutSuggestions = { simples: 20, media: 30, premium: 40, ultra: 60 };
    const marketFees = { shopee: 0.20, instagram: 0.00, mercado_livre: 0.15 };

    const cached = TPS_Storage.load("admin_input", {});
    Object.keys(cached).forEach(key => {
        if (elements[key]) {
            if (elements[key].type === "checkbox") elements[key].checked = cached[key];
            else elements[key].value = cached[key];
        }
    });

    if (elements.adminPaintCategory && elements.painterPayout) {
        elements.adminPaintCategory.addEventListener("change", () => {
            elements.painterPayout.value = payoutSuggestions[elements.adminPaintCategory.value] || elements.painterPayout.value;
            calculateAdminPrice();
        });
    }

    function generateAdvice(margin, failRate, hours, marketFee, finalPrice) {
        let advice = "💡 DICAS PARA MAXIMIZAR SEU LUCRO:\n\n";
        let hasAdvice = false;

        if (margin >= 150) {
            advice += "• MARGEM ALTA (>150%): para justificar o preço, foque no valor percebido. Capriche na embalagem, inclua brinde leve (adesivo, tag exclusiva) e use fotos premium.\n";
            hasAdvice = true;
        }
        if (failRate > 5) {
            advice += `• FALHAS (${failRate}%): reduza erros otimizando suportes, adesão à mesa e temperatura. Falhas corroem seu lucro líquido diretamente.\n`;
            hasAdvice = true;
        }
        if (hours > 15) {
            advice += "• TEMPO DE MÁQUINA: avalie usar bico 0.6mm ou preenchimento gyroid/lightning em peças internas para economizar horas de impressão.\n";
            hasAdvice = true;
        }
        if (marketFee > 0) {
            let taxaEconomizada = finalPrice * marketFee;
            advice += `• TAXAS DE PLATAFORMA: migrar a venda para Instagram/WhatsApp pode salvar R$ ${taxaEconomizada.toFixed(2)} nessa peça.\n`;
            hasAdvice = true;
        }
        if (!hasAdvice) {
            advice += "• CUSTOS ENXUTOS: sua configuração atual está bem otimizada. Foco na entrega impecável para sustentar margens elevadas.";
        }

        const adviceBox = document.getElementById("aiAdviceBox");
        if (adviceBox) adviceBox.value = advice;
    }

    function calculateAdminPrice() {
        const failRateLabel = document.getElementById("failLabel");
        if (failRateLabel) failRateLabel.innerText = `Taxa de Falha Estimada: ${elements.failRate.value}%`;

        const profitLabel = document.getElementById("profitLabel");
        if (profitLabel) profitLabel.innerText = `Lucro Desejado: ${elements.profitMargin.value}%`;

        const isPainted = elements.adminPaintToggle ? elements.adminPaintToggle.checked : false;
        const paintSection = document.getElementById("adminPaintSection");
        if (paintSection) paintSection.style.display = isPainted ? "block" : "none";

        const materialCost = (parseFloat(elements.filamentPrice.value) / 1000) * parseFloat(elements.weightUsed.value);
        const runHours = parseFloat(elements.printHours.value);
        const energy = runHours * parseFloat(elements.energyCost.value);
        const wear = runHours * parseFloat(elements.wearCost.value);

        const subtotalInsumos = materialCost + parseFloat(elements.primerCost.value) + parseFloat(elements.consumablesCost.value);
        const machineOverhead = energy + wear;

        let totalCostBase = subtotalInsumos + machineOverhead;
        const rateFalha = parseFloat(elements.failRate.value);
        totalCostBase += totalCostBase * (rateFalha / 100);

        const painterFee = isPainted ? parseFloat(elements.painterPayout.value) : 0;
        const totalCostWithArt = totalCostBase + painterFee;

        const marginPercent = parseFloat(elements.profitMargin.value);
        const marginMultiplier = 1 + (marginPercent / 100);
        const marketFee = marketFees[elements.marketplace.value] || 0;

        const precoFinalCalculado = (totalCostWithArt * marginMultiplier) / (1 - marketFee);
        const finalPriceRecommended = roundToTavolaPattern(precoFinalCalculado);
        const minAcceptablePrice = roundToTavolaPattern(precoFinalCalculado * 0.85);
        const netProfit = finalPriceRecommended - totalCostWithArt - (finalPriceRecommended * marketFee);

        const calcCostBruto = document.getElementById("calcCostBruto");
        if (calcCostBruto) calcCostBruto.innerText = `R$ ${subtotalInsumos.toFixed(2)}`;

        const calcCostTotal = document.getElementById("calcCostTotal");
        if (calcCostTotal) calcCostTotal.innerText = `R$ ${totalCostWithArt.toFixed(2)}`;

        const calcLucroLiquido = document.getElementById("calcLucroLiquido");
        if (calcLucroLiquido) calcLucroLiquido.innerText = `R$ ${netProfit.toFixed(2)} (${marginPercent}%)`;

        const adminPriceMin = document.getElementById("adminPriceMin");
        if (adminPriceMin) adminPriceMin.innerText = `R$ ${minAcceptablePrice.toFixed(2)}`;

        const adminPriceRec = document.getElementById("adminPriceRec");
        if (adminPriceRec) adminPriceRec.innerText = `R$ ${finalPriceRecommended.toFixed(2)}`;

        generateAdvice(marginPercent, rateFalha, runHours, marketFee, finalPriceRecommended);

        const stateToSave = {};
        inputs.forEach(id => {
            if (elements[id]) {
                stateToSave[id] = elements[id].type === "checkbox" ? elements[id].checked : elements[id].value;
            }
        });
        stateToSave.finalPriceRecommended = finalPriceRecommended;
        TPS_Storage.save("admin_input", stateToSave);
    }

    inputs.forEach(id => {
        if (elements[id]) elements[id].addEventListener("input", calculateAdminPrice);
    });

    const btnGenSummary = document.getElementById("btnGenSummary");
    if (btnGenSummary) {
        btnGenSummary.addEventListener("click", () => {
            const paintText = elements.adminPaintToggle && elements.adminPaintToggle.checked
                ? elements.adminPaintCategory.options[elements.adminPaintCategory.selectedIndex].text
                : 'Cor Base do Filamento';

            const textRow = `✨ *ORÇAMENTO TÁVOLA 3D* ✨\n\n` +
                            `📦 *Peça:* Produção Personalizada 3D\n` +
                            `⏳ *Tempo de Impressão:* ${elements.printHours.value} Horas\n` +
                            `🎨 *Pintura:* ${paintText}\n` +
                            `💳 *Valor Final:* ${document.getElementById("adminPriceRec").innerText}\n\n` +
                            `Válido por 7 dias. Deseja fechar o pedido conosco?`;

            const summaryText = document.getElementById("summaryText");
            if (summaryText) summaryText.innerText = textRow;
            const summaryCard = document.getElementById("summaryCard");
            if (summaryCard) summaryCard.style.display = "block";
        });
    }

    const btnCopyClip = document.getElementById("btnCopyClip");
    if (btnCopyClip) {
        btnCopyClip.addEventListener("click", () => {
            const summaryText = document.getElementById("summaryText");
            if (summaryText) navigator.clipboard.writeText(summaryText.innerText);
            alert("Copiado com sucesso! É só colar na conversa do WhatsApp.");
        });
    }

    if (typeof roundToTavolaPattern !== "function") {
        window.roundToTavolaPattern = function(valor) {
            let arredondado = Math.ceil(valor);
            return arredondado - 0.10;
        };
    }

    calculateAdminPrice();
});
