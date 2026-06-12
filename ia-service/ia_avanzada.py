from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from collections import Counter

app = Flask(__name__)
CORS(app)

# ==========================================
# CARGAR DATOS
# ==========================================
with open('datos_entrenamiento.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

# ==========================================
# PREPROCESAR TEXTO (limpiar vaguedades)
# ==========================================
def limpiar(texto):
    texto = texto.lower().strip()
    texto = re.sub(r'[^a-záéíóúñ\s]', '', texto)
    # Expandir palabras vagas
    sinónimos = {
        'no jala': 'no funciona',
        'no sirve': 'no funciona',
        'no prende': 'no enciende',
        'no arranca': 'no enciende',
        'no da video': 'pantalla negra',
        'no da imagen': 'pantalla negra',
        'se traba': 'se congela',
        'tarda mucho': 'muy lenta',
        'va muy lento': 'muy lenta',
        'no agarra': 'no conecta',
        'no jala internet': 'no hay internet',
        'no navega': 'no hay internet',
        'no carga': 'no hay internet',
    }
    for clave, valor in sinónimos.items():
        texto = texto.replace(clave, valor)
    return texto

# ==========================================
# ENTRENAR MODELO
# ==========================================
textos = [limpiar(d['texto']) for d in datos]
categorias = [d['categoria'] for d in datos]

vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=500)
X = vectorizer.fit_transform(textos)

# Ensemble: KNN + Random Forest
modelo_knn = KNeighborsClassifier(n_neighbors=3, weights='distance')
modelo_rf = RandomForestClassifier(n_estimators=100, random_state=42)

modelo_knn.fit(X, categorias)
modelo_rf.fit(X, categorias)

print(f"✅ Modelos entrenados con {len(datos)} casos")

# ==========================================
# BUSCAR MEJOR COINCIDENCIA
# ==========================================
def buscar_similares(texto, top=5):
    texto_limpio = limpiar(texto)
    palabras_input = set(texto_limpio.split())
    
    resultados = []
    for i, d in enumerate(datos):
        texto_caso = limpiar(d['texto'])
        palabras_caso = set(texto_caso.split())
        
        # Similitud de Jaccard
        interseccion = palabras_input & palabras_caso
        union = palabras_input | palabras_caso
        similitud = len(interseccion) / len(union) if union else 0
        
        # Bonus por coincidencia exacta de palabras clave
        bonus = 0
        for palabra in palabras_input:
            if len(palabra) > 3 and palabra in texto_caso:
                bonus += 0.1
            if len(palabra) > 3 and any(palabra in t.split() for t in texto_caso.split()):
                bonus += 0.05
        
        puntuacion = similitud + bonus
        resultados.append((puntuacion, d))
    
    resultados.sort(reverse=True, key=lambda x: x[0])
    return resultados[:top]

# ==========================================
# ENDPOINT: SUGERIR
# ==========================================
@app.route('/sugerir', methods=['POST'])
def sugerir():
    datos_req = request.json
    texto = datos_req.get('texto', '').strip()
    
    if not texto or len(texto) < 2:
        return jsonify({
            "diagnostico": "Describe un poco más el problema",
            "solucion": "Agrega detalles: ¿qué equipo es? ¿qué pasa exactamente?",
            "confianza": 5,
            "categoria": "desconocido",
        })
    
    # 1. Clasificar con ambos modelos
    texto_limpio = limpiar(texto)
    X_input = vectorizer.transform([texto_limpio])
    
    pred_knn = modelo_knn.predict(X_input)[0]
    pred_rf = modelo_rf.predict(X_input)[0]
    
    # Voto: si coinciden, más confianza
    if pred_knn == pred_rf:
        categoria = pred_knn
        confianza_base = 70
    else:
        categoria = pred_rf
        confianza_base = 50
    
    # 2. Buscar casos similares
    similares = buscar_similares(texto)
    
    if similares and similares[0][0] > 0.15:
        mejor = similares[0][1]
        diagnostico = mejor['diagnostico']
        solucion = mejor['solucion']
        tiempo = mejor.get('tiempo', 30)
        confianza = min(confianza_base + int(similares[0][0] * 100), 95)
    else:
        # Sugerencia genérica según categoría
        sugerencias_genericas = {
            'hardware': {'d': 'Revisar conexiones físicas y cables', 's': 'Verificar cable de poder, monitor y periféricos conectados'},
            'impresora': {'d': 'Revisar papel y tóner', 's': 'Verificar que tenga papel y tóner, revisar conexión USB'},
            'red': {'d': 'Revisar cable de red o WiFi', 's': 'Verificar que el cable esté conectado o el WiFi activado'},
            'software': {'d': 'Revisar si el programa abre en modo seguro', 's': 'Intentar reparar o reinstalar el programa'},
        }
        gen = sugerencias_genericas.get(categoria, {'d': 'Requiere diagnóstico visual', 's': 'Revisar el equipo físicamente'})
        diagnostico = gen['d']
        solucion = gen['s']
        tiempo = 30
        confianza = 25
    
    # 3. Armar respuesta
    return jsonify({
        "categoria": categoria,
        "confianza": confianza,
        "diagnostico": diagnostico,
        "solucion": solucion,
        "tiempo_estimado_minutos": tiempo,
        "casos_similares": [
            {
                "texto": c['texto'],
                "similitud": round(s * 100)
            } for s, c in similares[:3] if s > 0.1
        ],
        "modelo": "KNN + Random Forest con limpieza de vaguedades",
    })

# ==========================================
# ENDPOINT: ESTADO
# ==========================================
@app.route('/estado', methods=['GET'])
def estado():
    return jsonify({
        "total_casos": len(datos),
        "categorias": list(set(categorias)),
        "modelo": "KNN + Random Forest + sinónimos",
        "descripcion": "IA optimizada para descripciones vagas",
    })

# ==========================================
# INICIAR
# ==========================================
if __name__ == '__main__':
    print("=" * 60)
    print("🧠 IA para Tickets Municipales")
    print("=" * 60)
    print(f"📚 {len(datos)} casos cargados")
    print("🔗 http://localhost:5000/sugerir")
    print("📝 Acepta descripciones vagas: 'no jala', 'no sirve', etc.")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)