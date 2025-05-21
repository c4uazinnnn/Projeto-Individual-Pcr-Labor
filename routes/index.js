const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(`
    <html>
        <head>
          <link rel="stylesheet" href="/css/style.css">
          <title>Projeto PCR-Labor</title>
        </head>
      <body>
        <header>
        <div class="header-container">
                <div class="logo-container">
                <img src="/assets/LogoPCR.png" alt="Logo da PCR-Labor" class="logo">
                </div>
          <h1>Projeto PCR-Labor</h1>
          <nav>
            <ul>
              <li><a href="#">Início</a></li>
              <li><a href="#">Sobre</a></li>
              <li><a href="#">Contato</a></li>
            </ul>
          </nav>
        </header>

        <main>
        <div class="bemVindo">
          <h3>Bem vindo ao sistema da PCR</h3>
          </div>
        </main>

        <body>
        <div class="graficos">
        <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
        <img src="/assets/Grafico.png" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
        </div>
          <div class="graficos">
          <img src="/assets/Grafico.png" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
        </div>
          <div class="graficos">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.png" alt="grafico teste" class="grafico">
        </div>
                </div>
          <div class="graficos">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.jpg" alt="grafico teste" class="grafico">
          <img src="/assets/Grafico.png" alt="grafico teste" class="grafico">
        </div>

         </body>

        <footer>
          &copy; 2025 PCR-Labor. Todos os direitos reservados.
        </footer>
      </body>
    </html>
  `);
});

module.exports = router;
