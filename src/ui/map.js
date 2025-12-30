/**
 * Map preview functionality
 */

import { state } from '../data/state.js';
import { elements } from './elements.js';
import { CAPITAL_COORDINATES } from '../utils/constants.js';
import { getCountryCode } from '../utils/utils.js';

export function showMap() {
    const country = state.questions[state.currentQuestionIndex];
    const countryName = country.name;
    const countryCode = getCountryCode(countryName);
    const coords = CAPITAL_COORDINATES[countryName];

    if (coords) {
        const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=6&output=embed`;

        elements.europeMapContainer.innerHTML = `
            <iframe
                class="google-map-iframe"
                src="${mapUrl}"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Map showing ${countryName}">
            </iframe>
        `;
    } else {
        elements.europeMapContainer.innerHTML = `
            <div class="map-fallback">
                <span>📍</span>
                <p>${countryName}</p>
            </div>
        `;
    }

    const flagUrl = `https://flagcdn.com/w160/${countryCode}.png`;

    elements.mapImage.classList.add('loading');
    elements.mapImage.src = flagUrl;
    elements.mapImage.alt = `Flag of ${countryName}`;

    elements.mapImage.onload = () => {
        elements.mapImage.classList.remove('loading');
    };

    elements.mapImage.onerror = () => {
        elements.mapImage.classList.remove('loading');
        elements.mapImage.src = `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;
    };

    elements.mapCaption.innerHTML = `
        <strong>${country.capital}</strong> is the capital of <strong>${countryName}</strong>
    `;

    const facts = state.funFacts[country.capital];
    if (facts && facts.length > 0) {
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        elements.funFactText.textContent = randomFact;
        elements.funFact.hidden = false;
    } else {
        elements.funFact.hidden = true;
    }

    elements.mapContainer.style.display = 'block';
    elements.mapContainer.offsetHeight;
    elements.mapContainer.classList.add('visible');
}

export function hideMap() {
    elements.mapContainer.classList.remove('visible');
    elements.funFact.hidden = true;
    setTimeout(() => {
        if (!elements.mapContainer.classList.contains('visible')) {
            elements.mapContainer.style.display = 'none';
            elements.europeMapContainer.innerHTML = '';
        }
    }, 300);
}
