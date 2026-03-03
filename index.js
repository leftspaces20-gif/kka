const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/card', async (req, res) => {
  const word = req.query.word || 'Kelime';
  const avatarUrl = req.query.avatar || '';
  const instruction = req.query.text || 'Kelimeyi 5 Saniye İçinde Yazın!';
  const bold = req.query.bold || '5 Saniye İçinde';

  const instructionHTML = instruction.replace(bold, `<tspan font-weight="600" fill="rgba(255,255,255,0.75)">${bold}</tspan>`);

  // Avatar'ı indir ve base64'e çevir
  let avatarBase64 = '';
  try {
    const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const resized = await sharp(Buffer.from(response.data))
      .resize(68, 68)
      .png()
      .toBuffer();
    avatarBase64 = `data:image/png;base64,${resized.toString('base64')}`;
  } catch (e) {
    // fallback: mavi daire kullan
  }

  const svg = `<svg width="500" height="128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="56" cy="64" r="34"/>
    </clipPath>
    <radialGradient id="glow1" cx="10%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(88,101,242,0.22)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="95%" cy="100%" r="30%">
      <stop offset="0%" stop-color="rgba(88,101,242,0.12)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(88,101,242,0.28)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="divider" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="30%" stop-color="rgba(88,101,242,0.4)"/>
      <stop offset="70%" stop-color="rgba(88,101,242,0.4)"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <linearGradient id="wordGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="20%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#9da4ff"/>
    </linearGradient>
  </defs>

  <!-- Arka plan -->
  <rect width="500" height="128" rx="22" fill="#13141c"/>
  <rect width="500" height="128" rx="22" fill="url(#glow1)"/>
  <rect width="500" height="128" rx="22" fill="url(#glow2)"/>

  <!-- Avatar halo -->
  <circle cx="56" cy="64" r="55" fill="url(#halo)"/>

  <!-- Avatar border -->
  <circle cx="56" cy="64" r="36" fill="none" stroke="rgba(109,124,246,0.5)" stroke-width="2"/>

  <!-- Avatar -->
  ${avatarBase64
    ? `<image href="${avatarBase64}" x="22" y="30" width="68" height="68" clip-path="url(#avatarClip)"/>`
    : `<circle cx="56" cy="64" r="34" fill="#5865f2"/>`
  }

  <!-- Dikey çizgi -->
  <line x1="116" y1="24" x2="116" y2="104" stroke="url(#divider)" stroke-width="1"/>

  <!-- Kelime -->
  <text x="136" y="80" font-family="Arial Black, Arial" font-weight="800" font-size="46" fill="url(#wordGrad)">${word}</text>

  <!-- Alt yazı -->
  <text x="136" y="102" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.38)">${instructionHTML}</text>
</svg>`;

  try {
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Calisiyor: ${PORT}`));
