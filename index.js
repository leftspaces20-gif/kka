const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/card', async (req, res) => {
  const word = req.query.word || 'Kelime';
  const avatarUrl = req.query.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
  const boldText = req.query.bold || '5 Saniye İçinde';
  const instruction = req.query.text || `Kelimeyi ${boldText} Yazın!`;

  const W = 500, H = 128;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Arka plan
  ctx.fillStyle = '#13141c';
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 22);
  ctx.fill();

  // Sol mavi glow
  const glow1 = ctx.createRadialGradient(52, 64, 0, 52, 64, 130);
  glow1.addColorStop(0, 'rgba(88,101,242,0.22)');
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  // Sağ alt glow
  const glow2 = ctx.createRadialGradient(475, 128, 0, 475, 128, 100);
  glow2.addColorStop(0, 'rgba(88,101,242,0.1)');
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Avatar yükle ve çiz
  try {
    const img = await loadImage(avatarUrl);
    const cx = 56, cy = 64, r = 34;

    // Halo
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
    halo.addColorStop(0, 'rgba(88,101,242,0.28)');
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fill();

    // Avatar border (glow ring)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(109,124,246,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Avatar clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } catch (e) {
    // Avatar yüklenemezse mavi daire çiz
    ctx.fillStyle = '#5865f2';
    ctx.beginPath();
    ctx.arc(56, 64, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dikey çizgi
  const divider = ctx.createLinearGradient(116, 24, 116, 104);
  divider.addColorStop(0, 'transparent');
  divider.addColorStop(0.3, 'rgba(88,101,242,0.4)');
  divider.addColorStop(0.7, 'rgba(88,101,242,0.4)');
  divider.addColorStop(1, 'transparent');
  ctx.strokeStyle = divider;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(116, 24);
  ctx.lineTo(116, 104);
  ctx.stroke();

  // Kelime
  ctx.font = 'bold 46px sans-serif';
  const wordGrad = ctx.createLinearGradient(136, 30, 400, 80);
  wordGrad.addColorStop(0, '#ffffff');
  wordGrad.addColorStop(1, '#9da4ff');
  ctx.fillStyle = wordGrad;
  ctx.fillText(word, 136, 82);

  // Alt yazı
  ctx.font = '500 13px sans-serif';
  // Normal kısım
  const parts = instruction.split(boldText);
  let x = 136;
  const y = 102;

  ctx.fillStyle = 'rgba(255,255,255,0.36)';
  ctx.fillText(parts[0], x, y);
  x += ctx.measureText(parts[0]).width;

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(boldText, x, y);
  x += ctx.measureText(boldText).width;

  ctx.fillStyle = 'rgba(255,255,255,0.36)';
  ctx.font = '500 13px sans-serif';
  if (parts[1]) ctx.fillText(parts[1], x, y);

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
});

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Calisiyor: ${PORT}`));
