---
"frontend-reglementaire-bijlage": minor
---

Re-enable/extend connected documents feature:
- `SnippetList` model: remove unnecessary `templates` relationship
- `DocumentContainer` model: rename `snippetLists` relationship to `linkedSnippetLists`
- `Snippet` model: add `linkedSnippetLists` relationship
- Extend `snippet-list` edit page to include both connected templates *and* connected snippets
- Add `@lblod/marawa` dependency to allow for RDFa document parsing
- Ensure the connected snippet-lists are extracted and stored on saving templates/snippets
