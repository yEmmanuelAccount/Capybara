const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());
// Servir arquivos estáticos a partir da raiz (incluindo CSS, HTML, JS e informacoes.json)
app.use(express.static(__dirname));

// Caminho para o arquivo informacoes.json
const dataFile = path.join(__dirname, 'informacoes.json');

// Endpoint para obter os dados salvos
app.get('/informacoes', (req, res) => {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao ler os dados.' });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (e) {
      res.json({});
    }
  });
});

// Endpoint para salvar os dados (recebe objeto JSON)
app.post('/informacoes', (req, res) => {
  const newData = req.body;
  fs.writeFile(dataFile, JSON.stringify(newData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar os dados.' });
    }
    res.json({ message: 'Dados salvos com sucesso.' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
