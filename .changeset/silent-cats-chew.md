---
"frontend-reglementaire-bijlage": minor
---

Update editor and plugins to latest

plugins: [v35.0.0](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/releases/tag/v35.0.0)
editor: [v13.1.1](https://github.com/lblod/ember-rdfa-editor/releases/tag/@lblod/ember-rdfa-editor@13.1.1)

Also pins @ember/render-modifiers to v3 to avoid dev duplication. The only breaking change in v3 is the drop of support for node 18, which we're well above.
