/**
 * Question review functionality
 */

import { state } from './state.js';
import { elements } from './elements.js';
import { t } from './i18n.js';

export function recordAnswer(selectedOption) {
    const country = state.questions[state.currentQuestionIndex];
    const correctAnswer = country.capital;

    state.answeredQuestions.push({
        question: `${t('quiz.questionPrefix')} ${country.name}?`,
        userAnswer: selectedOption,
        correctAnswer: correctAnswer,
        isCorrect: selectedOption === correctAnswer
    });
}

export function renderReview() {
    elements.reviewList.innerHTML = '';

    state.answeredQuestions.forEach((item, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${item.isCorrect ? '' : 'wrong'}`;

        let answerHtml;
        if (item.userAnswer === null) {
            answerHtml = `<span class="wrong">${t('results.noAnswer')}</span> → <span class="correct">${item.correctAnswer}</span>`;
        } else if (item.isCorrect) {
            answerHtml = `<span class="correct">${item.correctAnswer}</span>`;
        } else {
            answerHtml = `<span class="wrong">${item.userAnswer}</span> → <span class="correct">${item.correctAnswer}</span>`;
        }

        reviewItem.innerHTML = `
            <p class="review-question">${index + 1}. ${item.question}</p>
            <p class="review-answer">${answerHtml}</p>
        `;

        elements.reviewList.appendChild(reviewItem);
    });
}

export function toggleReview() {
    const isHidden = elements.reviewContainer.hidden;
    elements.reviewContainer.hidden = !isHidden;
    elements.toggleReview.setAttribute('aria-expanded', isHidden);

    if (isHidden) {
        renderReview();
    }
}
