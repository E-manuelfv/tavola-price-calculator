document.addEventListener("DOMContentLoaded", () => {
    const artName = document.getElementById("artName");
    const artCategory = document.getElementById("artCategory");
    const painterComplexity = document.getElementById("painterComplexity");
    const artistHours = document.getElementById("artistHours");
    const artistColors = document.getElementById("artistColors");
    const techChecks = document.querySelectorAll(".tech-check");

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
        document.getElementById("painterCompLabel").innerText = `Complexidade do Trabalho: Nível ${comp}`;

        let valorBase = 15;
        let addComplexidade = comp * 5;
        let addCores = parseInt(artistColors.value) * 2;
        
        let countTechs = 0;
        let checkedValues = [];
        techChecks.forEach(cb => {
            if(cb.checked) {
                countTechs++;
                checkedValues.push(cb.value);
            }
        });
        let addTechs = countTechs * 3;

        let hoursSpent = parseFloat(artistHours.value);
        let valorHorasIdeal = hoursSpent * 8;

        let precoIdealCalculado = valorBase + addComplexidade + addCores + addTechs + valorHorasIdeal;

        let precoMinimo = precoIdealCalculado * 0.80;
        let precoPremium = precoIdealCalculado * 1.35;

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
