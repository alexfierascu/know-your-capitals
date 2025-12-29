/**
 * Hint system functions
 */

import { state } from './state.js';
import { elements } from './elements.js';
import { t } from './i18n.js';

export function useLetterHint() {
    if (state.hintsLetter <= 0 || state.answered || state.letterHintUsed) return;

    state.hintsLetter--;
    state.letterHintUsed = true;
    state.hintsUsedThisQuiz = (state.hintsUsedThisQuiz || 0) + 1;
    elements.hintLetterCount.textContent = state.hintsLetter;

    if (state.hintsLetter <= 0) {
        elements.hintLetter.disabled = true;
    }

    const correctAnswer = state.currentOptions[state.currentCorrectIndex];
    const firstLetter = correctAnswer.charAt(0).toUpperCase();

    const hintElement = document.createElement('p');
    hintElement.className = 'question-hint';
    hintElement.textContent = `${t('hints.startsWith')} "${firstLetter}"`;
    hintElement.setAttribute('role', 'alert');

    const existingHint = document.querySelector('.question-hint');
    if (existingHint) existingHint.remove();

    elements.questionText.parentNode.appendChild(hintElement);
}

export function useEliminateHint() {
    if (state.hintsEliminate <= 0 || state.answered) return;

    const wrongOptions = state.currentOptions
        .map((opt, idx) => ({ opt, idx }))
        .filter(({ idx }) => idx !== state.currentCorrectIndex && !state.eliminatedOptions.includes(idx));

    if (wrongOptions.length === 0) return;

    state.hintsEliminate--;
    state.hintsUsedThisQuiz = (state.hintsUsedThisQuiz || 0) + 1;
    elements.hintEliminateCount.textContent = state.hintsEliminate;

    if (state.hintsEliminate <= 0) {
        elements.hintEliminate.disabled = true;
    }

    const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    state.eliminatedOptions.push(toEliminate.idx);

    const allOptions = elements.optionsContainer.querySelectorAll('.option');
    allOptions[toEliminate.idx].classList.add('eliminated');
    allOptions[toEliminate.idx].setAttribute('aria-disabled', 'true');
}

export function updateHintButtons() {
    elements.hintLetterCount.textContent = state.hintsLetter;
    elements.hintEliminateCount.textContent = state.hintsEliminate;
    elements.hintLetter.disabled = state.hintsLetter <= 0;
    elements.hintEliminate.disabled = state.hintsEliminate <= 0;
}

export function resetHints() {
    state.hintsLetter = 2;
    state.hintsEliminate = 2;
    state.hintsUsedThisQuiz = 0;
    updateHintButtons();
}
