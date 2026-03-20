import { analyse } from '@lblod/marawa/rdfa-context-scanner';

export function extractSnippetListUris(html) {
  const triples = extractTriplesFromDocument(html);
  const snippetListUris = triples
    .filter(
      (triple) =>
        triple.predicate === 'https://say.data.gift/ns/allowedSnippetList',
    )
    .map((triple) => triple.object);
  return [...new Set(snippetListUris)];
}

function extractTriplesFromDocument(html) {
  const node = document.createElement('body');
  node.innerHTML = html;
  const contexts = analyse(node).map((c) => c.context);
  return dedupTriples(contexts.flat());
}

function dedupTriples(triples) {
  const dedupedTriples = {};
  for (const triple of triples) {
    const hash = JSON.stringify(triple);
    dedupedTriples[hash] = triple;
  }
  return Object.values(dedupedTriples);
}
