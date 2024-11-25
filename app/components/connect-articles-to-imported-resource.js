import Component from '@glimmer/component';
import { action } from '@ember/object';
import { addProperty } from '@lblod/ember-rdfa-editor/commands/rdfa-commands/add-property';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { IMPORTED_RESOURCES_ATTR } from '@lblod/ember-rdfa-editor/plugins/imported-resources';

export default class ConnectArticlesToImportedResourceComponent extends Component {
  get controller() {
    return this.args.controller;
  }

  get importedResource() {
    return this.args.importedResource;
  }

  get nonConnectedArticleURIs() {
    const doc = this.controller.mainEditorState.doc;
    const articleURIs = new Set();
    doc.descendants((node) => {
      if (
        node.type === this.controller.schema.nodes.structure &&
        node.attrs.structureType === 'article' &&
        !this.isConnected(node)
      ) {
        articleURIs.add(node.attrs.subject);
      }
    });
    return articleURIs;
  }

  get docIsConnected() {
    return this.nonConnectedArticleURIs.size === 0;
  }

  @action
  connect() {
    const articleURIs = this.nonConnectedArticleURIs;
    for (const uri of articleURIs) {
      this.controller.doCommand(
        addProperty({
          resource: this.importedResource,
          property: {
            predicate: 'http://data.europa.eu/eli/ontology#has_part',
            object: sayDataFactory.resourceNode(uri),
          },
          isNewImportedResource: !this.documentImportedResources.includes(
            this.importedResource,
          ),
        }),
      );
    }
  }

  get documentImportedResources() {
    return this.controller.getDocumentAttribute(IMPORTED_RESOURCES_ATTR) ?? [];
  }

  isConnected(articleNode) {
    return Boolean(
      (articleNode.attrs.backlinks ?? []).some(
        (backlink) =>
          backlink.predicate == 'http://data.europa.eu/eli/ontology#has_part',
      ),
    );
  }
}
