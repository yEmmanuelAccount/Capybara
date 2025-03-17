/* calculos.js */

// Arrays globais para armazenar ovos, mobs e níveis
let eggs = [];
let mobs = [];
let levels = [];

/* =======================
   Persistência de Dados
========================== */

/**
 * Salva as informações atuais em localStorage no formato JSON.
 */
function saveData() {
  const data = {
    eggs: eggs,
    mobs: mobs,
    levels: levels
  };
  localStorage.setItem('informacoes', JSON.stringify(data));
}

/**
 * Carrega as informações do localStorage, se existirem.
 */
function loadData() {
  const data = localStorage.getItem('informacoes');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      eggs = parsed.eggs || [];
      mobs = parsed.mobs || [];
      levels = parsed.levels || [];
    } catch (e) {
      eggs = [];
      mobs = [];
      levels = [];
    }
  }
}

/* =======================
   Funções Auxiliares
========================== */

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
 * Formata uma data/hora no formato "XXh YYmin ZZs".
 */
function formatDateTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return hours + "h " + minutes + "min " + seconds + "s";
}

/* =======================
   Atualização da Interface
========================== */

/**
 * Recupera as informações do personagem a partir dos campos do formulário.
 */
function getCharacterInfo() {
  const dano = parseNumber(document.getElementById('dano').value || "0");
  const nivel = parseInt(document.getElementById('nivel').value) || 1;
  const xpColetado = parseNumber(document.getElementById('xpColetado').value || "0");
  const ovoSelect = document.getElementById('ovo');
  const selectedEggIndex = ovoSelect.selectedIndex;
  let selectedEgg = null;
  if (ovoSelect.value !== "none" && eggs[selectedEggIndex - 1]) {
    selectedEgg = eggs[selectedEggIndex - 1];
  }
  return { dano, nivel, xpColetado, selectedEgg };
}

/**
 * Obtém o XP requerido para o nível atual a partir do array levels.
 */
function getXpRequirement(currentLevel) {
  const levelObj = levels.find(lvl => lvl.nivel === currentLevel);
  if (levelObj) {
    return parseNumber(levelObj.xp);
  }
  return currentLevel * 1000;
}

/**
 * Atualiza o dropdown de ovos com os ovos adicionados.
 */
function updateEggDropdown() {
  const ovoSelect = document.getElementById('ovo');
  ovoSelect.innerHTML = '<option value="none">Nenhum</option>';
  eggs.forEach((egg, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = egg.nome;
    ovoSelect.appendChild(option);
  });
}

/**
 * Atualiza as cartas dos mobs (Área 3) com os dados e os cálculos realizados.
 */
function updateMobCards() {
  const mobGrid = document.getElementById('mobGrid');
  mobGrid.innerHTML = "";
  const character = getCharacterInfo();
  const xpRequired = getXpRequirement(character.nivel);
  const xpNeeded = Math.max(xpRequired - character.xpColetado, 0);

  mobs.forEach((mob, index) => {
    const tta = calculateTTA(character.dano, mob.vida);
    const tsn = calculateTSN(xpNeeded, mob.xp, tta);
    const killsNeeded = calculateKillsNeeded(xpNeeded, mob.xp);
    let necessaryForEgg = "-";
    if (character.selectedEgg) {
      necessaryForEgg = mob.trofeus > 0 ? Math.ceil(parseNumber(character.selectedEgg.preco) / mob.trofeus) : "N/A";
    }
    
    const card = document.createElement('div');
    card.className = "mob-card";
    card.innerHTML = `
      <h3>${mob.nome}</h3>
      <p>Vida: ${mob.vida}</p>
      <p>Troféus: ${mob.trofeus}</p>
      <p>XP por Abate: ${mob.xp}</p>
      <p>Encontrado na Área: ${mob.area}</p>
      <p>Tempo para Abater: ${formatTime(tta)}</p>
      <p>Tempo para subir de nível: ${formatTime(tsn)}</p>
      <p>Necessários para 1 Ovo: ${necessaryForEgg}</p>
    `;
    mobGrid.appendChild(card);
  });
}

/**
 * Atualiza a carta de análise (Área 2) com o melhor mob para subir de nível.
 */
