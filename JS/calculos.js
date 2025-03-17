/* calculos.js */

// Arrays globais para armazenar ovos, mobs e níveis
let eggs = [];
let mobs = [];
let levels = [];

/* =======================
   Persistência de Dados (com Node.js)
========================== */

/**
 * Envia os dados para o servidor para salvar no arquivo informacoes.json.
 */
function sendDataToServer(data) {
  fetch('/informacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => console.log(result.message))
  .catch(err => console.error("Erro ao enviar dados:", err));
}

/**
 * Carrega os dados do servidor.
 */
function loadDataFromServer(callback) {
  fetch('/informacoes')
    .then(response => response.json())
    .then(data => {
      eggs = data.eggs || [];
      mobs = data.mobs || [];
      levels = data.levels || [];
      callback();
    })
    .catch(err => console.error("Erro ao carregar dados:", err));
}

/* =======================
   Funções de Atualização da Interface
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
 * Atualiza o dropdown de ovos.
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
 * Atualiza os cartões dos mobs na área "Mobs Cadastrados", ordenando-os pela vida (maior primeiro).
 */
function updateMobCards() {
  const mobGrid = document.getElementById('mobGrid');
  mobGrid.innerHTML = "<h2>Mobs Cadastrados</h2>";
  const character = getCharacterInfo();
  const xpRequired = getXpRequirement(character.nivel);
  const xpNeeded = Math.max(xpRequired - character.xpColetado, 0);

  const sortedMobs = mobs.slice().sort((a, b) => b.vida - a.vida);

  sortedMobs.forEach((mob) => {
    const tta = calculateTTA(character.dano, mob.vida);
    const tsn = calculateTSN(xpNeeded, mob.xp, tta);
    const killsNeeded = calculateKillsNeeded(xpNeeded, mob.xp);
    let necessaryForEgg = "-";
    if (character.selectedEgg) {
      if (mob.trofeus > 0) {
        let val = Math.ceil(parseNumber(character.selectedEgg.preco) / mob.trofeus);
        necessaryForEgg = formatNumber(val);
      } else {
        necessaryForEgg = "N/A";
      }
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
 * Atualiza a carta de análise com o melhor mob para subir de nível.
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
 * Atualiza a exibição dos ovos cadastrados, ordenando-os do que custa mais para o que custa menos.
 */
function updateEggDisplay() {
  const eggGrid = document.getElementById('eggGrid');
  if (!eggGrid) return;
  eggGrid.innerHTML = "<h2>Ovos Cadastrados</h2>";
  if (eggs.length === 0) {
    eggGrid.innerHTML += "<p>Nenhum ovo cadastrado.</p>";
    return;
  }
  const sortedEggs = eggs.slice().sort((a, b) => parseNumber(b.preco) - parseNumber(a.preco));
  sortedEggs.forEach(egg => {
    const div = document.createElement('div');
    div.className = "egg-card";
    div.innerHTML = `<p>Nome: ${egg.nome}</p>
                     <p>Preço: ${egg.preco}</p>
                     <p>Área: ${egg.area}</p>`;
    eggGrid.appendChild(div);
  });
}

/**
 * Atualiza a exibição dos níveis cadastrados, ordenando-os do menor para o maior.
 */
function updateLevelsDisplay() {
  const levelsGrid = document.getElementById('levelsGrid');
  if (!levelsGrid) return;
  levelsGrid.innerHTML = "<h2>Níveis Cadastrados</h2>";
  if (levels.length === 0) {
    levelsGrid.innerHTML += "<p>Nenhum nível cadastrado.</p>";
    return;
  }
  const sortedLevels = levels.slice().sort((a, b) => a.nivel - b.nivel);
  sortedLevels.forEach(level => {
    const div = document.createElement('div');
    div.className = "level-card";
    div.innerHTML = `<p>Nível: ${level.nivel}</p>
                     <p>XP: ${level.xp}</p>`;
    levelsGrid.appendChild(div);
  });
}

/**
 * Atualiza todos os cálculos, a interface e envia os dados para o servidor.
 */
function updateCalculations() {
  updateMobCards();
  updateAnalysis();
  updateEggDisplay();
  updateLevelsDisplay();
  sendDataToServer({ eggs, mobs, levels });
}

/* =======================
   Configuração de Eventos e Modais
========================== */

// Carrega os dados do servidor ao iniciar
loadDataFromServer(updateEggDropdown);
loadDataFromServer(updateCalculations);

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
  // Verifica duplicata (case-insensitive)
  if(mobs.some(mob => mob.nome.toLowerCase() === nome.toLowerCase())) {
    alert("Esse mob já foi cadastrado.");
    return;
  }
  const vida = parseNumber(document.getElementById('mobVida').value);
  const trofeus = parseNumber(document.getElementById('mobTrofeus').value);
  const xp = parseNumber(document.getElementById('mobXp').value);
  const area = parseInt(document.getElementById('mobArea').value) || 0;
  mobs.push({ nome, vida, trofeus, xp, area });
  document.getElementById('formMob').reset();
  document.getElementById('modalMob').style.display = "none";
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
  // Verifica duplicata
  if(levels.some(lvl => lvl.nivel === nivelNumber)) {
    alert("Esse nível já foi cadastrado.");
    return;
  }
  const xpValue = document.getElementById('nivelXp').value;
  levels.push({ nivel: nivelNumber, xp: xpValue });
  document.getElementById('formNivel').reset();
  document.getElementById('modalNivel').style.display = "none";
  updateCalculations();
});
