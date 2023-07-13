const defaultResources = [
  'https://say.data.gift/ns/Paragraph',
  'https://say.data.gift/ns/Article',
  'https://say.data.gift/ns/Subsection',
  'https://say.data.gift/ns/Section',
  'https://say.data.gift/ns/Chapter',
  'https://say.data.gift/ns/Title',
];

export function generateTemplate(editor) {
  let uris = [];
  for (let resource of defaultResources) {
    const quads = [
      ...editor.datastore.match(null, 'a', `>${resource}`).asQuads(),
    ];
    const resourceUris = quads.map((quad) => quad.subject.value);
    uris = [...uris, ...resourceUris];
  }
  let documentHTML = editor.htmlContent;
  for (let uri of uris) {
    const uriParts = uri.split('/');
    uriParts.pop();
    const uriWithoutUuid = uriParts.join('/');
    documentHTML = documentHTML.replace(
      uri,
      `${uriWithoutUuid}/\${generateUuid()}`,
    );
  }
  return documentHTML;
}
