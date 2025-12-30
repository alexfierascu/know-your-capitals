/**
 * Option generation logic
 */

import { state } from '../data/state.js';
import { shuffleArray } from '../utils/utils.js';

export function getCitiesForCountry(countryName) {
    return state.cities[countryName] || [];
}

export function getRandomCapitals(count, exclude = []) {
    const availableCapitals = state.countries
        .map(c => c.capital)
        .filter(capital => !exclude.includes(capital));

    return shuffleArray(availableCapitals).slice(0, count);
}

export function getRandomForeignCities(count, excludeCountry) {
    const foreignCities = Object.entries(state.cities)
        .filter(([country]) => country !== excludeCountry)
        .flatMap(([, cities]) => cities);

    return shuffleArray(foreignCities).slice(0, count);
}

export function generateOptions(country, difficulty) {
    const correctAnswer = country.capital;
    let options = [correctAnswer];

    switch (difficulty) {
        case 'easy':
            const sameCities = shuffleArray(getCitiesForCountry(country.name)).slice(0, 3);
            options = options.concat(sameCities);
            break;
        case 'medium':
            const localCities = shuffleArray(getCitiesForCountry(country.name)).slice(0, 2);
            const foreignCity = getRandomForeignCities(1, country.name);
            options = options.concat(localCities, foreignCity);
            break;
        case 'hard':
            const otherCapitals = getRandomCapitals(3, [country.capital]);
            options = options.concat(otherCapitals);
            break;
    }

    return shuffleArray(options);
}
