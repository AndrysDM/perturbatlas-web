# PerturbAtlas × TCGA — Explorador de experimentos

Sitio estático con los experimentos de perturbación de **PerturbAtlas** integrados
con la clasificación tumoral de **TCGA**. Cubre **PRAD**, **LUAD** y **BRCA**.

## Páginas

- `index.html` — resumen por cáncer: experimentos, estudios, publicaciones y genes;
  tabla por tipo de gen (T / N / NT / O) y distribución de categorías y estados.
- `experiments.html` — tabla completa con búsqueda, filtros por categoría,
  condición y estado, y ficha de detalle. Los experimentos sin análisis indican el
  motivo (gen O, multi-diana, diana sin clasificar o DEG no disponible).
- `genes.html` — métricas de expresión por gen: `log2FC T/N`, medias geométricas,
  mínimos/máximos y porcentajes de muestras fuera del rango normal/tumoral, con
  búsqueda, filtros y ficha de detalle.
- `papers.html` — publicaciones originales con su resumen, la fuente del enlace y
  los experimentos que cubren.
- `methodology.html` — esquema de clasificación, reglas de análisis y métricas.

## Datos

- `data/index.json` — catálogo de cánceres disponibles.
- `data/<cancer>/experiments.json`, `papers.json`, `summary.json`.
- `data/<cancer>/genes_T.json`, `genes_N.json`, `genes_NT.json`, `genes_O.json`
  — tabla de genes por categoría en formato columnar.

## Métricas de expresión

- `log2FC T/N = log2(media geométrica T / media geométrica N)`, sumando **0.1** a
  la FPKM de cada muestra.
- Porcentajes brutos de muestras fuera del rango:
  - T↓: T < mín(N) − 0.1
  - T↑: T > máx(N) + 0.1
  - N↓: N < mín(T) − 0.1
  - N↑: N > máx(T) + 0.1
- Umbrales de activación: 10 % en T y 5 % en N, aplicados con `ceil`. Los
  porcentajes se guardan aunque no lleguen al umbral, para ver los casos
  “casi activados”.
- “Casi activado”: porcentaje mayor o igual al 80 % del umbral y menor que el
  umbral. En la página Genes el margen se puede cambiar a 80, 90 o 95 %.

## Cobertura

| Cáncer | Experimentos | Estudios | Analizados | Publicaciones |
|---|---:|---:|---:|---:|
| PRAD | 195 | 95 | 69 | 89 |
| LUAD | 61 | 37 | 37 | 34 |
| BRCA | 625 | 233 | 270 | 174 |

## Verificación de publicaciones

Cada enlace procede de una fuente primaria y se guarda con su origen (`ena`,
`geo`, `biostudies`, `title` o `manual`). Los informes están en el repositorio de
análisis: `informe/papers/verificacion_*.md`.

## Publicación

GitHub Pages sirve la raíz de la rama `main`.

## Regeneración

Desde el repositorio de análisis:

```bash
python pipeline/steps/step1_build_matrices_and_classify.py
python pipeline/web/build_site.py --all
```

El generador escribe `docs/`; su contenido se copia a la raíz de este repositorio.
