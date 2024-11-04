---
"frontend-reglementaire-bijlage": patch
---

`rdfa-editor-container` component: include `emberApplication` prosemirror plugin by default.
This ensures that the serialization method of prosemirror nodes will be able to leverage `ember-intl` to provide an internationalized node serialization.
