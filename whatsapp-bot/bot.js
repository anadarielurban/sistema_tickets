import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import https from 'https';

// ========== CONFIGURACIÓN ==========
const API_BASE = 'http://localhost:8000/api';
const API_TOKEN = '14|nHXLHCmrsV8iuDw4Pi0dXOkXxyOW1539HTVwwuKPf0fd58ac';

// ========== CLIENTE WHATSAPP ==========
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

// ========== ESTADO DE USUARIOS ==========
const userStates = new Map();

// ========== FUNCIONES DE AYUDA ==========
async function sendMessage(message, text) {
    try {
        await message.reply(text);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
}

async function sendServiceUnavailable(message) {
    const errorMsg = 
        '⚠️ *SERVICIO TEMPORALMENTE NO DISPONIBLE*\n\n' +
        'Lo sentimos, el bot está fuera de servicio en este momento.\n' +
        'Estaremos disponibles en unos momentos.\n\n' +
        '📱 Por favor, intenta enviar tu mensaje más tarde.\n' +
        '¡Gracias por tu comprensión! 🙏';
    
    await sendMessage(message, errorMsg);
    console.log('⚠️ Mensaje de servicio no disponible enviado');
}

// Configuración de axios
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    timeout: 10000 // 10 segundos de timeout
});

// ========== FUNCIONES DE LA API ==========

// Verificar salud del servicio usando la ruta /dependencias (que existe)
async function checkServiceHealth() {
    try {
        const res = await axiosInstance.get(`${API_BASE}/dependencias`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            timeout: 5000
        });
        return res.status === 200;
    } catch (error) {
        console.error('❌ Health check falló:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        return false;
    }
}