function updateAnalysis() {
  const character = getCharacterInfo();
  const xpRequired = getXpRequirement(character.nivel);
  const xpNeeded = Math.max(xpRequired - character.xpColetado, 0);
  let bestMob = null;
  let bestTSN = Infinity;
  mobs.forEach(mob => {
    const tta = calculateTTA(character.dano, mob.vida);
    const tsn = calculateTSN(xpNeeded, mob.xp, tta);
    if (tsn < bestTSN) {
      bestTSN = tsn;
      bestMob = mob;
    }
  });
  
  const analysisCard = document.getElementById('analysisCard');
  if (bestMob && bestTSN !== Infinity) {
    const killsNeeded = calculateKillsNeeded(xpNeeded, bestMob.xp);
    const trophiesResult = calculateTrophiesResult(killsNeeded, bestMob.trofeus);
    const finalDate = addSecondsToCurrentTime(bestTSN);
    analysisCard.innerHTML = `
      <h2>Análise: Melhor Mob para Subir de Nível</h2>
      <p>Tempo Final: ${formatDateTime(finalDate)}</p>
      <p>Abates Necessários: ${killsNeeded}</p>
      <p>Troféus Resultantes: ${trophiesResult}</p>
    `;
  } else {
    analysisCard.innerHTML = `
      <h2>Análise: Melhor Mob para Subir de Nível</h2>
      <p>Tempo Final: -</p>
      <p>Abates Necessários: -</p>
      <p>Troféus Resultantes: -</p>
    `;
  }
}

/**
 * Atualiza todos os cálculos e a interface.
 */
function updateCalculations() {
  updateMobCards();
  updateAnalysis();
}

/* =======================
   Configuração de Eventos e Modais
========================== */

// Carrega os dados persistidos ao iniciar
loadData();
updateEggDropdown();
updateCalculations();

// Atualiza os campos do personagem conforme o usuário digita
document.getElementById('dano').addEventListener('input', updateCalculations);
document.getElementById('nivel').addEventListener('input', updateCalculations);
document.getElementById('xpColetado').addEventListener('input', updateCalculations);
document.getElementById('ovo').addEventListener('change', updateCalculations);

// Modal e funcionalidade para "Adicionar Ovo"
document.getElementById('btnAddOvo').addEventListener('click', function() {
  document.getElementById('modalOvo').style.display = "block";
});
document.getElementById('closeOvoModal').addEventListener('click', function() {
  document.getElementById('modalOvo').style.display = "none";
});
document.getElementById('formOvo').addEventListener('submit', function(e) {
  e.preventDefault();
  const nome = document.getElementById('ovoNome').value;
  const preco = document.getElementById('ovoPreco').value;
  const area = parseInt(document.getElementById('ovoArea').value) || 0;
  eggs.push({ nome, preco, area });
  updateEggDropdown();
  document.getElementById('formOvo').reset();
  document.getElementById('modalOvo').style.display = "none";
  saveData();
  updateCalculations();
});

// Modal e funcionalidade para "Adicionar Mob"
document.getElementById('btnAddMob').addEventListener('click', function() {
  document.getElementById('modalMob').style.display = "block";
});
document.getElementById('closeMobModal').addEventListener('click', function() {
  document.getElementById('modalMob').style.display = "none";
});
document.getElementById('formMob').addEventListener('submit', function(e) {
  e.preventDefault();
  const nome = document.getElementById('mobNome').value;
  const vida = parseNumber(document.getElementById('mobVida').value);
  const trofeus = parseNumber(document.getElementById('mobTrofeus').value);
  const xp = parseNumber(document.getElementById('mobXp').value);
  const area = parseInt(document.getElementById('mobArea').value) || 0;
  mobs.push({ nome, vida, trofeus, xp, area });
  document.getElementById('formMob').reset();
  document.getElementById('modalMob').style.display = "none";
  saveData();
  updateCalculations();
});

// Modal e funcionalidade para "Adicionar Nível"
document.getElementById('btnAddNivel').addEventListener('click', function() {
  document.getElementById('modalNivel').style.display = "block";
});
document.getElementById('closeNivelModal').addEventListener('click', function() {
  document.getElementById('modalNivel').style.display = "none";
});
document.getElementById('formNivel').addEventListener('submit', function(e) {
  e.preventDefault();
  const nivelNumber = parseInt(document.getElementById('nivelNumero').value) || 0;
  const xpValue = document.getElementById('nivelXp').value;
  levels.push({ nivel: nivelNumber, xp: xpValue });
  document.getElementById('formNivel').reset();
  document.getElementById('modalNivel').style.display = "none";
  saveData();
  updateCalculations();
});

// Atualiza os cálculos ao carregar a página
updateCalculations();
