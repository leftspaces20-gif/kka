const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/card', async (req, res) => {
  const word        = req.query.word   || 'Kelime';
  const avatarUrl   = req.query.avatar || '';
  const timeLabel   = req.query.time   || '5 Saniye';
  const difficulty  = req.query.diff   || 'normal';

  // Zorluk rengini belirle
  const diffColor = {
    kolay:  '#22c55e',
    normal: '#5865f2',
    zor:    '#ef4444',
  }[difficulty] || '#5865f2';

  // Avatar → base64
  let avatarSrc = '';
  try {
    const response = await axios.get(avatarUrl, { responseType: 'arraybuffer', timeout: 5000 });
    const b64 = Buffer.from(response.data).toString('base64');
    const mime = response.headers['content-type'] || 'image/png';
    avatarSrc = `data:${mime};base64,${b64}`;
  } catch (e) {}

  const avatarContent = avatarSrc
    ? `<img src="${avatarSrc}" class="avatar-img" />`
    : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 500px;
    height: 128px;
    background: #13141c;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }
  .card {
    position: relative;
    width: 500px;
    height: 128px;
    background: #13141c;
    border-radius: 22px;
    overflow: hidden;
    border: 1px solid rgba(88,101,242,0.2);
  }
  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 260px 180px at 10% 50%, ${diffColor}38 0%, transparent 70%),
      radial-gradient(ellipse 140px 120px at 95% 100%, ${diffColor}18 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .card-body {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    padding: 28px 30px;
    gap: 22px;
    height: 100%;
  }
  .icon-section {
    flex-shrink: 0;
    position: relative;
    width: 68px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-halo {
    position: absolute;
    inset: -18px;
    border-radius: 50%;
    background: radial-gradient(circle, ${diffColor}44 0%, transparent 65%);
  }
  .discord-icon-wrap {
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: linear-gradient(145deg, #6d7cf6, #4550c8);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px ${diffColor}80, 0 6px 28px ${diffColor}aa;
    overflow: hidden;
  }
  .discord-icon-wrap svg {
    width: 37px;
    height: 37px;
    fill: white;
  }
  .avatar-img {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }
  .v-divider {
    flex-shrink: 0;
    width: 1px;
    height: 52px;
    background: linear-gradient(180deg, transparent 0%, ${diffColor}66 30%, ${diffColor}66 70%, transparent 100%);
  }
  .content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .word {
    font-family: 'Syne', sans-serif;
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -2px;
    background: linear-gradient(125deg, #ffffff 20%, ${diffColor} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .instruction {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.38);
    line-height: 1.5;
  }
  .instruction strong {
    color: rgba(255,255,255,0.75);
    font-weight: 600;
  }
</style>
</head>
<body>
<div class="card">
  <div class="card-body">
    <div class="icon-section">
      <div class="icon-halo"></div>
      <div class="discord-icon-wrap">${avatarContent}</div>
    </div>
    <div class="v-divider"></div>
    <div class="content-section">
      <div class="word">${word}</div>
      <div class="instruction">Kelimeyi <strong>${timeLabel} İçinde</strong> Yazın!</div>
    </div>
  </div>
</div>
</body>
</html>`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 128, deviceScaleFactor: 3 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Sadece kartı screenshot al, body arka planıyla birlikte (beyaz köşe yok)
    const element = await page.$('.card');
    const png = await element.screenshot({ type: 'png' });

    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Calisiyor: ${PORT}`));