async function getDependencias() {
    try {
        const res = await axiosInstance.get(`${API_BASE}/dependencias`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        return res.data;
    } catch (error) {
        console.error('Error al obtener dependencias:', error.message);
        throw error;
    }
}

async function getPersonas(dependenciaId) {
    try {
        const res = await axiosInstance.get(`${API_BASE}/dependencias/${dependenciaId}/personas`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        return res.data;
    } catch (error) {
        console.error('Error al obtener personas:', error.message);
        throw error;
    }
}

async function createTicket(data) {
    try {
        const res = await axiosInstance.post(`${API_BASE}/tickets`, data, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error al crear ticket:', error.response?.data || error.message);
        throw error;
    }
}

// ========== MANEJADOR DE MENSAJES ==========
client.on('message', async (message) => {
    if (message.fromMe) return;
    
    const from = message.from;
    const texto = message.body ? message.body.trim() : '';
    
    if (!texto) return;

    try {
        // ===== VERIFICAR SALUD DEL SERVICIO =====
        const isHealthy = await checkServiceHealth();
        if (!isHealthy) {
            await sendServiceUnavailable(message);
            return;
        }

        // ===== INICIALIZAR ESTADO =====
        if (!userStates.has(from)) {
            userStates.set(from, {
                step: 0,
                data: {},
                dependencias: [],
                personas: [],
                tipos: [
                    { value: 'computadora', label: '💻 Computadora' },
                    { value: 'impresora', label: '🖨️ Impresora' },
                    { value: 'red', label: '🌐 Internet / Red' },
                    { value: 'software', label: '📱 Software' },
                    { value: 'hardware', label: '🔧 Hardware' },
                    { value: 'otro', label: '📌 Otro' }
                ]
            });
        }

        const state = userStates.get(from);
        const step = state.step;

        // ===== PASO 0: SALUDO =====
        if (step === 0) {
            if (texto.toLowerCase().includes('hola') || 
                texto.toLowerCase().includes('ticket') ||
                texto.toLowerCase().includes('crear')) {
                
                try {
                    const dependencias = await getDependencias();
                    
                    if (!dependencias || dependencias.length === 0) {
                        await sendMessage(message, '❌ No hay departamentos disponibles en el sistema.');
                        userStates.delete(from);
                        return;
                    }
                    
                    state.dependencias = dependencias;
                    let list = '📋 *Lista de departamentos:*\n\n';
                    dependencias.forEach((d, i) => {
                        const nombre = d.nombre || 'Sin nombre';
                        const abreviatura = d.abreviatura || '---';
                        list += `${i+1}. ${nombre} (${abreviatura})\n`;
                    });
                    list += '\nResponde con el *número* del departamento o escribe el *nombre* exacto.';
                    
                    await sendMessage(message, '👋 ¡Hola! Vamos a crear tu ticket.\n\n' + list);
                    state.step = 1;
                } catch (error) {
                    await sendServiceUnavailable(message);
                    userStates.delete(from);
                }
            } else {
                await sendMessage(message, '👋 Para crear un ticket, escríbeme "hola", "ticket" o "crear".');
            }
            return;
        }

        // ===== PASO 1: SELECCIONAR DEPARTAMENTO =====
        if (step === 1) {
            if (!texto) {
                await sendMessage(message, '❌ Por favor, escribe el número o nombre del departamento.');
                return;
            }

            try {
                // Buscar departamento
                const depSeleccionado = state.dependencias.find((d, i) => {
                    const numero = `${i+1}`;
                    const nombre = d.nombre ? d.nombre.toLowerCase() : '';
                    const abreviatura = d.abreviatura ? d.abreviatura.toLowerCase() : '';
                    const textoLower = texto.toLowerCase();
                    
                    return numero === texto || 
                           nombre === textoLower || 
                           abreviatura === textoLower;
                });

                if (!depSeleccionado) {
                    await sendMessage(message, '❌ No encontré ese departamento. Escribe el número de la lista o el nombre exacto.');
                    return;
                }
                
                state.data.dependencia_id = depSeleccionado.id;
                state.data.dependencia_nombre = depSeleccionado.nombre || 'Departamento';

                // Obtener personas del departamento
                const personas = await getPersonas(depSeleccionado.id);
                state.personas = personas || [];

                if (personas && personas.length > 0) {
                    let list = `📋 *Personas en "${depSeleccionado.nombre || 'Departamento'}":*\n\n`;
                    personas.forEach((p, i) => {
                        const nombre = p.nombre || '';
                        const apellidoPaterno = p.apellido_paterno || '';
                        const apellidoMaterno = p.apellido_materno || '';
                        let nombreCompleto = `${nombre} ${apellidoPaterno}`.trim();
                        if (apellidoMaterno) {
                            nombreCompleto += ` ${apellidoMaterno}`;
                        }
                        if (!nombreCompleto.trim()) {
                            nombreCompleto = `Usuario ${i+1}`;
                        }
                        list += `${i+1}. ${nombreCompleto}\n`;
                    });
                    list += '\nResponde con el *número* de la persona que reporta, o escribe *"otro"* si no aparece.';
                    
                    await sendMessage(message, list);
                    state.step = 2;
                } else {
                    await sendMessage(message, '📝 No hay personas registradas en este departamento. Escribe el nombre completo de quien reporta:');
                    state.step = 3;
                }
            } catch (error) {
                await sendServiceUnavailable(message);
                userStates.delete(from);
            }
            return;
        }

        // ===== PASO 2: SELECCIONAR PERSONA =====
        if (step === 2) {
            if (!texto) {
                await sendMessage(message, '❌ Por favor, elige un número de la lista o escribe "otro".');
                return;
            }

            if (texto.toLowerCase() === 'otro') {
                await sendMessage(message, '📝 Escribe el nombre completo de la persona que reporta:');
                state.step = 3;
                return;
            }
            
            const idx = parseInt(texto) - 1;
            if (isNaN(idx) || idx < 0 || idx >= state.personas.length) {
                await sendMessage(message, '❌ Número inválido. Elige un número de la lista o escribe "otro".');
                return;
            }
            
            const persona = state.personas[idx];
            state.data.solicitante_id = persona.id;
            
            // Construir nombre completo
            const nombre = persona.nombre || '';
            const apellidoPaterno = persona.apellido_paterno || '';
            const apellidoMaterno = persona.apellido_materno || '';
            let nombreCompleto = `${nombre} ${apellidoPaterno}`.trim();
            if (apellidoMaterno) {
                nombreCompleto += ` ${apellidoMaterno}`;
            }
            state.data.nombre_usuario = nombreCompleto || 'Usuario';
            
            await preguntarTipo(message, state);
            return;
        }

        // ===== PASO 3: NOMBRE DEL SOLICITANTE (manual) =====
        if (step === 3) {
            if (!texto || texto.trim() === '') {
                await sendMessage(message, '❌ Por favor, escribe un nombre válido.');
                return;
            }
            
            state.data.nombre_usuario = texto;
            // Como no tenemos ID, usamos un ID por defecto (1 o el del bot)
            state.data.solicitante_id = 8; // ID del usuario bot
            
            await preguntarTipo(message, state);
            return;
        }

        // ===== FUNCIÓN PARA PREGUNTAR TIPO =====
        async function preguntarTipo(msg, st) {
            let list = '📋 *Tipo de problema:*\n\n';
            st.tipos.forEach((t, i) => {
                list += `${i+1}. ${t.label}\n`;
            });
            list += '\nResponde con el *número* del tipo de problema.';
            await sendMessage(msg, list);
            st.step = 4;
        }

        // ===== PASO 4: SELECCIONAR TIPO =====
        if (step === 4) {
            if (!texto) {
                await sendMessage(message, '❌ Por favor, elige un número de la lista.');
                return;
            }
            
            const idx = parseInt(texto) - 1;
            if (isNaN(idx) || idx < 0 || idx >= state.tipos.length) {
                await sendMessage(message, '❌ Número inválido. Elige un número de la lista.');
                return;
            }
            
            state.data.tipo = state.tipos[idx].value;
            await sendMessage(message, '📝 Escribe un *título breve* para el problema (máx 100 caracteres):');
            state.step = 5;
            return;
        }

        // ===== PASO 5: TÍTULO =====
        if (step === 5) {
            if (!texto || texto.trim() === '') {
                await sendMessage(message, '❌ Por favor, escribe un título válido.');
                return;
            }
            
            state.data.titulo = texto.substring(0, 100);
            await sendMessage(message, '📝 Ahora describe el problema con más detalle:');
            state.step = 6;
            return;
        }

        // ===== PASO 6: DESCRIPCIÓN =====
        if (step === 6) {
            if (!texto || texto.trim() === '') {
                await sendMessage(message, '❌ Por favor, escribe una descripción válida.');
                return;
            }
            
            state.data.descripcion = texto;
            await sendMessage(message, '📍 ¿En qué ubicación se encuentra el problema? (ej. Oficina 203, Planta Baja)');
            state.step = 7;
            return;
        }

        // ===== PASO 7: UBICACIÓN =====
        if (step === 7) {
            if (!texto || texto.trim() === '') {
                await sendMessage(message, '❌ Por favor, escribe una ubicación válida.');
                return;
            }
            
            state.data.ubicacion = texto;

            // Mostrar resumen
            const tipoLabel = state.tipos.find(t => t.value === state.data.tipo)?.label || 'No especificado';
            
            const resumen = 
                `📋 *Resumen del ticket*\n\n` +
                `🏢 Departamento: ${state.data.dependencia_nombre || 'No especificado'}\n` +
                `👤 Solicitante: ${state.data.nombre_usuario || 'No especificado'}\n` +
                `🔧 Tipo: ${tipoLabel}\n` +
                `📌 Título: ${state.data.titulo || 'No especificado'}\n` +
                `📝 Descripción: ${state.data.descripcion || 'No especificado'}\n` +
                `📍 Ubicación: ${state.data.ubicacion || 'No especificado'}\n\n` +
                `✅ ¿Confirmas estos datos?\n` +
                `Responde *si* o *no*.`;
            
            await sendMessage(message, resumen);
            state.step = 8;
            return;
        }

        // ===== PASO 8: CONFIRMACIÓN =====
        if (step === 8) {
            if (!texto) {
                await sendMessage(message, '❌ Responde *si* o *no* para confirmar.');
                return;
            }

            if (texto.toLowerCase() === 'si' || texto.toLowerCase() === 'sí') {
                try {
                    const ticketData = {
                        solicitante_id: state.data.solicitante_id || 8,
                        dependencia_id: state.data.dependencia_id,
                        tipo: state.data.tipo || 'otro',
                        titulo: state.data.titulo || 'Sin título',
                        descripcion: state.data.descripcion || 'Sin descripción',
                        ubicacion: state.data.ubicacion || 'No especificada',
                    };

                    console.log('📝 Creando ticket con datos:', ticketData);
                    
                    const result = await createTicket(ticketData);
                    
                    await sendMessage(message, 
                        `✅ *¡Ticket creado con éxito!*\n\n` +
                        `📄 Folio: ${result.ticket?.folio || 'N/A'}\n` +
                        `🔧 Tipo: ${state.tipos.find(t => t.value === state.data.tipo)?.label || 'No especificado'}\n` +
                        `🏢 Departamento: ${state.data.dependencia_nombre || 'No especificado'}\n\n` +
                        `Un técnico atenderá tu caso pronto. ¡Gracias! 🙌`
                    );
                    
                    console.log(`✅ Ticket creado para ${state.data.nombre_usuario}`);
                    
                } catch (error) {
                    console.error('❌ Error al crear ticket:', error.message);
                    if (error.response) {
                        console.error('   Status:', error.response.status);
                        console.error('   Data:', error.response.data);
                    }
                    await sendServiceUnavailable(message);
                }
                
                userStates.delete(from);
                
            } else if (texto.toLowerCase() === 'no' || texto.toLowerCase() === 'n') {
                await sendMessage(message, '🔄 *Reiniciando proceso*\n\nEscribe "hola" para comenzar de nuevo.');
                userStates.delete(from);
            } else {
                await sendMessage(message, '❌ Responde *si* o *no* para confirmar los datos.');
            }
            return;
        }

        // ===== ESTADO POR DEFECTO =====
        userStates.delete(from);
        await sendMessage(message, 
            '⚠️ *Flujo reiniciado*\n\n' +
            'Parece que hubo un error en el proceso. Escribe "hola" para empezar de nuevo.'
        );

    } catch (error) {
        console.error('❌ Error general:', error);
        await sendServiceUnavailable(message);
        userStates.delete(from);
    }
});

// ========== INICIALIZAR BOT ==========
client.on('qr', (qr) => {
    console.log('\n📱 ESCANEA EL CÓDIGO QR CON WHATSAPP:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⏳ Esperando conexión...\n');
});

client.on('ready', () => {
    console.log('\n✅ BOT CONECTADO Y LISTO');
    console.log('📱 El bot está activo y esperando mensajes\n');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
});

// Iniciar el bot
console.log('\n🚀 Iniciando bot de WhatsApp...\n');
console.log(`📡 API Base: ${API_BASE}`);
console.log(`🔑 Token: ${API_TOKEN.substring(0, 20)}...\n`);
client.initialize();

// ========== MANEJO DE ERRORES GLOBALES ==========
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
});

process.on('SIGINT', () => {
    console.log('\n\n🛑 Deteniendo bot...');
    process.exit();
});

// ========== HEALTH CHECK PERIÓDICO ==========
setInterval(async () => {
    try {
        const isHealthy = await checkServiceHealth();
        if (isHealthy) {
            console.log('✅ Health check: OK');
        } else {
            console.log('⚠️ Health check: FALLÓ');
        }
    } catch (error) {
        console.log('⚠️ Health check: ERROR', error.message);
    }
}, 60000); // Cada minuto