/**
 * Share results functionality
 */

import { state } from '../data/state.js';
import { elements } from './elements.js';
import { t } from '../utils/i18n.js';

export function getRegionName(regionId) {
    const regionKeys = {
        'all': 'regions.all',
        'western': 'regions.western',
        'northern': 'regions.northern',
        'southern': 'regions.southern',
        'eastern': 'regions.eastern',
        'baltic': 'regions.baltic',
        'balkans': 'regions.balkans',
        'speedrun': 'settings.speedRun'
    };
    const translationKey = regionKeys[regionId];
    if (translationKey) {
        return t(translationKey);
    }
    const region = state.regions.find(r => r.id === regionId);
    return region ? region.name : t('regions.all');
}

export function shareResults() {
    const questionsAnswered = state.gameMode === 'speedrun'
        ? state.speedRunQuestionsAnswered
        : state.totalQuestions;
    const percentage = questionsAnswered > 0
        ? Math.round((state.score / questionsAnswered) * 100)
        : 0;
    const difficultyText = t(`difficulty.${state.difficulty}`);

    let shareText;
    if (state.gameMode === 'speedrun') {
        shareText = `🌍 ${t('share.title')} - ⚡ ${t('share.speedRunMode')}\n\n` +
            `📊 ${t('share.score')}: ${state.score}/${questionsAnswered} (${percentage}%)\n` +
            `⏱️ ${t('share.mode')}: ${t('share.60secondChallenge')}\n` +
            `🎯 ${t('share.difficultyLabel')}: ${difficultyText}\n` +
            `👤 ${t('share.player')}: ${state.playerName}\n\n` +
            `${t('share.speedChallenge')} 🏆`;
    } else {
        const regionName = getRegionName(state.selectedRegion);
        shareText = `🌍 ${t('share.title')}\n\n` +
            `📊 ${t('share.score')}: ${state.score}/${questionsAnswered} (${percentage}%)\n` +
            `🎯 ${t('share.difficultyLabel')}: ${difficultyText}\n` +
            `🗺️ ${t('share.regionLabel')}: ${regionName}\n` +
            `👤 ${t('share.player')}: ${state.playerName}\n\n` +
            `${t('share.challenge')} 🏆`;
    }

    if (navigator.share) {
        navigator.share({
            title: t('share.title'),
            text: shareText
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
    });
}

export function shareResultsAsImage() {
    const questionsAnswered = state.gameMode === 'speedrun'
        ? state.speedRunQuestionsAnswered
        : state.totalQuestions;
    const percentage = questionsAnswered > 0
        ? Math.round((state.score / questionsAnswered) * 100)
        : 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 400;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#0f1729' : '#f8f6f1';
    const textColor = isDark ? '#f4f1e8' : '#1a1a2e';
    const accentColor = '#c9a227';
    const mutedColor = isDark ? '#8b8b8b' : '#666666';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = isDark ? 'rgba(201, 162, 39, 0.3)' : 'rgba(201, 162, 39, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 28px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('share.title'), canvas.width / 2, 75);

    ctx.fillStyle = mutedColor;
    ctx.font = '14px "Source Sans 3", sans-serif';
    const modeText = state.gameMode === 'speedrun'
        ? `⚡ ${t('share.speedRunModeLabel')}`
        : `🎯 ${t('share.classicMode')}`;
    ctx.fillText(modeText, canvas.width / 2, 100);

    const centerX = canvas.width / 2;
    const centerY = 190;
    const radius = 60;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? 'rgba(201, 162, 39, 0.1)' : 'rgba(201, 162, 39, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
    ctx.fillText(`${state.score}/${questionsAnswered}`, centerX, centerY + 5);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 20px "Source Sans 3", sans-serif';
    ctx.fillText(`${percentage}%`, centerX, centerY + 35);

    const statsY = 290;
    ctx.fillStyle = textColor;
    ctx.font = '16px "Source Sans 3", sans-serif';

    const difficultyText = t(`difficulty.${state.difficulty}`);

    if (state.gameMode === 'speedrun') {
        ctx.fillText(`⏱️ ${t('share.60seconds')}  •  🎯 ${difficultyText}  •  🔥 ${t('stats.bestStreak')}: ${state.maxStreak}`, centerX, statsY);
    } else {
        const regionName = getRegionName(state.selectedRegion);
        ctx.fillText(`🗺️ ${regionName}  •  🎯 ${difficultyText}`, centerX, statsY);
    }

    ctx.fillStyle = mutedColor;
    ctx.font = '18px "Source Sans 3", sans-serif';
    ctx.fillText(`${t('share.player')}: ${state.playerName}`, centerX, 330);

    ctx.fillStyle = mutedColor;
    ctx.font = '12px "Source Sans 3", sans-serif';
    ctx.fillText(`${t('share.challenge')} 🏆`, centerX, 365);

    canvas.toBlob((blob) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'quiz-results.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'quiz-results.png', { type: 'image/png' });
            navigator.share({
                title: `${t('share.title')} - ${t('share.results')}`,
                text: t('share.scoreMessage', { score: state.score, total: questionsAnswered, percent: percentage }),
                files: [file]
            }).catch(() => {
                downloadImage(blob);
            });
        } else {
            downloadImage(blob);
        }
    }, 'image/png');
}

export function downloadImage(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `european-capitals-quiz-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('toast.imageDownloaded'));
}

export function showToast(message = null) {
    elements.shareToast.textContent = message || t('toast.copied');
    elements.shareToast.hidden = false;
    elements.shareToast.classList.add('visible');

    setTimeout(() => {
        elements.shareToast.classList.remove('visible');
        setTimeout(() => {
            elements.shareToast.hidden = true;
        }, 300);
    }, 2500);
}
