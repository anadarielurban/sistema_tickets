import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEA EN WHATSAPP WEB:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('\n✅ BOT CONECTADO\n'));

client.on('message', async (message) => {
    if (message.fromMe) return;
    const texto = message.body;
    try {
        const ia = (await axios.post('http://localhost:5000/sugerir', { texto })).data;
        message.reply(`🤖 Categoria: ${ia.categoria} (${ia.confianza}%)\nDiagnostico: ${ia.diagnostico_probable}\n\nUn tecnico atendera tu caso.`);
    } catch {
        message.reply('❌ Error. Intenta de nuevo.');
    }
});

client.initialize();