/**
 * Timer functions for classic and speed run modes
 */

import { state } from './state.js';
import { elements } from './elements.js';
import { t } from './i18n.js';
import { announceToScreenReader } from './utils.js';

export function startTimer(callbacks = {}) {
    const { onTimeUp } = callbacks;

    if (!state.timerEnabled) return;

    state.timerRemaining = state.timerDuration;
    elements.timerContainer.classList.add('active');
    updateTimerDisplay();

    const circumference = 2 * Math.PI * 45;
    elements.timerCircle.style.strokeDasharray = circumference;
    elements.timerCircle.style.strokeDashoffset = 0;

    state.timerInterval = setInterval(() => {
        state.timerRemaining--;
        updateTimerDisplay();

        const offset = circumference * (1 - state.timerRemaining / state.timerDuration);
        elements.timerCircle.style.strokeDashoffset = offset;

        if (state.timerRemaining <= 5) {
            elements.timerCircle.classList.add('warning');
            elements.timerText.classList.add('warning');
        }

        if (state.timerRemaining <= 0) {
            stopTimer();
            if (onTimeUp) onTimeUp();
        }
    }, 1000);
}

export function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    elements.timerCircle.classList.remove('warning');
    elements.timerText.classList.remove('warning');
}

export function updateTimerDisplay() {
    elements.timerText.textContent = state.timerRemaining;
}

export function startSpeedRunTimer(callbacks = {}) {
    const { onTimeUp } = callbacks;

    state.speedRunTimeRemaining = 60;
    elements.timerContainer.classList.add('active');
    updateSpeedRunTimerDisplay();

    const circumference = 2 * Math.PI * 45;
    elements.timerCircle.style.strokeDasharray = circumference;
    elements.timerCircle.style.strokeDashoffset = 0;

    state.speedRunTimer = setInterval(() => {
        state.speedRunTimeRemaining--;
        updateSpeedRunTimerDisplay();

        const offset = circumference * (1 - state.speedRunTimeRemaining / 60);
        elements.timerCircle.style.strokeDashoffset = offset;

        const progress = (state.speedRunTimeRemaining / 60) * 100;
        elements.progressFill.style.width = `${progress}%`;

        if (state.speedRunTimeRemaining <= 10) {
            elements.timerCircle.classList.add('warning');
            elements.timerText.classList.add('warning');
        }

        if (state.speedRunTimeRemaining <= 0) {
            stopSpeedRunTimer();
            if (onTimeUp) onTimeUp();
        }
    }, 1000);
}

export function stopSpeedRunTimer() {
    if (state.speedRunTimer) {
        clearInterval(state.speedRunTimer);
        state.speedRunTimer = null;
    }
    elements.timerCircle.classList.remove('warning');
    elements.timerText.classList.remove('warning');
}

export function updateSpeedRunTimerDisplay() {
    elements.timerText.textContent = state.speedRunTimeRemaining;
}
