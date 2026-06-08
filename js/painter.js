document.addEventListener('DOMContentLoaded', () => {
    const artName = document.getElementById('artName');
    const artCategory = document.getElementById('artCategory');
    const painterComplexity = document.getElementById('painterComplexity');
    const painterCompLabel = document.getElementById('painterCompLabel');
    const artistHours = document.getElementById('artistHours');
    const artistColors = document.getElementById('artistColors');
    const techChecks = document.querySelectorAll('.tech-check');

    const pMin = document.getElementById('pMin');
    const pIdeal = document.getElementById('pIdeal');
    const pPremium = document.getElementById('pPremium');

    const complexityBonusMap = {
        1: { name: 'Simples', bonusText: '+15% Bônus de Complexidade', multiplier: 1.15 },
        2: { name: 'Avançada / Média', bonusText: '+30% Bônus de Complexidade', multiplier: 1.30 },
        3: { name: 'Master / Ultra', bonusText: '+50% Bônus de Complexidade', multiplier: 1.50 }
    };

    const cached = TPS_Storage.load('painter_input', {});
    if (cached.artName) artName.value = cached.artName;
    if (cached.artCategory) artCategory.value = cached.artCategory;
    if (cached.painterComplexity) painterComplexity.value = cached.painterComplexity;
    if (cached.artistHours) artistHours.value = cached.artistHours;
    if (cached.artistColors) artistColors.value = cached.artistColors;
    if (cached.checkedTechs) {
        techChecks.forEach(cb => cb.checked = cached.checkedTechs.includes(cb.value));
    }

    function calculateArtistPayout() {
        const currentComp = complexityBonusMap[painterComplexity.value] || complexityBonusMap[1];
        painterCompLabel.innerText = `Complexidade do Trabalho: ${currentComp.name} (${currentComp.bonusText})`;

        const hours = parseFloat(artistHours.value) || 0;
        const colors = parseFloat(artistColors.value) || 0;

        const valorBaseEsforco = 10.00;
        const addCores = colors * 1.50;

        let selectedTechsCount = 0;
        techChecks.forEach(check => {
            if (check.checked) selectedTechsCount++;
        });
        const addTechs = selectedTechsCount * 4.00;

        const valorHorasTrabalho = hours * 10.00;
        const custoLiquidoMaoDeObra = valorBaseEsforco + addCores + addTechs + valorHorasTrabalho;

        const maoDeObraIdeal = custoLiquidoMaoDeObra * currentComp.multiplier;
        const repasseMinimoDiaria = maoDeObraIdeal * 0.90;
        const tetoMaximoProjeto = maoDeObraIdeal * 1.20;

        if (pMin) pMin.innerText = `R$ ${repasseMinimoDiaria.toFixed(2).replace('.', ',')}`;
        if (pIdeal) pIdeal.innerText = `R$ ${maoDeObraIdeal.toFixed(2).replace('.', ',')}`;
        if (pPremium) pPremium.innerText = `R$ ${tetoMaximoProjeto.toFixed(2).replace('.', ',')}`;

        const checkedValues = [];
        techChecks.forEach(cb => {
            if (cb.checked) checkedValues.push(cb.value);
        });

        TPS_Storage.save('painter_input', {
            artName: artName.value,
            artCategory: artCategory.value,
            painterComplexity: painterComplexity.value,
            artistHours: artistHours.value,
            artistColors: artistColors.value,
            checkedTechs: checkedValues
        });
    }

    [artName, artCategory, painterComplexity, artistHours, artistColors].forEach(el => {
        el.addEventListener('input', calculateArtistPayout);
    });
    techChecks.forEach(check => check.addEventListener('change', calculateArtistPayout));

    calculateArtistPayout();
});
