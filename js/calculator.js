document.addEventListener("DOMContentLoaded", () => {
    let currentSize = "pequena";
    const complexityDetails = {
        1: { name: "Simples", desc: "Cores planas, sem sombreadores.", price: 20 },
        2: { name: "Intermediária", desc: "Sombras básicas e degradês leves.", price: 40 },
        3: { name: "Premium", desc: "Sombras, degradê, anime detalhado.", price: 80 },
        4: { name: "Ultra detalhada", desc: "Efeitos realistas, texturas e micro-detalhes.", price: 150 }
    };

    const sizeBases = { pequena: 30, media: 70, grande: 140, gigante: 280 };
    const finishBases = { economico: 10, padrao: 25, premium: 60 };

    const paintToggle = document.getElementById("paintToggle");
    const complexityWrapper = document.getElementById("complexityWrapper");
    const paintComplexity = document.getElementById("paintComplexity");
    const complexityLabel = document.getElementById("complexityLabel");
    const complexityDesc = document.getElementById("complexityDesc");
    const productType = document.getElementById("productType");
    const ideaDescription = document.getElementById("ideaDescription");
    const finishQuality = document.getElementById("finishQuality");
    const fileInput = document.getElementById("fileInput");
    const previewBox = document.getElementById("previewBox");

    const cachedData = TPS_Storage.load("client_input", {});
    if (cachedData.productType) productType.value = cachedData.productType;
    if (cachedData.ideaDescription) ideaDescription.value = cachedData.ideaDescription;
    if (cachedData.finishQuality) finishQuality.value = cachedData.finishQuality;
    if (cachedData.paintToggle !== undefined) paintToggle.checked = cachedData.paintToggle;
    if (cachedData.paintComplexity) paintComplexity.value = cachedData.paintComplexity;
    if (cachedData.size) currentSize = cachedData.size;

    const sizeButtons = document.querySelectorAll("#sizeGrid .grid-btn");
    sizeButtons.forEach(btn => {
        if(btn.dataset.size === currentSize) btn.classList.add("active");
        else btn.classList.remove("active");

        btn.addEventListener("click", () => {
            sizeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentSize = btn.dataset.size;
            calculatePrice();
        });
    });

    fileInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewBox.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                TPS_Storage.save("client_img", e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    const cachedImg = localStorage.getItem("tps_client_img");
    if(cachedImg) previewBox.innerHTML = `<img src="${cachedImg}" alt="Preview">`;

    function calculatePrice() {
        const isPainted = paintToggle.checked;
        complexityWrapper.style.display = isPainted ? "block" : "none";
        
        let compValue = parseInt(paintComplexity.value);
        let paintCost = isPainted ? complexityDetails[compValue].price : 0;
        
        if (isPainted) {
            complexityLabel.innerText = `Complexidade da Pintura: ${complexityDetails[compValue].name}`;
            complexityDesc.innerText = `"${complexityDetails[compValue].desc}"`;
        }

        let baseSizePrice = sizeBases[currentSize];
        let finishPrice = finishBases[finishQuality.value];

        let valorCalculado = (baseSizePrice + finishPrice + paintCost) * 1.20;

        let minPrice = roundToTavolaPattern(valorCalculado * 0.85);
        let medPrice = roundToTavolaPattern(valorCalculado);
        let maxPrice = roundToTavolaPattern(valorCalculado * 1.25);

        document.getElementById("priceMin").innerText = `R$ ${minPrice.toFixed(2).replace('.', ',')}`;
        document.getElementById("priceMed").innerText = `R$ ${medPrice.toFixed(2).replace('.', ',')}`;
        document.getElementById("priceMax").innerText = `R$ ${maxPrice.toFixed(2).replace('.', ',')}`;

        TPS_Storage.save("client_input", {
            productType: productType.value,
            ideaDescription: ideaDescription.value,
            finishQuality: finishQuality.value,
            paintToggle: isPainted,
            paintComplexity: compValue,
            size: currentSize
        });
    }

    [productType, ideaDescription, finishQuality, paintToggle, paintComplexity].forEach(el => {
        el.addEventListener("input", calculatePrice);
    });

    document.getElementById("btnWhatsapp").addEventListener("click", () => {
        let msg = `Olá, fiz uma simulação no site da Távola e gostaria de um orçamento oficial.\n\n` +
                  `• Produto: ${productType.value}\n` +
                  `• Tamanho: ${currentSize.toUpperCase()}\n` +
                  `• Acabamento: ${finishQuality.value.toUpperCase()}\n` +
                  `• Pintura: ${paintToggle.checked ? complexityDetails[paintComplexity.value].name : 'Sem pintura'}`;
        window.open(`https://wa.me/5585999999999?text=${encodeURIComponent(msg)}`, '_blank');
    });

    calculatePrice();
});
