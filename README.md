# 🎨 Pizarra Digital Pro - Nexoris Academy

Pizarra interactiva educativa diseñada para clases virtuales y presenciales de **Ciencia, Tecnología y Matemáticas (Física, Química, Trigonometría, Álgebra y Geometría)** con soporte completo para tabletas gráficas (8192 niveles de presión), lápiz óptico por USB-C, editor LaTeX KaTeX y recorte de ejercicios PDF.

---

## 🚀 Características Principales

- **🧮 Editor de Fórmulas KaTeX / LaTeX:** Inserción de ecuaciones vectoriales de alta definición ($\vec{F} = m \cdot \vec{a}$, reacciones químicas, identidades trigonométricas, cálculo).
- **🔬 Biblioteca de Figuras Científicas:** Diagramas listos de planos inclinados, poleas, osciladores, circuitos eléctricos, probetas y modelos atómicos.
- **🎯 Retículo de Precisión para Tableta Gráfica:** Cursor dinámico subpíxel que sigue la punta del lápiz sin desfase, con calibración de presión.
- **✂️ Recorte Inteligente de Ejercicios:** Carga diapositivas o fichas en PDF y recorta cualquier problema para resolverlo en la pizarra.
- **💾 Guardado Offline & Exportación:** Persistencia automática en IndexedDB, exportación a PNG HD y PDF multipágina.
- **🖥️ Aplicación de Escritorio & Web:** Compatible con navegadores web, tablets (Android/iPad por red local) y app nativa Windows `.exe`.

---

## 🛠️ Tecnologías

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Canvas Engine:** Fabric.js v5.3.0 (Multicapa 2D)
- **Matemáticas:** KaTeX
- **PDF:** PDF.js (`pdfjs-dist`), jsPDF
- **Escritorio:** Electron & Electron Builder

---

## 💻 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo web
npm run dev

# 3. Iniciar como App de Escritorio
npm run dev:desktop

# 4. Compilar instalador Windows (.exe)
npm run build:desktop
```

---

Desarrollado por **Nexoris Academy**.
