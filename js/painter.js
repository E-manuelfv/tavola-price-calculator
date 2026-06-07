document.addEventListener("DOMContentLoaded", () => {
    const artName = document.getElementById("artName");
    const artCategory = document.getElementById("artCategory");
    const painterComplexity = document.getElementById("painterComplexity");
    const artistHours = document.getElementById("artistHours");
    const artistColors = document.getElementById("artistColors");
    const techChecks = document.querySelectorAll(".tech-check");

    // Definição dos níveis acordados com a artista baseados nos custos líquidos de produção
    const complexityLevels = {
        1: { name: "Simples (Mão de obra: 15%)", rate: 0.15 },
        2: { name: "Avançada (Mão de obra: 20%)", rate: 0.20 },
        3: { name: "Master (Mão de obra: 25%)", rate: 0.25 }
    };

    const cached = TPS_Storage.load("painter_input", {});
    if(cached.artName) artName.value = cached.artName;
    if(cached.artCategory) artCategory.value = cached.artCategory;
    if(cached.painterComplexity) painterComplexity.value = cached.painterComplexity;
    if(cached.artistHours) artistHours.value = cached.artistHours;
    if(cached.artistColors) artistColors.value = cached.artistColors;
    if(cached.checkedTechs) {
        techChecks.forEach(cb => cb.checked = cached.checkedTechs.includes(cb.value));
    }

    function calculatePainterCost() {
        let comp = parseInt(painterComplexity.value);
        // Garante que o valor fique dentro do range de 1 a 3 caso venha lixo do cache anterior
        if (comp < 1) comp = 1;
        if (comp > 3) comp = 3;

        const currentLevel = complexityLevels[comp];
        document.getElementById("painterCompLabel").innerText = `Complexidade do Trabalho: ${currentLevel.name}`;

        // Cálculo da base líquida de esforço técnico (Valores baseados puramente no tempo e execução manual)
        let valorBaseEsforco = 10; 
        let addCores = parseInt(artistColors.value || 0) * 1.5;
        
        let countTechs = 0;
        let checkedValues = [];
        techChecks.forEach(cb => {
            if(cb.checked) {
                countTechs++;
                checkedValues.push(cb.value);
            }
        });
        let addTechs = countTechs * 4;

        let hoursSpent = parseFloat(artistHours.value || 0);
        let valorHorasTrabalho = hoursSpent * 10; // Valor hora técnica de bancada limpa

        // Base líquida total gerada pelo esforço do projeto
        let custoLiquidoMaoDeObra = valorBaseEsforco + addCores + addTechs + valorHorasTrabalho;

        // Aplicação das travas percentuais máximas acordadas com a artista
        let comissaoArtistaFaturada = custoLiquidoMaoDeObra * currentLevel.rate;

        // Faixas de repasse (Mínimo aceitável, Ideal acordado, Máximo teto para projetos complexos)
        let precoMinimo = comissaoArtistaFaturada * 0.90;
        let precoIdealCalculado = comissaoArtistaFaturada;
        let precoPremium = comissaoArtistaFaturada * 1.15;

        // Atualização da interface da área da artista
        document.getElementById("pMin").innerText = `R$ ${precoMinimo.toFixed(2).replace('.', ',')}`;
        document.getElementById("pIdeal").innerText = `R$ ${precoIdealCalculado.toFixed(2).replace('.', ',')}`;
        document.getElementById("pPremium").innerText = `R$ ${precoPremium.toFixed(2).replace('.', ',')}`;

        TPS_Storage.save("painter_input", {
            artName: artName.value,
            artCategory: artCategory.value,
            painterComplexity: comp,
            artistHours: artistHours.value,
            artistColors: artistColors.value,
            checkedTechs: checkedValues
        });
    }

    [artName, artCategory, painterComplexity, artistHours, artistColors].forEach(el => {
        el.addEventListener("input", calculatePainterCost);
    });
    techChecks.forEach(cb => cb.addEventListener("change", calculatePainterCost));

    calculatePainterCost();
});