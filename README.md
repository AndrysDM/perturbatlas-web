# PerturbAtlas × TCGA — Explorador de experimentos

Sitio estático con los experimentos de perturbación de **PerturbAtlas** integrados
con la clasificación tumoral de **TCGA**. Cubre **PRAD**, **LUAD** y **BRCA**.

## Páginas

- `index.html` — resumen por cáncer: experimentos, estudios y publicaciones; tabla
  por tipo de gen (T / N / NT / O) y distribución de categorías y estados.
- `experiments.html` — tabla completa con búsqueda, filtros por categoría,
  condición y estado, y ficha de detalle. Los experimentos sin análisis indican el
  motivo (gen O, multi-diana, diana sin clasificar o DEG no disponible).
- `papers.html` — publicaciones originales con su resumen, la fuente del enlace y
  los experimentos que cubren.
- `methodology.html` — esquema de clasificación y reglas de análisis.

## Datos

- `data/index.json` — catálogo de cánceres disponibles.
- `data/prad/`, `data/luad/`, `data/brca/` — `experiments.json`, `papers.json` y
  `summary.json` por cáncer.

## Cobertura

| Cáncer | Experimentos | Estudios | Analizados | Publicaciones |
|---|---:|---:|---:|---:|
| PRAD | 195 | 95 | 69 | 89 |
| LUAD | 61 | 37 | 37 | 34 |
| BRCA | 625 | 233 | 270 | 174 |

Los estudios sin publicación quedan marcados como “sin paper”; no se inventa
ninguna referencia.

## Verificación de publicaciones

Cada enlace procede de una fuente primaria y se guarda con su origen:

- `ena` — PubMed asociado al estudio en ENA;
- `geo` — PubMed vinculado a la serie GEO (NCBI);
- `biostudies` — título de publicación depositado en BioStudies/ArrayExpress;
- `title` — búsqueda por título en Europe PMC, aceptada solo si coincide;
- `manual` — corrección con PMID verificado.

Los informes de verificación están en el repositorio de análisis:
`informe/papers/verificacion_prad.md`, `verificacion_luad.md` y
`verificacion_brca.md`.

## Publicación

GitHub Pages sirve la raíz de la rama `main`.

## Regeneración

Desde el repositorio de análisis:

```bash
python pipeline/web/build_site.py --all
```

El generador escribe `docs/`; su contenido se copia a la raíz de este repositorio.
