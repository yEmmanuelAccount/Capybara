/* funcoes.js */

/**
 * Converte uma string com formato "texto e número" (ex.: "6M" ou "3,5M") para um número real.
 */
function parseNumber(value) {
    value = value.trim().toLowerCase().replace(',', '.');
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
   * Formata um número separando os milhares com pontos.
   * Exemplo: 1000 → "1.000"
   */
  function formatNumber(num) {
    return num.toLocaleString('pt-BR');
  }
  
  /**
   * Formata um tempo em segundos para uma string.
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
   * Calcula o "Tempo para Abater" (TTA).
   * Se o dano for maior que a vida, retorna 1 segundo.
   */
  function calculateTTA(dano, vida) {
    if (dano <= 0) return 0;
    if (dano > vida) return 1;
    return vida / dano;
  }
  
  /**
   * Calcula o "Tempo para Subir de Nível" (TSN).
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
   * Formata uma data/hora no formato "XXh YYmin ZZs".
   */
  function formatDateTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    return hours + "h " + minutes + "min " + seconds + "s";
  }
  