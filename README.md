# PerturbAtlas × TCGA — Explorador de experimentos

Sitio estático con los experimentos de perturbación de **PerturbAtlas** integrados
con la clasificación tumoral de **TCGA**. Por ahora cubre **PRAD** (adenocarcinoma
de próstata); la estructura está preparada para añadir LUAD y BRCA.

## Páginas

- `index.html` — resumen: número de experimentos, estudios y publicaciones; tabla
  por tipo de gen (T / N / NT) y distribución de categorías y estados.
- `experiments.html` — tabla completa de experimentos con búsqueda, filtros por
  categoría, condición y estado, y ficha de detalle con la publicación asociada.
- `papers.html` — publicaciones originales con su resumen y los experimentos que
  cubren.
- `methodology.html` — esquema de clasificación y reglas de análisis.

## Datos

- `data/index.json` — catálogo de cánceres disponibles.
- `data/prad/experiments.json` — 195 experimentos con metadata, resultado del
  análisis y publicación.
- `data/prad/papers.json` — 89 publicaciones con resumen.
- `data/prad/summary.json` — KPIs y resumen por tipo de gen.

## Publicación

GitHub Pages sirve la raíz de la rama `main`.

## Regeneración

El sitio se genera desde el repositorio de análisis:

```bash
python pipeline/web/build_site.py --cancer prostate
```

El generador escribe `docs/`; su contenido se copia a la raíz de este repositorio.
Para añadir otro cáncer basta con ejecutar el generador con `--cancer luad` o
`--cancer brca` y volver a publicar.
