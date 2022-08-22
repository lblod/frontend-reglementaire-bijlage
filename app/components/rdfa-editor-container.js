import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class RdfaEditorContainerComponent extends Component {
  @tracked editor;
  @service currentSession;

  plugins = [
    'article-structure',
    'rdfa-toc',
    {
      name: 'insert-variable',
      options: {
        administrativeUnitUuid: this.currentSession.group.id,
      },
    },
  ];
  get editorOptions() {
    return (
      this.args.editorOptions ?? {
        showToggleRdfaAnnotations: Boolean(this.args.showToggleRdfaAnnotations),
        showInsertButton: false,
        showRdfa: true,
        showRdfaHighlight: true,
        showRdfaHover: true,
        showPaper: true,
        showSidebar: true,
      }
    );
  }

  get toolbarOptions() {
    return (
      this.args.toolbarOptions ?? {
        showTextStyleButtons: true,
        showListButtons: true,
        showIndentButtons: true,
      }
    );
  }

  get documentContext() {
    if (this.args.editorDocument) {
      try {
        return JSON.parse(this.args.editorDocument.context);
      } catch (e) {
        console.warn(
          'Error encountered during parsing of document context. ' +
            'Reverting to default context.',
          e
        );
      }
    }
    return {
      prefix: this.args.prefix ?? '',
      typeof: '',
      vocab: '',
    };
  }

  get vocab() {
    return this.documentContext['vocab'];
  }

  /**
   * this is a workaround because emberjs does not allow us to assign the prefix attribute in the template
   * see https://github.com/emberjs/ember.js/issues/19369
   */
  @action
  setPrefix(element) {
    element.setAttribute(
      'prefix',
      'eli: http://data.europa.eu/eli/ontology# prov: http://www.w3.org/ns/prov# mandaat: http://data.vlaanderen.be/ns/mandaat# besluit: http://data.vlaanderen.be/ns/besluit# say:https://say.data.gift/ns/ dct: http://purl.org/dc/terms/ ext:http://mu.semte.ch/vocabularies/ext/'
    );
  }

  @action
  rdfaEditorInit(editor) {
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(editor);
    }
    this.editor = editor;
  }

  prefixToAttrString(prefix) {
    let attrString = '';
    Object.keys(prefix).forEach((key) => {
      let uri = prefix[key];
      attrString += `${key}: ${uri} `;
    });
    return attrString;
  }
}
