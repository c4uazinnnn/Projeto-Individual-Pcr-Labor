const express = require('express');
const router = express.Router();

// Rota com imagem
router.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Projeto PCR-Labor</h1>
        <img src="assets/LogoPCR.png" alt="Logo da PCR-Labor" style="max-width: 300px;">
      </body>
    </html>
  `);
});

module.exports = router;