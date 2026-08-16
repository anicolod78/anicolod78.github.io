# photos/

Ogni **sottocartella** qui dentro diventa un **album** nella galleria (https://anicolod78.github.io/gallery/).

```
photos/
  vacanze-2024/      <- il nome della cartella diventa il titolo dell'album
    IMG_001.jpg
    IMG_002.jpg
  montagna/
    IMG_010.jpg
```

## Come aggiungere foto

Basta caricare le immagini in una sottocartella e fare push: un workflow GitHub Actions
genera automaticamente le miniature e aggiorna la galleria (di solito entro 1-2 minuti).

- **PC:** copia le foto nella cartella e `git add . && git commit -m "nuove foto" && git push`,
  oppure usa GitHub Desktop, oppure sul sito: *Add file → Upload files*.
- **Smartphone:** dal browser su github.com apri la cartella dell'album → *Add file → Upload files*;
  oppure usa un'app git (Working Copy su iOS, MGit/Termux su Android) per caricare dalla galleria del telefono.

## Note

- Formati supportati: `.jpg .jpeg .png .webp .gif`
- Il titolo dell'album deriva dal nome della cartella (`vacanze-2024` → "Vacanze 2024").
- Le miniature vengono messe in `gallery/thumbs/` e l'indice in `gallery/manifest.json`: sono
  generati automaticamente, non modificarli a mano.
- Le foto a piena risoluzione restano qui in `photos/` (aperte dalla lightbox al click).
