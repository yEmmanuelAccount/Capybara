/* funcoes.js */

/**
 * Converte uma string com formato "texto e número" (ex.: "6M") para um número real.
 */
function parseNumber(value) {
    value = value.trim().toLowerCase();
    const multipliers = {
        'k': 1e3,
        'm': 1e6,
        'b': 1e9,
        't': 1e12,
        'q': 1e15
    };

    const regex = /^([\d\.]+)\s*([kmbtq])?$/;
    const match = value.match(regex);
    if (!match) return parseFloat(value) || 0;

    let number = parseFloat(match[1]);
    const suffix = match[2];

    if (suffix && multipliers[suffix]) {
        number *= multipliers[suffix];
    }
    return number;
}

/**
 * Formata um tempo em segundos para uma string.
 * Se for menor que 60s, mostra somente segundos;
 * se for entre 1 minuto e 1 hora, mostra minutos e segundos;
 * se for maior, mostra horas, minutos e segundos.
 */
function formatTime(seconds) {
    seconds = Math.round(seconds);
    if (seconds < 60) {
        return seconds + "s";
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return minutes + "min " + sec + "s";
    } else {
        const hours = Math.floor(seconds / 3600);
        const remainder = seconds % 3600;
        const minutes = Math.floor(remainder / 60);
        const sec = remainder % 60;
        return hours + "h " + minutes + "min " + sec + "s";
    }
}

/**
 * Calcula o "Tempo para Abater" (TTA) dividindo a vida do mob pelo dano do personagem.
 */
function calculateTTA(dano, vida) {
    if (dano <= 0) return 0;
    return vida / dano;
}

/**
 * Calcula o "Tempo para Subir de Nível" (TSN) com base no XP restante, XP por abate e TTA.
 */
function calculateTSN(xpNeeded, mobXp, tta) {
    if (mobXp <= 0) return Infinity;
    const killsNeeded = xpNeeded / mobXp;
    return killsNeeded * tta;
}

/**
 * Calcula a quantidade de abates necessários para alcançar o XP necessário.
 */
function calculateKillsNeeded(xpNeeded, mobXp) {
    if (mobXp <= 0) return Infinity;
    return Math.ceil(xpNeeded / mobXp);
}

/**
 * Calcula o total de troféus obtidos após um número de abates.
 */
function calculateTrophiesResult(kills, mobTrophies) {
    return kills * mobTrophies;
}

/**
 * Adiciona um determinado número de segundos à data/hora atual.
 */
function addSecondsToCurrentTime(seconds) {
    const now = new Date();
    now.setSeconds(now.getSeconds() + seconds);
    return now;
}

/**
 * Formata uma data/hora no formato "XXh YYmin ZZs" (apenas para exibição do tempo final).
 */
function formatDateTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    return hours + "h " + minutes + "min " + seconds + "s";
}
