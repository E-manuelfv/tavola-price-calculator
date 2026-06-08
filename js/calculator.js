document.addEventListener('DOMContentLoaded', () => {
    let currentSize = 'pequena';

    const complexityDetails = {
        1: { name: 'Simples', desc: 'Cores planas, sem sombreados complexos.', price: 20 },
        2: { name: 'Intermediária', desc: 'Sombras básicas e cores bem definidas.', price: 40 },
        3: { name: 'Premium', desc: 'Degradês, luz e sombra avançados, alta fidelidade.', price: 80 },
        4: { name: 'Ultra Detalhada', desc: 'Texturização extrema, weathering e microdetalhes.', price: 150 }
    };

    const productType = document.getElementById('productType');
    const paintToggle = document.getElementById('paintToggle');
    const complexityWrapper = document.getElementById('complexityWrapper');
    const paintComplexity = document.getElementById('paintComplexity');
    const complexityLabel = document.getElementById('complexityLabel');
    const complexityDesc = document.getElementById('complexityDesc');
    const ideaDescription = document.getElementById('ideaDescription');
    const finishQuality = document.getElementById('finishQuality');
    const fileInput = document.getElementById('fileInput');
    const previewBox = document.getElementById('previewBox');
    const sizeButtons = document.querySelectorAll('#sizeGrid .grid-btn');

    const cachedData = TPS_Storage.load('client_input', {});
    if (cachedData.productType) productType.value = cachedData.productType;
    if (cachedData.ideaDescription) ideaDescription.value = cachedData.ideaDescription;
    if (cachedData.finishQuality) finishQuality.value = cachedData.finishQuality;
    if (cachedData.paintToggle !== undefined) paintToggle.checked = cachedData.paintToggle;
    if (cachedData.paintComplexity) paintComplexity.value = cachedData.paintComplexity;
    if (cachedData.size) currentSize = cachedData.size;

    function updateSizeDOM() {
        const isKeychain = productType.value === 'Chaveiro';

        if (isKeychain) {
            sizeButtons[0].innerText = '5 cm';
            sizeButtons[1].innerText = '7 cm';
            sizeButtons[2].innerText = '11 cm';
            sizeButtons[3].style.display = 'none';

            if (currentSize === 'gigante') {
                currentSize = 'media';
            }
        } else {
            sizeButtons[0].innerText = 'Pequena (até 10cm)';
            sizeButtons[1].innerText = 'Média (10-20cm)';
            sizeButtons[2].innerText = 'Grande (20-35cm)';
            sizeButtons[3].style.display = 'block';
            sizeButtons[3].innerText = 'Gigante (+35cm)';
        }

        sizeButtons.forEach(btn => {
            if (btn.dataset.size === currentSize) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = btn.dataset.size;
            calculatePrice();
        });
    });

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewBox.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                localStorage.setItem('tps_client_img', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    const cachedImg = localStorage.getItem('tps_client_img');
    if (cachedImg) previewBox.innerHTML = `<img src="${cachedImg}" alt="Preview">`;

    function calculatePrice() {
        updateSizeDOM();

        const isPainted = paintToggle.checked;
        complexityWrapper.style.display = isPainted ? 'block' : 'none';

        const compValue = parseInt(paintComplexity.value, 10) || 1;
        if (isPainted) {
            complexityLabel.innerText = `Complexidade da Pintura: ${complexityDetails[compValue].name}`;
            complexityDesc.innerText = `"${complexityDetails[compValue].desc}"`;
        }

        const currentType = productType.value;
        let baseSizePrice = 0;
        let finishPrice = 0;
        let paintCost = 0;

        if (currentType === 'Chaveiro') {
            const keychainBases = { pequena: 10, media: 15, grande: 22, gigante: 22 };
            baseSizePrice = keychainBases[currentSize] || 10;
            const keychainFinishes = { economico: 1, padrao: 4, premium: 8 };
            finishPrice = keychainFinishes[finishQuality.value] || 1;
            paintCost = isPainted ? complexityDetails[compValue].price * 0.12 : 0;
        } else if (currentType === 'Estátua Decorativa' || currentType === 'Diorama') {
            const statueBases = { pequena: 40, media: 85, grande: 160, gigante: 320 };
            baseSizePrice = statueBases[currentSize] || 30;
            const finishMap = { economico: 10, padrao: 25, premium: 60 };
            finishPrice = (finishMap[finishQuality.value] || 10) * 1.15;
            paintCost = isPainted ? complexityDetails[compValue].price * 1.10 : 0;
        } else {
            const standardSizes = { pequena: 30, media: 70, grande: 140, gigante: 280 };
            baseSizePrice = standardSizes[currentSize] || 30;
            const finishMap = { economico: 10, padrao: 25, premium: 60 };
            finishPrice = finishMap[finishQuality.value] || 10;
            paintCost = isPainted ? complexityDetails[compValue].price : 0;
        }

        const valorCalculado = (baseSizePrice + finishPrice + paintCost) * 1.20;
        let minPrice = roundToTavolaPattern(valorCalculado * 0.85);
        let medPrice = roundToTavolaPattern(valorCalculado);
        let maxPrice = roundToTavolaPattern(valorCalculado * 1.20);

        if (currentType === 'Chaveiro' && medPrice < 19.90) {
            minPrice = 14.90;
            medPrice = 19.90;
            maxPrice = 24.90;
        }

        document.getElementById('priceMin').innerText = `R$ ${minPrice.toFixed(2).replace('.', ',')}`;
        document.getElementById('priceMed').innerText = `R$ ${medPrice.toFixed(2).replace('.', ',')}`;
        document.getElementById('priceMax').innerText = `R$ ${maxPrice.toFixed(2).replace('.', ',')}`;

        TPS_Storage.save('client_input', {
            productType: currentType,
            ideaDescription: ideaDescription.value,
            finishQuality: finishQuality.value,
            paintToggle: isPainted,
            paintComplexity: compValue,
            size: currentSize
        });
    }

    [productType, ideaDescription, finishQuality, paintToggle, paintComplexity].forEach(el => {
        el.addEventListener('input', calculatePrice);
    });

    document.getElementById('btnWhatsapp').addEventListener('click', () => {
        let tamanhoTexto = currentSize.toUpperCase();
        if (productType.value === 'Chaveiro') {
            const nomesChaveiro = { pequena: '5cm', media: '7cm', grande: '11cm' };
            tamanhoTexto = nomesChaveiro[currentSize] || tamanhoTexto;
        }

        const msg = `Olá, fiz uma simulação no site da Távola e gostaria de um orçamento oficial.\n\n` +
                    `• *Produto:* ${productType.value}\n` +
                    `• *Dimensão/Tamanho:* ${tamanhoTexto}\n` +
                    `• *Acabamento:* ${finishQuality.options[finishQuality.selectedIndex].text}\n` +
                    `• *Pintura:* ${paintToggle.checked ? complexityDetails[paintComplexity.value].name : 'Apenas cor base do filamento'}`;

        window.open(`https://wa.me/5585999999999?text=${encodeURIComponent(msg)}`, '_blank');
    });

    calculatePrice();
});
