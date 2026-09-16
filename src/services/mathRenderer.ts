import katex from 'katex';

/**
 * Renderiza una fórmula LaTeX a un DataURL de alta definición (SVG / Canvas) para insertar en Fabric.js
 */
export async function renderLatexToImage(
  latex: string,
  color: string = '#1e293b',
  fontSize: number = 32
): Promise<{ dataUrl: string; width: number; height: number }> {
  // Renderizar LaTeX a HTML seguro con KaTeX
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
    output: 'htmlAndMathml'
  });

  // Crear un contenedor temporal en el DOM para medir dimensiones exactas
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.color = color;
  tempDiv.style.fontSize = `${fontSize}px`;
  tempDiv.style.fontFamily = 'KaTeX_Main, KaTeX_Math, serif';
  tempDiv.style.padding = '12px 20px';
  tempDiv.style.display = 'inline-block';
  tempDiv.innerHTML = html;
  document.body.appendChild(tempDiv);

  const rect = tempDiv.getBoundingClientRect();
  const width = Math.max(100, Math.ceil(rect.width) + 20);
  const height = Math.max(50, Math.ceil(rect.height) + 16);

  document.body.removeChild(tempDiv);

  // Generar SVG limpio con foreignObject
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: ${color}; font-size: ${fontSize}px; padding: 6px 10px; display: flex; align-items: center; justify-content: center; height: 100%;">
          ${html}
        </div>
      </foreignObject>
    </svg>
  `;

  // Convertir SVG a DataURL base64
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  return { dataUrl, width, height };
}

/**
 * Fórmulas predefinidas para Ciencia, Tecnología, Física, Química y Matemáticas
 */
export interface FormulaPreset {
  category: 'fisica' | 'quimica' | 'trigonometria' | 'algebra' | 'simbolos';
  title: string;
  latex: string;
  description: string;
}

export const FORMULA_PRESETS: FormulaPreset[] = [
  // FÍSICA
  {
    category: 'fisica',
    title: 'Segunda Ley de Newton',
    latex: '\\vec{F}_{net} = m \\cdot \\vec{a}',
    description: 'Fuerza resultante igual a masa por aceleración'
  },
  {
    category: 'fisica',
    title: 'Energía Cinética',
    latex: 'E_k = \\frac{1}{2} m v^2',
    description: 'Energía del movimiento de un cuerpo'
  },
  {
    category: 'fisica',
    title: 'Equilibrio de Fuerzas',
    latex: '\\sum F_x = 0 \\quad \\sum F_y = 0',
    description: 'Primera condición de equilibrio estático'
  },
  {
    category: 'fisica',
    title: 'Cinemática MRUV',
    latex: 'v_f = v_0 + a \\cdot t',
    description: 'Velocidad final en movimiento acelerado'
  },
  {
    category: 'fisica',
    title: 'Densidad',
    latex: '\\rho = \\frac{m}{V}',
    description: 'Masa sobre volumen'
  },
  {
    category: 'fisica',
    title: 'Trabajo Mecánico',
    latex: 'W = \\vec{F} \\cdot \\vec{d} \\cdot \\cos(\\theta)',
    description: 'Fuerza por distancia por coseno del ángulo'
  },

  // TRIGONOMETRÍA Y GEOMETRÍA
  {
    category: 'trigonometria',
    title: 'Identidad Fundamental',
    latex: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
    description: 'Teorema trigonométrico de Pitágoras'
  },
  {
    category: 'trigonometria',
    title: 'Teorema de Pitágoras',
    latex: 'c = \\sqrt{a^2 + b^2}',
    description: 'Hipotenusa a partir de los catetos'
  },
  {
    category: 'trigonometria',
    title: 'Triángulo 37° / 53°',
    latex: '3k \\; (37^\\circ) \\quad 4k \\; (53^\\circ) \\quad 5k \\; (90^\\circ)',
    description: 'Proporciones del triángulo notable 3k, 4k, 5k'
  },
  {
    category: 'trigonometria',
    title: 'Ley de Senos',
    latex: '\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}',
    description: 'Relación lados y senos de ángulos'
  },

  // QUÍMICA
  {
    category: 'quimica',
    title: 'Formación de Óxido de Magnesio',
    latex: '2\\text{Mg} + \\text{O}_2 \\longrightarrow 2\\text{MgO}',
    description: 'Reacción de combustión del magnesio'
  },
  {
    category: 'quimica',
    title: 'Síntesis de Agua',
    latex: '2\\text{H}_2 + \\text{O}_2 \\longrightarrow 2\\text{H}_2\\text{O}',
    description: 'Reacción química de hidrógeno y oxígeno'
  },
  {
    category: 'quimica',
    title: 'Cálculo de pH',
    latex: '\\text{pH} = -\\log[\\text{H}^+]',
    description: 'Potencial de hidrógeno'
  },
  {
    category: 'quimica',
    title: 'Gases Ideales',
    latex: 'P \\cdot V = n \\cdot R \\cdot T',
    description: 'Ecuación de estado de los gases'
  },

  // ÁLGEBRA Y CÁLCULO
  {
    category: 'algebra',
    title: 'Fórmula Cuadrática',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Resolución de ecuaciones de 2do grado'
  },
  {
    category: 'algebra',
    title: 'Sumatoria',
    latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    description: 'Suma de los primeros n números naturales'
  },
  {
    category: 'algebra',
    title: 'Integral Definida',
    latex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)',
    description: 'Teorema fundamental del cálculo'
  },

  // SÍMBOLOS
  {
    category: 'simbolos',
    title: 'Letras Griegas Físicas',
    latex: '\\alpha, \\; \\beta, \\; \\gamma, \\; \\theta, \\; \\lambda, \\; \\mu, \\; \\pi, \\; \\rho, \\; \\sigma, \\; \\omega, \\; \\Delta, \\; \\Omega',
    description: 'Símbolos científicos frecuentes'
  },
  {
    category: 'simbolos',
    title: 'Vectores y Magnitudes',
    latex: '\\vec{A} = (A_x, A_y) \\quad |\\vec{A}| = \\sqrt{A_x^2 + A_y^2}',
    description: 'Notación vectorial con flecha'
  }
];
