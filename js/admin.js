document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        'filamentPrice', 'weightUsed', 'printHours', 'printerType',
        'energyCost', 'wearCost', 'primerCanPrice', 'consumablesCost',
        'failRate', 'adminPaintToggle', 'colorCount', 'adminPaintCategory',
        'painterPayout', 'marketplace', 'profitMargin'
    ];

    const elements = {};
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) elements[id] = el;
    });

    const payoutSuggestions = { simples: 20, media: 30, premium: 40, ultra: 60 };

    const cached = TPS_Storage.load('admin_input', {});
    Object.keys(cached).forEach(key => {
        if (elements[key]) {
            if (elements[key].type === 'checkbox') elements[key].checked = cached[key];
            else elements[key].value = cached[key];
        }
    });

    if (elements.adminPaintCategory && elements.painterPayout) {
        elements.adminPaintCategory.addEventListener('change', () => {
            elements.painterPayout.value = payoutSuggestions[elements.adminPaintCategory.value] || elements.painterPayout.value;
            calculateAdminPrice();
        });
    }

    function generateAdvice(margin, failRate, hours, marketFee, finalPrice) {
        let advice = '💡 DICAS PARA MAXIMIZAR SEU LUCRO:\n\n';
        let hasAdvice = false;

        if (margin >= 150) {
            advice += '• MARGEM ALTA (>150%): para justificar o preço, foque no valor percebido. Capriche na embalagem, inclua brinde leve (adesivo, tag exclusiva) e use fotos premium.\n';
            hasAdvice = true;
        }
        if (failRate > 5) {
            advice += `• FALHAS (${failRate}%): reduza erros otimizando suportes, adesão à mesa e temperatura. Falhas corroem seu lucro líquido diretamente.\n`;
            hasAdvice = true;
        }
        if (hours > 15) {
            advice += '• TEMPO DE MÁQUINA: avalie usar bico 0.6mm ou preenchimento gyroid/lightning em peças internas para economizar horas de impressão.\n';
            hasAdvice = true;
        }
        if (marketFee > 0) {
            const taxaEconomizada = finalPrice * marketFee;
            advice += `• TAXAS DE PLATAFORMA: migrar a venda para Instagram/WhatsApp pode salvar R$ ${taxaEconomizada.toFixed(2)} nessa peça.\n`;
            hasAdvice = true;
        }
        if (!hasAdvice) {
            advice += '• CUSTOS ENXUTOS: sua configuração atual está bem otimizada. Foco na entrega impecável para sustentar margens elevadas.';
        }

        const adviceBox = document.getElementById('aiAdviceBox');
        if (adviceBox) adviceBox.value = advice;
    }

    function generateStrategicAdvice(weight, canal, fixedFee, price) {
        const aiAdviceBox = document.getElementById('aiAdviceBox');
        if (!aiAdviceBox) return;

        if (weight < 25 && canal === 'shopee') {
            aiAdviceBox.value = `🤖 Alerta Estratégico: Peças leves sofrem forte impacto da taxa fixa de R$ ${fixedFee.toFixed(2)} por item na Shopee. Recomenda-se criar kits promocionais (ex: Kit com 3 ou 5 chaveiros) no mesmo anúncio para diluir essa taxa fixa e maximizar a margem real de lucro.`;
            aiAdviceBox.style.borderLeftColor = '#FF6B00';
        } else {
            aiAdviceBox.value = `🤖 Sistema Estável: A margem aplicada cobre com segurança os insumos escalados e as taxas operacionais do canal ${canal.toUpperCase()}.`;
            aiAdviceBox.style.borderLeftColor = '#00C2FF';
        }
    }

    function calculateAdminPrice() {
        const failRateLabel = document.getElementById('failLabel');
        if (failRateLabel) failRateLabel.innerText = `Taxa de Falha Estimada: ${elements.failRate.value}%`;

        const profitLabel = document.getElementById('profitLabel');
        if (profitLabel) profitLabel.innerText = `Lucro Desejado: ${elements.profitMargin.value}%`;

        const isPainted = elements.adminPaintToggle ? elements.adminPaintToggle.checked : false;
        const paintSection = document.getElementById('adminPaintSection');
        if (paintSection) paintSection.style.display = isPainted ? 'block' : 'none';

        const weight = parseFloat(elements.weightUsed.value) || 0;
        const hours = parseFloat(elements.printHours.value) || 0;

        // Cálculo de rendimento do primer (70 aplicações por lata)
        const RENDIMENTO_LATA_PRIMER = 70;
        const precoLata = parseFloat(elements.primerCanPrice.value) || 0;
        const custoPorAplicacao = precoLata / RENDIMENTO_LATA_PRIMER;

        // Multiplicador de escala baseado no peso (min 0.5, max 2.0)
        const weightFactor = Math.max(0.5, Math.min(2.0, weight / 150));
        const realPrimerCost = custoPorAplicacao * weightFactor;
        const realConsumablesCost = (parseFloat(elements.consumablesCost.value) || 0) * weightFactor;

        const materialCost = ((parseFloat(elements.filamentPrice.value) || 0) / 1000) * weight;
        const energy = hours * (parseFloat(elements.energyCost.value) || 0);
        const wear = hours * (parseFloat(elements.wearCost.value) || 0);

        const subtotalInsumos = materialCost + realPrimerCost + realConsumablesCost;
        let totalCostBase = subtotalInsumos + energy + wear;

        totalCostBase += totalCostBase * ((parseFloat(elements.failRate.value) || 0) / 100);

        const painterFee = isPainted ? (parseFloat(elements.painterPayout.value) || 0) : 0;
        const totalCostWithArt = totalCostBase + painterFee;

        const marginMultiplier = 1 + ((parseFloat(elements.profitMargin.value) || 0) / 100);
        const targetCostWithProfit = totalCostWithArt * marginMultiplier;

        let precoFinalCalculado = 0;
        let fixedFeeApplied = 0;
        let percentFeeApplied = 0;
        const canalSelected = elements.marketplace.value;

        if (canalSelected === 'instagram') {
            precoFinalCalculado = targetCostWithProfit;
            percentFeeApplied = 0;
        } else if (canalSelected === 'mercado_livre') {
            percentFeeApplied = 0.15;
            precoFinalCalculado = targetCostWithProfit / (1 - percentFeeApplied);
        } else if (canalSelected === 'shopee') {
            percentFeeApplied = 0.20;
            const p1 = (targetCostWithProfit + 4.00) / (1 - percentFeeApplied);
            if (p1 <= 79.99) {
                precoFinalCalculado = p1;
                fixedFeeApplied = 4.00;
            } else {
                const p2 = (targetCostWithProfit + 16.00) / (1 - percentFeeApplied);
                if (p2 >= 80.00 && p2 <= 99.99) {
                    precoFinalCalculado = p2;
                    fixedFeeApplied = 16.00;
                } else {
                    const p3 = (targetCostWithProfit + 20.00) / (1 - percentFeeApplied);
                    if (p3 >= 100.00 && p3 <= 199.99) {
                        precoFinalCalculado = p3;
                        fixedFeeApplied = 20.00;
                    } else {
                        const p4 = (targetCostWithProfit + 26.00) / (1 - percentFeeApplied);
                        if (p4 > 500.00) {
                            precoFinalCalculado = targetCostWithProfit + 26.00 + 100.00;
                            fixedFeeApplied = 126.00;
                            percentFeeApplied = 0;
                        } else {
                            precoFinalCalculado = p4;
                            fixedFeeApplied = 26.00;
                        }
                    }
                }
            }
        }

        const finalPriceRec = roundToTavolaPattern(precoFinalCalculado);
        const finalPriceMin = roundToTavolaPattern(precoFinalCalculado * 0.85);

        let mktDeduction = 0;
        if (canalSelected === 'shopee') {
            let variableMkt = finalPriceRec * 0.20;
            if (variableMkt > 100) variableMkt = 100;
            mktDeduction = variableMkt + fixedFeeApplied;
        } else {
            mktDeduction = finalPriceRec * percentFeeApplied;
        }

        const netProfitReal = finalPriceRec - totalCostWithArt - mktDeduction;

        const calcCostBruto = document.getElementById('calcCostBruto');
        if (calcCostBruto) calcCostBruto.innerText = `R$ ${subtotalInsumos.toFixed(2).replace('.', ',')}`;

        const calcCostTotal = document.getElementById('calcCostTotal');
        if (calcCostTotal) calcCostTotal.innerText = `R$ ${totalCostWithArt.toFixed(2).replace('.', ',')}`;

        const calcPainterFee = document.getElementById('calcPainterFee');
        const painterFeeRow = document.getElementById('painterFeeRow');
        if (calcPainterFee) calcPainterFee.innerText = `R$ ${painterFee.toFixed(2).replace('.', ',')}`;
        if (painterFeeRow) painterFeeRow.style.display = isPainted ? 'flex' : 'none';

        const calcLucroLiquido = document.getElementById('calcLucroLiquido');
        if (calcLucroLiquido) calcLucroLiquido.innerText = `R$ ${netProfitReal.toFixed(2).replace('.', ',')}`;

        const adminPriceMin = document.getElementById('adminPriceMin');
        if (adminPriceMin) adminPriceMin.innerText = `R$ ${finalPriceMin.toFixed(2).replace('.', ',')}`;

        const adminPriceRec = document.getElementById('adminPriceRec');
        if (adminPriceRec) adminPriceRec.innerText = `R$ ${finalPriceRec.toFixed(2).replace('.', ',')}`;

        generateAdvice(parseFloat(elements.profitMargin.value) || 0, parseFloat(elements.failRate.value) || 0, hours, percentFeeApplied, finalPriceRec);
        generateStrategicAdvice(weight, canalSelected, fixedFeeApplied, finalPriceRec);

        const stateToSave = {};
        inputs.forEach(id => {
            if (elements[id]) {
                stateToSave[id] = elements[id].type === 'checkbox' ? elements[id].checked : elements[id].value;
            }
        });
        stateToSave.finalPriceRecommended = finalPriceRec;
        TPS_Storage.save('admin_input', stateToSave);
    }

    inputs.forEach(id => {
        if (elements[id]) elements[id].addEventListener('input', calculateAdminPrice);
    });

    const btnGenSummary = document.getElementById('btnGenSummary');
    if (btnGenSummary) {
        btnGenSummary.addEventListener('click', () => {
            const paintText = elements.adminPaintToggle && elements.adminPaintToggle.checked
                ? elements.adminPaintCategory.options[elements.adminPaintCategory.selectedIndex].text
                : 'Cor Base do Filamento';

            const textRow = `✨ *ORÇAMENTO TÁVOLA 3D* ✨\n\n` +
                            `📦 *Peça:* Produção Personalizada 3D\n` +
                            `⏳ *Tempo de Impressão:* ${elements.printHours.value} Horas\n` +
                            `🎨 *Pintura:* ${paintText}\n` +
                            `💳 *Valor Final:* ${document.getElementById('adminPriceRec').innerText}\n\n` +
                            `Válido por 7 dias. Deseja fechar o pedido conosco?`;

            const summaryText = document.getElementById('summaryText');
            if (summaryText) summaryText.innerText = textRow;
            const summaryCard = document.getElementById('summaryCard');
            if (summaryCard) summaryCard.style.display = 'block';
        });
    }

    const btnCopyClip = document.getElementById('btnCopyClip');
    if (btnCopyClip) {
        btnCopyClip.addEventListener('click', () => {
            const summaryText = document.getElementById('summaryText');
            if (summaryText) navigator.clipboard.writeText(summaryText.innerText);
            alert('Copiado para a área de transferência com sucesso!');
        });
    }

    calculateAdminPrice();
});
