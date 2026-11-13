# PerturbAtlas × TCGA — Explorador de experimentos

Sitio estático con los experimentos de perturbación de **PerturbAtlas** integrados
con la clasificación tumoral de **TCGA**. Cubre **PRAD**, **LUAD** y **BRCA**.

## Páginas

- `index.html` — resumen por cáncer: experimentos, estudios y publicaciones; tabla
  por tipo de gen (T / N / NT / O) y distribución de categorías y estados.
- `experiments.html` — tabla completa con búsqueda, filtros por categoría,
  condición y estado, y ficha de detalle. Los experimentos sin análisis indican el
  motivo (gen O, multi-diana, diana sin clasificar o DEG no disponible).
- `papers.html` — publicaciones originales con su resumen y los experimentos que
  cubren.
- `methodology.html` — esquema de clasificación y reglas de análisis.

## Datos

- `data/index.json` — catálogo de cánceres disponibles.
- `data/prad/`, `data/luad/`, `data/brca/` — `experiments.json`, `papers.json` y
  `summary.json` por cáncer.

## Cobertura

| Cáncer | Experimentos | Estudios | Analizados | Publicaciones |
|---|---:|---:|---:|---:|
| PRAD | 195 | 95 | 69 | 89 |
| LUAD | 61 | 37 | 37 | 31 (sin resúmenes) |
| BRCA | 625 | 233 | 270 | pendientes |

En PRAD las publicaciones están curadas con resumen. En LUAD están enlazadas pero
sin resumen; en BRCA la curación de publicaciones está pendiente. El análisis de
experimentos y los motivos de “sin análisis” están completos en los tres.

## Publicación

GitHub Pages sirve la raíz de la rama `main`.

## Regeneración

Desde el repositorio de análisis:

```bash
python pipeline/web/build_site.py --all
```

El generador escribe `docs/`; su contenido se copia a la raíz de este repositorio.
