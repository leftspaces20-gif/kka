const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/card', async (req, res) => {
  const word = req.query.word || 'Kelime';
  const avatar = req.query.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';
  const instruction = req.query.text || 'Kelimeyi 5 Saniye İçinde Yazın!';
  const bold = req.query.bold || '5 Saniye İçinde';
  const instructionHTML = instruction.replace(bold, `<strong>${bold}</strong>`);

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:500px; height:128px; overflow:hidden; background:#13141c; font-family:'DM Sans',sans-serif; }
.card { width:500px; height:128px; position:relative; background:#13141c; display:flex; align-items:center; }
.card::before { content:''; position:absolute; inset:0; background: radial-gradient(ellipse 260px 180px at 10% 50%, rgba(88,101,242,0.22) 0%, transparent 70%), radial-gradient(ellipse 140px 120px at 95% 100%, rgba(88,101,242,0.1) 0%, transparent 70%); z-index:0; }
.card-body { position:relative; z-index:1; display:flex; align-items:center; padding:0 28px; gap:20px; width:100%; height:100%; }
.avatar-wrap { flex-shrink:0; position:relative; width:68px; height:68px; display:flex; align-items:center; justify-content:center; }
.avatar-halo { position:absolute; inset:-14px; border-radius:50%; background:radial-gradient(circle, rgba(88,101,242,0.28) 0%, transparent 65%); }
.avatar { width:68px; height:68px; border-radius:50%; object-fit:cover; box-shadow:0 0 0 2px rgba(109,124,246,0.5), 0 6px 28px rgba(88,101,242,0.65); position:relative; z-index:1; }
.v-divider { flex-shrink:0; width:1px; height:52px; background:linear-gradient(180deg, transparent 0%, rgba(88,101,242,0.4) 30%, rgba(88,101,242,0.4) 70%, transparent 100%); }
.content { flex:1; display:flex; flex-direction:column; gap:5px; }
.word { font-family:'Syne',sans-serif; font-size:46px; font-weight:800; line-height:1; letter-spacing:-2px; background:linear-gradient(125deg,#ffffff 20%,#9da4ff 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.instruction { font-size:13px; font-weight:500; color:rgba(255,255,255,0.36); line-height:1.4; }
.instruction strong { color:rgba(255,255,255,0.7); font-weight:600; }
</style></head>
<body><div class="card"><div class="card-body">
  <div class="avatar-wrap"><div class="avatar-halo"></div><img class="avatar" src="${avatar}" /></div>
  <div class="v-divider"></div>
  <div class="content"><div class="word">${word}</div><div class="instruction">${instructionHTML}</div></div>
</div></div></body></html>`;

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 128, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const screenshot = await page.screenshot({ type: 'png', clip: { x:0, y:0, width:500, height:128 } });
    await browser.close();
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok', ornek: '/card?word=Mutfak&avatar=AVATAR_URL' }));
app.listen(PORT, () => console.log(`Calisiyor: ${PORT}`));
