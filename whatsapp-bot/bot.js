import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import https from 'https'; // Para ignorar SSL (solo desarrollo)

// ========== CONFIGURACIÓN ==========
const API_BASE = 'http://localhost:8000/api';
const API_TOKEN = '14|nHXLHCmrsV8iuDw4Pi0dXOkXxyOW1539HTVwwuKPf0fd58ac'; // Token generado en Laravel

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

// Configuración de axios (desactiva SSL en desarrollo)
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

// ========== OBTENER DEPENDENCIAS DESDE LA API ==========
async function getDependencias() {
    try {
        const res = await axiosInstance.get(`${API_BASE}/dependencias`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        return res.data;
    } catch (error) {
        console.error('Error al obtener dependencias:', error.message);
        return [];
    }
}

// ========== OBTENER PERSONAS DE UNA DEPENDENCIA ==========
async function getPersonas(dependenciaId) {
    try {
        const res = await axiosInstance.get(`${API_BASE}/dependencias/${dependenciaId}/personas`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        return res.data;
    } catch (error) {
        console.error('Error al obtener personas:', error.message);
        return [];
    }
}

// ========== CREAR TICKET ==========
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
    const texto = message.body.trim();

    // Inicializar estado si no existe
    if (!userStates.has(from)) {
        userStates.set(from, {
            step: 0,
            data: {},
            dependencias: [],
            personas: [],
            tipos: [
                { value: 'computadora', label: 'Computadora' },
                { value: 'impresora', label: 'Impresora' },
                { value: 'red', label: 'Internet / Red' },
                { value: 'otro', label: 'Otro' }
            ]
        });
    }

    const state = userStates.get(from);
    const step = state.step;

    try {
        // ===== PASO 0: SALUDO Y SOLICITAR DEPARTAMENTO =====
        if (step === 0) {
            if (texto.toLowerCase().includes('hola') || texto.toLowerCase().includes('ticket')) {
                const dependencias = await getDependencias();
                if (dependencias.length === 0) {
                    await sendMessage(message, '❌ No se pudieron cargar los departamentos. Intenta más tarde.');
                    userStates.delete(from);
                    return;
                }
                state.dependencias = dependencias;
                let list = '📋 *Lista de departamentos:*\n';
                dependencias.forEach((d, i) => {
                    list += `${i+1}. ${d.nombre} (${d.abreviatura})\n`;
                });
                list += '\nResponde con el *número* del departamento o escribe el *nombre* exacto.';
                await sendMessage(message, '👋 ¡Hola! Vamos a crear tu ticket.\n' + list);
                state.step = 1;
            } else {
                await sendMessage(message, '👋 Para crear un ticket, escríbeme "hola" o "ticket".');
            }
            return;
        }

        // ===== PASO 1: SELECCIONAR DEPARTAMENTO =====
        if (step === 1) {
            const depSeleccionado = state.dependencias.find((d, i) => 
                texto === `${i+1}` || 
                texto.toLowerCase() === d.nombre.toLowerCase() ||
                texto.toLowerCase() === d.abreviatura.toLowerCase()
            );
            if (!depSeleccionado) {
                await sendMessage(message, '❌ No encontré ese departamento. Escribe el número de la lista o el nombre exacto.');
                return;
            }
            state.data.dependencia_id = depSeleccionado.id;
            state.data.dependencia_nombre = depSeleccionado.nombre;

            const personas = await getPersonas(depSeleccionado.id);
            state.personas = personas;

            if (personas.length > 0) {
                let list = `📋 Personas en "${depSeleccionado.nombre}":\n`;
                personas.forEach((p, i) => {
                    // Construir nombre completo a partir de los campos de la tabla `usuarios`
                    let nombreCompleto = `${p.nombre} ${p.apellido_paterno}`;
                    if (p.apellido_materno) {
                        nombreCompleto += ` ${p.apellido_materno}`;
                    }
                    list += `${i+1}. ${nombreCompleto}\n`;
                });
                list += '\nResponde con el *número* de la persona que reporta, o escribe *"otro"* si no aparece.';
                await sendMessage(message, list);
                state.step = 2;
            } else {
                await sendMessage(message, 'No hay personas registradas en este departamento. Escribe el nombre completo de quien reporta:');
                state.step = 3;
            }
            return;
        }

        // ===== PASO 2: SELECCIONAR PERSONA =====
        if (step === 2) {
            if (texto.toLowerCase() === 'otro') {
                await sendMessage(message, 'Escribe el nombre completo de la persona que reporta:');
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
            // Guardamos nombre completo para mostrar en resumen
            let nombreCompleto = `${persona.nombre} ${persona.apellido_paterno}`;
            if (persona.apellido_materno) {
                nombreCompleto += ` ${persona.apellido_materno}`;
            }
            state.data.nombre_usuario = nombreCompleto;
            await preguntarTipo(message, state);
            return;
        }

        // ===== PASO 3: NOMBRE DEL SOLICITANTE (cuando no está en lista) =====
        if (step === 3) {
            state.data.nombre_usuario = texto;
            // Usamos el ID del usuario bot como solicitante por defecto
            state.data.solicitante_id = 8; // ID del usuario bot
            await preguntarTipo(message, state);
            return;
        }

        // ===== FUNCIÓN PARA PREGUNTAR TIPO (reutilizada) =====
        async function preguntarTipo(msg, st) {
            let list = '📋 *Tipo de problema:*\n';
            st.tipos.forEach((t, i) => {
                list += `${i+1}. ${t.label}\n`;
            });
            list += '\nResponde con el *número* del tipo.';
            await sendMessage(msg, list);
            st.step = 4;
        }

        // ===== PASO 4: SELECCIONAR TIPO =====
        if (step === 4) {
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
            state.data.titulo = texto.substring(0, 100);
            await sendMessage(message, '📝 Ahora describe el problema con más detalle:');
            state.step = 6;
            return;
        }

        // ===== PASO 6: DESCRIPCIÓN =====
        if (step === 6) {
            state.data.descripcion = texto;
            await sendMessage(message, '📍 ¿En qué ubicación se encuentra el problema? (ej. Oficina 203, Planta Baja)');
            state.step = 7;
            return;
        }

        // ===== PASO 7: UBICACIÓN =====
        if (step === 7) {
            state.data.ubicacion = texto;

            const resumen = 
                `📋 *Resumen del ticket*\n\n` +
                `🏢 Departamento: ${state.data.dependencia_nombre}\n` +
                `👤 Solicitante: ${state.data.nombre_usuario}\n` +
                `🔧 Tipo: ${state.tipos.find(t => t.value === state.data.tipo)?.label}\n` +
                `📌 Título: ${state.data.titulo}\n` +
                `📝 Descripción: ${state.data.descripcion}\n` +
                `📍 Ubicación: ${state.data.ubicacion}\n\n` +
                `¿Confirmas estos datos? Responde *si* o *no*.`;
            await sendMessage(message, resumen);
            state.step = 8;
            return;
        }

        // ===== PASO 8: CONFIRMACIÓN Y CREACIÓN =====
        if (step === 8) {
            if (texto.toLowerCase() === 'si' || texto.toLowerCase() === 'sí') {
                try {
                    const ticketData = {
                        solicitante_id: state.data.solicitante_id,
                        dependencia_id: state.data.dependencia_id,
                        tipo: state.data.tipo,
                        titulo: state.data.titulo,
                        descripcion: state.data.descripcion,
                        ubicacion: state.data.ubicacion,
                    };

                    const result = await createTicket(ticketData);
                    await sendMessage(message, 
                        `✅ ¡Ticket creado con éxito!\n` +
                        `📄 Folio: ${result.ticket?.folio || 'N/A'}\n` +
                        `Un técnico atenderá tu caso pronto. ¡Gracias!`
                    );
                } catch (error) {
                    await sendMessage(message, '❌ Error al crear el ticket. Intenta más tarde.');
                }
                userStates.delete(from);
            } else if (texto.toLowerCase() === 'no' || texto.toLowerCase() === 'n') {
                await sendMessage(message, '🔄 Vamos a empezar de nuevo. Escribe "hola" para reiniciar.');
                userStates.delete(from);
            } else {
                await sendMessage(message, 'Responde *si* o *no* para confirmar.');
            }
            return;
        }

        userStates.delete(from);
        await sendMessage(message, '⚠️ Parece que hubo un error. Escribe "hola" para empezar de nuevo.');

    } catch (error) {
        console.error('Error general:', error);
        await sendMessage(message, '❌ Ocurrió un error inesperado. Intenta de nuevo.');
        userStates.delete(from);
    }
});

// ========== INICIALIZAR BOT ==========
client.on('qr', (qr) => {
    console.log('\n📱 ESCANEA EN WHATSAPP WEB:\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('\n✅ BOT CONECTADO\n'));

client.initialize();