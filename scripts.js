﻿document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const resultDiv = document.getElementById('result');
    const ghostText = document.getElementById('ghostText');

    let dictionaryData = {};
    let lastQuery = '';

    // Sözlük verilerini yükleme
    try {
        const response = await fetch('semantic.json');
        dictionaryData = await response.json();
    } catch (error) {
        console.error('Sözlük yüklenirken bir hata oluştu:', error);
        resultDiv.innerHTML = '<h3 class="error">Sözlük yüklenirken bir hata oluştu.</h3>';
    }

    // Arama Fonksiyonu
    function searchWord(query) {
        if (query === lastQuery) {
            return;
        }
        lastQuery = query;

        resultDiv.innerHTML = '';

        if (query.length === 0) {
            ghostText.textContent = ""; // Boş sorgu durumunda hayalet metni temizle
            return;
        }

        const filteredWords = Object.keys(dictionaryData)
            .filter(word => word.toLowerCase().startsWith(query.toLowerCase()))
            .sort();

        if (filteredWords.length === 0) {
            resultDiv.innerHTML = '<h3 class="error">Aradığınız kelime bulunamadı.</h3>';
            ghostText.textContent = ""; // Kelime bulunamadığında hayalet metni temizle
            return;
        }

        filteredWords.forEach(word => {
            const wordDetails = dictionaryData[word];
            const description = wordDetails.description.replace(/<br>/g, "");
            resultDiv.innerHTML += `
                <div class="word">
                    
                </div>
                <p class="description">${highlightWords(sanitizeHTML(description))}</p>
            `;
        });

        resultDiv.style.animation = 'none';
        resultDiv.offsetHeight; // Reflow'u tetikle
        resultDiv.style.animation = 'fadeIn 1s ease-in-out';
    }

    // HTML İçeriğini Temizleme
    function sanitizeHTML(htmlString) {
        return DOMPurify.sanitize(htmlString, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
            ALLOWED_ATTR: ['href', 'class'],
        });
    }

    // Özel Kelimeleri Vurgulama
    function highlightWords(text) {
        const highlightWords = ['Ottoman', 'Middle', 'Proto', 'old'];
        highlightWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            text = text.replace(regex, `<span class="highlight">${word}</span>`);
        });
        return text;
    }

    // Eksik Harfleri Hayalet Olarak Gösterme (Placeholder Güncelleme)
    function updateSearchBoxPlaceholder(query) {
        const queryLower = query.toLowerCase();
        const matchingWord = Object.keys(dictionaryData)
            .find(word => word.toLowerCase().startsWith(queryLower));

        if (matchingWord) {
            const remainingPart = matchingWord.substring(query.length);
            ghostText.textContent = remainingPart;

            // Hayalet metni konumlandırma
            const inputRect = searchBox.getBoundingClientRect();
            const inputStyle = window.getComputedStyle(searchBox);
            const paddingLeft = parseFloat(inputStyle.paddingLeft);
            const fontSize = parseFloat(inputStyle.fontSize);

            // İlk harfin sağında başlamak için
            const firstCharWidth = getTextWidth(query, fontSize);
            ghostText.style.left = `${paddingLeft + firstCharWidth}px`;
        } else {
            ghostText.textContent = "";
        }
    }

    // Metin genişliğini hesaplama
    function getTextWidth(text, fontSize) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontSize}px 'Poppins', sans-serif`;
        return context.measureText(text).width;
    }

    // Arama Kutusu Etkinlik Dinleyicisi
    searchBox.addEventListener('input', () => {
        const query = searchBox.value.trim();
        updateSearchBoxPlaceholder(query);
        searchWord(query);
    });
});