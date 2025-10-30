require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
//const handlebars = require('handlebars');
//const juice = require('juice');
const bodyParser = require('body-parser');
const transporter = require('./config/mailer');

const app = express();
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const DATA_DIR = path.join(__dirname, 'data');


app.use(express.static(path.join(__dirname, 'templates', 'product-list.html')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// List templates
app.get('/', async (req, res) => {
  const files = await fs.readdir(TEMPLATES_DIR);
  console.log('Template files:', files);
 
  //const templates = files.filter(f => f.endsWith('.hbs'));
  res.send(`
    <h2>Email Browser</h2>
    <p>Templates:</p>
    <ul>
      ${files.map(t => `<li><a href="/preview/${encodeURIComponent(t)}">${t}</a></li>`).join('')}
    </ul>
  `);
});

// Preview: renders template with sample data and inlines CSS
app.get('/preview/:template', async (req, res) => {
  try {
    const tplName = req.params.template;
    const tplPath = path.join(TEMPLATES_DIR, tplName);
    const tplSrc = await fs.readFile(tplPath, 'utf8');

    // sample data file (optional)
    const dataPath = path.join(DATA_DIR, 'products.json');
    let data = {};
    try { data = JSON.parse(await fs.readFile(dataPath, 'utf8')); } catch(e){ data = {}; }

    // const compiled = handlebars.compile(tplSrc);
    // const html = compiled(data);
    // const inlined = juice(html);

    // page with iframe plus send form
    res.send(`
      <h2>Preview: ${tplName}</h2>
      <div style="margin-bottom:12px;">
        <form method="post" action="/send" style="display:flex;gap:8px;align-items:center;">
          <input type="hidden" name="template" value="${tplName}" />
          <input name="to" placeholder="recipient@example.com" style="padding:8px;" required />
          <input name="subject" placeholder="Test subject" style="padding:8px;" value="Test: ${tplName}" />
          <button type="submit" style="padding:8px 12px;">Send test</button>
        </form>
      </div>
      <iframe srcdoc="${escapeHtml(tplSrc)}" style="width:100%;height:600px;border:1px solid #ccc;"></iframe>
      <p><a href="/">Back</a></p>
    `);
  } catch (err) {
    res.status(500).send('Error rendering template: ' + String(err));
  }
});

// Send email
app.post('/send', async (req, res) => {
  try {
    const { template, to, subject } = req.body;
    const tplPath = path.join(TEMPLATES_DIR, template);
    const tplSrc = await fs.readFile(tplPath, 'utf8');
    const dataPath = path.join(DATA_DIR, 'products.json');
    let data = {};
    try { data = JSON.parse(await fs.readFile(dataPath, 'utf8')); } catch(e){ data = {}; }

    // const compiled = handlebars.compile(tplSrc);
    // const html = compiled(data);
    // const inlined = juice(html);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: subject || 'Test email',
      html: tplSrc
    };

    const info = await transporter.sendMail(mailOptions);
    res.send(`Email sent: ${info.messageId} — <a href="/preview/${encodeURIComponent(template)}">back</a>`);
  } catch (err) {
    res.status(500).send('Send failed: ' + String(err));
  }
});

// helper: minimal escaping for srcdoc
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Email browser running: http://localhost:${port}`));