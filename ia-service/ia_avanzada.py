from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)
CORS(app)

with open('datos_entrenamiento.json', 'r', encoding='utf-8') as f:
    datos = json.load(f)

def limpiar(texto):
    texto = texto.lower().strip()
    texto = re.sub(r'[^a-záéíóúñ\s]', '', texto)
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
        'no navega': 'no hay internet',
        'no carga paginas': 'no hay internet',
        'no carga internet': 'no hay internet',
        'sin internet': 'no hay internet',
    }
    for clave, valor in sinónimos.items():
        texto = texto.replace(clave, valor)
    return texto

textos = [limpiar(d['texto']) for d in datos]
categorias = [d['categoria'] for d in datos]

vectorizer = TfidfVectorizer(ngram_range=(1, 3), max_features=500)
X = vectorizer.fit_transform(textos)

modelo_knn = KNeighborsClassifier(n_neighbors=3, weights='distance')
modelo_rf = RandomForestClassifier(n_estimators=100, random_state=42)
modelo_knn.fit(X, categorias)
modelo_rf.fit(X, categorias)

print(f"✅ Modelos entrenados con {len(datos)} casos")

def buscar_similares(texto, top=5):
    texto_limpio = limpiar(texto)
    palabras_input = set(texto_limpio.split())
    resultados = []
    for d in datos:
        texto_caso = limpiar(d['texto'])
        palabras_caso = set(texto_caso.split())
        interseccion = palabras_input & palabras_caso
        union = palabras_input | palabras_caso
        similitud = len(interseccion) / len(union) if union else 0
        bonus = sum(0.1 for p in palabras_input if len(p) > 3 and p in texto_caso)
        resultados.append((similitud + bonus, d))
    resultados.sort(reverse=True, key=lambda x: x[0])
    return resultados[:top]

@app.route('/sugerir', methods=['POST'])
def sugerir():
    datos_req = request.json
    texto = datos_req.get('texto', '').strip()
    
    if not texto or len(texto) < 2:
        return jsonify({
            "categoria": "desconocido",
            "confianza": 5,
            "diagnostico_probable": "Describe más el problema",
            "mensaje": "La IA solo sugiere una idea, el diagnóstico final es tuyo.",
        })
    
    texto_limpio = limpiar(texto)
    X_input = vectorizer.transform([texto_limpio])
    
    pred_knn = modelo_knn.predict(X_input)[0]
    pred_rf = modelo_rf.predict(X_input)[0]
    
    if pred_knn == pred_rf:
        categoria = pred_knn
        confianza_base = 70
    else:
        categoria = pred_rf
        confianza_base = 50
    
    similares = buscar_similares(texto)
    
    if similares and similares[0][0] > 0.15:
        mejor = similares[0][1]
        diagnostico = mejor['diagnostico']
        confianza = min(confianza_base + int(similares[0][0] * 100), 92)
    else:
        diagnosticos = {
            'hardware': 'Posible falla de hardware - revisar conexiones físicas, fuente de poder, RAM',
            'impresora': 'Posible problema de impresora - revisar papel, tóner, conexión',
            'red': 'Posible problema de conectividad - revisar cable, IP, DNS',
            'software': 'Posible falla de software - revisar compatibilidad, actualizaciones',
        }
        diagnostico = diagnosticos.get(categoria, 'Requiere revisión física del equipo')
        confianza = 25
    
    return jsonify({
        "categoria": categoria,
        "confianza": confianza,
        "diagnostico_probable": diagnostico,
        "casos_similares": [
            {"texto": c['texto'], "similitud": round(s * 100)} 
            for s, c in similares[:3] if s > 0.1
        ],
        "mensaje": "💡 Esto es solo una sugerencia. Tú decides el diagnóstico y la solución.",
    })

@app.route('/estado', methods=['GET'])
def estado():
    return jsonify({
        "total_casos": len(datos),
        "categorias": list(set(categorias)),
        "modelo": "KNN + Random Forest - Solo clasifica, no da soluciones",
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🧠 IA para Tickets - Solo clasificación")
    print("=" * 60)
    print(f"📚 {len(datos)} casos")
    print("🔗 http://localhost:5000/sugerir")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)