import Controller from '@ember/controller';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { v4 as uuid } from 'uuid';
import isAfter from 'date-fns/isAfter';
import { Schema } from '@lblod/ember-rdfa-editor';
import { insertHtml } from '@lblod/ember-rdfa-editor/commands/insert-html-command';
import {
  em,
  strikethrough,
  strong,
  underline,
  subscript,
  superscript,
} from '@lblod/ember-rdfa-editor/plugins/text-style';
import {
  blockRdfaWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import {
  tableKeymap,
  tableNodes,
  tablePlugins,
} from '@lblod/ember-rdfa-editor/plugins/table';
import { link, linkView } from '@lblod/ember-rdfa-editor/nodes/link';
import {
  inlineRdfaWithConfigView,
  inlineRdfaWithConfig,
} from '@lblod/ember-rdfa-editor/nodes/inline-rdfa';
import {
  tableOfContentsView,
  table_of_contents,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/table-of-contents-plugin/nodes';
import {
  bulletListWithConfig,
  listItemWithConfig,
  listTrackingPlugin,
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';

import instantiateUuids from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/instantiate-uuids';
import { generateTemplate } from '../../utils/generate-template';
import { getOwner } from '@ember/application';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import {
  codelist,
  codelistView,
  date,
  dateView,
  number,
  numberView,
  textVariableView,
  text_variable,
  personVariableView,
  person_variable,
  autofilled_variable,
  autofilledVariableView,
  location,
  locationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { docWithConfig } from '@lblod/ember-rdfa-editor/nodes/doc';
import { undo } from '@lblod/ember-rdfa-editor/plugins/history';
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import PersonVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/person/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import SnippetInsertRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-insert-rdfa';
import AutofilledInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/autofilled/insert';
import {
  DECISION_STANDARD_FOLDER,
  IVGR_TAGS,
  PROPERTY_OBJECTS,
  PROPERTY_PREDICATES,
  RELATIONSHIP_PREDICATES,
  RMW_TAGS,
} from '../../utils/constants';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';
import NodeControlsCard from '@lblod/ember-rdfa-editor/components/_private/node-controls/card';
import DocImportedResourceEditorCard from '@lblod/ember-rdfa-editor/components/_private/doc-imported-resource-editor/card';
import ImportedResourceLinkerCard from '@lblod/ember-rdfa-editor/components/_private/imported-resource-linker/card';
import ExternalTripleEditorCard from '@lblod/ember-rdfa-editor/components/_private/external-triple-editor/card';
import RelationshipEditorCard from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/card';
import CreateRelationshipButton from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/create-button';
import SnippetListSelectRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select-rdfa';
import {
  snippetPlaceholder,
  snippetPlaceholderView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import {
  snippet,
  snippetView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import {
  structureViewWithConfig,
  structureWithConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import StructureControl from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/control-card';
import StructureInsert from '@lblod/ember-rdfa-editor-lblod-plugins/components/decision-plugin/insert-article';
import {
  mandatee_table,
  mandateeTableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/mandatee-table-plugin/node';

import {
  osloLocation,
  osloLocationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import { variableAutofillerPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/plugins/autofiller';
import {
  BESLUIT,
  SAY,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { extractSnippetListUris } from '../../utils/extract-snippet-lists';
import {
  combineConfigs,
  documentConfig,
  lovConfig,
} from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/configs';
import VisualiserCard from '@lblod/ember-rdfa-editor/components/_private/rdfa-visualiser/visualiser-card';
import { RDFA_VISUALIZER_CONFIG } from '../../utils/citerra-poc/visualizer';

/** @import EditorSettings from '../../services/editor-settings'; */

const SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE = 'data-snippet-list-ids';
const GEMEENTE_CLASSIFICATION_URI =
  'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001';

export default class TemplateManagementEditController extends Controller {
  @service store;
  @service router;
  @service intl;
  @service currentSession;

  /** @type {EditorSettings} */
  @service('editor-settings') editorSettingsService;

  @tracked editor;
  @tracked _editorDocument;
  @tracked citationPlugin = citationPlugin(this.config.citation);
  @tracked assignedSnippetListsIds = [];
  @tracked isConfirmUnpublishOpen = false;

  VisualiserCard = VisualiserCard;
  CreateRelationshipButton = CreateRelationshipButton;
  NodeControlsCard = NodeControlsCard;
  DocImportedResourceEditorCard = DocImportedResourceEditorCard;
  ImportedResourceLinkerCard = ImportedResourceLinkerCard;
  ExternalTripleEditorCard = ExternalTripleEditorCard;
  RelationshipEditorCard = RelationshipEditorCard;
  AttributeEditor = AttributeEditor;
  DebugInfo = DebugInfo;

  SnippetListSelect = SnippetListSelectRdfaComponent;
  SnippetInsert = SnippetInsertRdfaComponent;
  StructureInsert = StructureInsert;
  StructureControl = StructureControl;

  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content: 'table_of_contents? document_title? block+',

        extraAttributes: {
          [SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE]: { default: null },
        },
        rdfaAware: true,
      }),
      paragraph,
      structure: structureWithConfig(this.config.structures),
      document_title,
      repaired_block: repairedBlockWithConfig({ rdfaAware: true }),

      list_item: listItemWithConfig({
        enableHierarchicalList: true,
      }),
      ordered_list: orderedListWithConfig({
        enableHierarchicalList: true,
      }),
      bullet_list: bulletListWithConfig({
        enableHierarchicalList: true,
      }),
      templateComment,
      placeholder,
      ...tableNodes({
        tableGroup: 'block',
        cellContent: 'block+',
      }),
      date: date(this.config.date),
      text_variable,
      location,
      oslo_location: osloLocation(this.config.location),
      person_variable,
      autofilled_variable,
      number,
      codelist,
      roadsign_regulation,
      mandatee_table,

      heading: headingWithConfig({ rdfaAware: false }),
      blockquote,

      horizontal_rule,
      code_block,

      text,

      image,

      inline_rdfa: inlineRdfaWithConfig({ rdfaAware: true }),
      hard_break,
      block_rdfa: blockRdfaWithConfig({ rdfaAware: true }),
      table_of_contents: table_of_contents(this.config.tableOfContents),
      invisible_rdfa: invisibleRdfaWithConfig({ rdfaAware: true }),
      link: link(this.config.link),
      snippet_placeholder: snippetPlaceholder(this.config.snippet),
      snippet: snippet(this.config.snippet),
    },
    marks: {
      em,
      strong,
      underline,
      strikethrough,
      subscript,
      superscript,
      highlight,
      color,
    },
  });

  get sidebarSettings() {
    return this.editorSettingsService.sidebarSettings;
  }

  @action
  toggleMenu(menuKey, expanded) {
    const sidebarSettings = this.sidebarSettings;
    sidebarSettings[menuKey]['expanded'] = expanded;
    this.editorSettingsService.sidebarSettings = sidebarSettings;
  }

  get variableTypes() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return [
      {
        label: this.intl.t('editor.variables.text'),
        component: TextVariableInsertComponent,
      },
      {
        label: this.intl.t('editor.variables.number'),
        component: NumberInsertComponent,
      },
      {
        label: this.intl.t('editor.variables.date'),
        component: DateInsertVariableComponent,
      },
      {
        label: this.intl.t('editor.variables.codelist'),
        component: CodelistInsertComponent,
        options: {
          endpoint: config.insertVariablePlugin.endpoint,
          publisher: this.currentSession.group?.uri,
        },
      },
      {
        label: this.intl.t('editor.variables.person'),
        component: PersonVariableInsertComponent,
      },
      {
        label: 'autofilled',
        component: AutofilledInsertComponent,
      },
    ];
  }

  get supportsTables() {
    return (
      this.editor && this.editor.activeEditorState.schema.nodes['table_cell']
    );
  }
  get supportsComments() {
    return (
      this.editor &&
      this.editor.activeEditorState.schema.nodes['templateComment']
    );
  }
  get config() {
    const env = getOwner(this).resolveRegistration('config:environment');
    const relationshipPredicates = [
      ...RELATIONSHIP_PREDICATES,
      ...(this.internalTypeName === 'decision'
        ? [
            'http://data.europa.eu/eli/ontology#title',
            'http://data.europa.eu/eli/ontology#description',
            'http://data.vlaanderen.be/ns/besluit#motivering',
            'http://data.europa.eu/eli/ontology#has_part',
          ]
        : ['http://mu.semte.ch/vocabularies/ext/title']),
    ];
    return {
      tableOfContents: {
        scrollContainer: () =>
          document.getElementsByClassName('say-container__main')[0],
        scrollingPadding: 300,
      },
      date: {
        formats: [
          {
            label: 'Short Date',
            key: 'short',
            dateFormat: 'dd/MM/yy',
            dateTimeFormat: 'dd/MM/yy HH:mm',
          },
          {
            label: 'Long Date',
            key: 'long',
            dateFormat: 'EEEE dd MMMM yyyy',
            dateTimeFormat: 'PPPPp',
          },
        ],
        allowCustomFormat: true,
      },
      structures:
        this.internalTypeName === 'decision'
          ? {
              uriGenerator: 'template-uuid4',
              fullLengthArticles: false,
              onlyArticleSpecialName: true,
            }
          : {
              uriGenerator: 'template-uuid4',
              fullLengthArticles: true,
              onlyArticleSpecialName: false,
            },
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema) {
          return new Set([schema.nodes.doc]);
        },
        endpoint: '/codex/sparql',
      },
      link: {
        interactive: true,
        rdfaAware: true,
      },
      snippet: {
        endpoint: '/raw-sparql',
      },
      roadsignRegulation: {
        endpoint: env.mowRegistryEndpoint,
        imageBaseUrl: env.roadsignImageBaseUrl,
      },
      decisionType: {
        endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
        classificatieUri: GEMEENTE_CLASSIFICATION_URI,
      },
      lmb: {
        endpoint: '/vendor-proxy/query',
      },
      mandateeTable: {
        tags: [...IVGR_TAGS, ...RMW_TAGS],
        defaultTag: IVGR_TAGS[0],
      },

      location: {
        defaultPointUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/',
        defaultPlaceUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/',
        defaultAddressUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/adres/',
        subjectTypesToLinkTo:
          this.internalTypeName === 'decision'
            ? [BESLUIT('Artikel'), BESLUIT('Besluit')]
            : [
                SAY('Article'),
                SAY('Subsection'),
                SAY('Section'),
                SAY('Chapter'),
              ],
      },
      autofilledVariable: {
        autofilledValues: {},
      },
      rdfa: {
        propertyPredicates: [...PROPERTY_PREDICATES, ...relationshipPredicates],
        propertyObjects: PROPERTY_OBJECTS,
        backlinkPredicates: relationshipPredicates,
      },
    };
  }

  get nodeViews() {
    return (controller) => {
      return {
        table_of_contents: tableOfContentsView(this.config.tableOfContents)(
          controller,
        ),
        link: linkView(this.config.link)(controller),
        date: dateView(this.config.date)(controller),
        number: numberView(controller),
        text_variable: textVariableView(controller),
        codelist: codelistView(controller),
        oslo_location: osloLocationView(this.config.location)(controller),
        templateComment: templateCommentView(controller),
        person_variable: personVariableView(controller),
        inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
        block_rdfa: (node) => new BlockRDFaView(node),
        snippet_placeholder: snippetPlaceholderView(this.config.snippet)(
          controller,
        ),
        mandatee_table: mandateeTableView(controller),
        structure: structureViewWithConfig(this.config.structures)(controller),
        snippet: snippetView(this.config.snippet)(controller),
        autofilled_variable: autofilledVariableView(controller),
        location: locationView(controller),
      };
    };
  }

  get plugins() {
    return [
      ...tablePlugins,
      tableKeymap,
      this.citationPlugin,
      linkPasteHandler(this.schema.nodes.link),
      listTrackingPlugin(),
      editableNodePlugin(),
      variableAutofillerPlugin(this.config.autofilledVariable),
    ];
  }
  get activeNode() {
    if (this.editor) {
      return getActiveEditableNode(this.editor.activeEditorState);
    }
    return null;
  }

  /** @returns {'decision', 'regulatory-attachment'} - the internal name for the template type */
  get internalTypeName() {
    return this.model?.templateTypeId === DECISION_STANDARD_FOLDER
      ? 'decision'
      : 'regulatory-attachment';
  }

  @action
  handleRdfaEditorInit(editor) {
    this.editor = editor;
    if (this.editorDocument.content) {
      editor.initialize(this.editorDocument.content, { doNotClean: true });
      this.assignedSnippetListsIds = this.documentSnippetListIds;
    } else if (this.model?.templateTypeId === DECISION_STANDARD_FOLDER) {
      // This is a decision with no content, so we need to insert a decision (besluit) node so that
      // any of the decision-based plugins work
      const decisionNodeType = this.editor.schema.nodes['block_rdfa'];
      if (decisionNodeType) {
        /** @type {import('@lblod/ember-rdfa-editor/core/rdfa-processor').OutgoingTriple[]} */
        const outgoingProps = [
          {
            predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            object: {
              termType: 'NamedNode',
              value: 'http://data.vlaanderen.be/ns/besluit#Besluit',
            },
          },
        ];
        const decisionUuid = uuid();
        const decisionNode = decisionNodeType.create(
          {
            subject: `http://data.lblod.info/id/besluiten/--ref-uuid4-${decisionUuid}`,
            properties: outgoingProps,
            rdfaNodeType: 'resource',
          },
          this.editor.schema.nodes['paragraph'].create(),
        );
        this.editor.withTransaction(
          (tr) => tr.replaceSelectionWith(decisionNode),
          { view: this.editor.mainEditorView },
        );
      }
    } else {
      const docId = uuid();
      editor.initialize(
        `<div data-say-document="true" resource="http://example.net/id/reglement/--ref-uuid4-${docId}" typeof="ext:Reglement"></div>`,
      );
    }
  }

  get dirty() {
    // Since we clear the undo history when saving, this works. If we want to maintain undo history
    // on save, we would need to add functionality to the editor to track what is the 'saved' state
    return this.editor?.checkCommand(undo, {
      view: this.editor?.mainEditorView,
    });
  }

  get editorDocument() {
    return this._editorDocument || this.model.editorDocument;
  }

  publish = task(async () => {
    await this.save.perform();
    this.router.transitionTo(
      'template-management.publish',
      this.model.documentContainer.id,
      {
        queryParams: {
          overrideConfirm: true,
        },
      },
    );
  });

  save = task(async () => {
    const html = this.editor.htmlContent;
    const templateVersion = generateTemplate(this.editor);
    const editorDocument = this.store.createRecord('editor-document', {
      title: this.model.editorDocument.title,
      content: html,
      templateVersion: templateVersion,
      createdOn: this.model.editorDocument.createdOn,
      updatedOn: new Date(),
      documentContainer: this.model.documentContainer,
    });
    await editorDocument.save();

    const documentContainer = this.model.documentContainer;
    documentContainer.currentVersion = editorDocument;

    const snippetListUris = extractSnippetListUris(html);
    const snippetListObjects = await Promise.all(
      snippetListUris.map((uri) => this.store.findByUri('snippet-list', uri)),
    );
    documentContainer.linkedSnippetLists = snippetListObjects;
    await documentContainer.save();
    this._editorDocument = editorDocument;
  });

  get documentSnippetListIds() {
    return (
      this.editor
        .getDocumentAttribute(SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE)
        ?.split(',')
        .filter(Boolean) ?? []
    );
  }

  set documentSnippetListIds(snippetIds) {
    this.editor.setDocumentAttribute(
      SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE,
      snippetIds.join(','),
    );
    this.assignedSnippetListsIds = snippetIds;
  }

  get isPublished() {
    const version = this.model.templateVersion;
    return (
      version &&
      (!this.unpublishDate || isAfter(this.unpublishDate, Date.now()))
    );
  }
  get unpublishDate() {
    const validThrough = this.model.templateVersion?.validThrough;
    return (
      validThrough &&
      (validThrough instanceof Date ? validThrough : new Date(validThrough))
    );
  }

  @action
  openConfirmUnpublish() {
    this.isConfirmUnpublishOpen = true;
  }

  @action
  closeConfirmUnpublish() {
    this.isConfirmUnpublishOpen = false;
  }

  unpublishTemplate = task(async () => {
    this.model.templateVersion.validThrough = new Date();
    await this.model.templateVersion.save();
  });

  /**
   * CITERRA POC
   */
  visualizerConfig = RDFA_VISUALIZER_CONFIG;
  get optionGeneratorConfig() {
    if (this.editor) {
      return combineConfigs(documentConfig(this.editor), lovConfig());
    } else {
      return;
    }
  }

  subjectOptionGeneratorTask = restartableTask(async (args) => {
    await timeout(200);
    const result = (await this.optionGeneratorConfig?.subjects?.(args)) ?? [];
    return result;
  });
  predicateOptionGeneratorTask = restartableTask(async (args) => {
    await timeout(200);
    const result = (await this.optionGeneratorConfig?.predicates?.(args)) ?? [];
    return result;
  });
  objectOptionGeneratorTask = restartableTask(async (args) => {
    await timeout(200);
    const result = (await this.optionGeneratorConfig?.objects?.(args)) ?? [];
    return result;
  });

  optionGeneratorConfigTaskified = {
    subjects: this.subjectOptionGeneratorTask.perform.bind(this),
    predicates: this.predicateOptionGeneratorTask.perform.bind(this),
    objects: this.objectOptionGeneratorTask.perform.bind(this),
  };

  get codelistEditOptions() {
    return {
      endpoint: '/sparql',
    };
  }
  @action
  insertThing(thing) {
    const map = {
      nummerplaten: /* HTML */ `
        <div
          class="say-editable say-block-rdfa"
          about="http://data.vlaanderen.be/id/voorwaarden/--ref-uuid4-b73cdde4-482a-454a-8323-ce20e04e3ac7"
          data-say-id="b73cdde4-482a-454a-8323-ce20e04e3ac7"
          property="http://www.w3.org/ns/prov#value"
          lang="nl-be"
          data-pm-slice="0 0 []"
        >
          <div
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
          >
            <span
              about="http://data.vlaanderen.be/id/voorwaarden/--ref-uuid4-b73cdde4-482a-454a-8323-ce20e04e3ac7"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://data.europa.eu/m8g/Requirement"
            ></span
            ><span
              property="http://www.w3.org/2004/02/skos/core#prefLabel"
              content="Aantal nummerplaten"
              lang="nl-be"
            ></span>
          </div>
          <div data-content-container="true">
            <p class="say-paragraph">
              Tenzij anders bepaald, kan de vergunning voor een onbeperkt aantal
              nummerplaten worden aangevraagd
            </p>
          </div>
        </div>
      `,
      duurtijd: /* HTML */ `
        <div
          class="say-editable say-block-rdfa"
          about="http://data.vlaanderen.be/id/duurtijden/--ref-uuid4-7586b9c7-e0ed-4a9f-94f6-5705420ec3cf"
          data-say-id="7586b9c7-e0ed-4a9f-94f6-5705420ec3cf"
          property="http://www.w3.org/ns/prov#value"
          lang="nl-be"
          data-pm-slice="0 0 []"
        >
          <div
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
          >
            <span
              about="http://data.vlaanderen.be/id/duurtijden/--ref-uuid4-7586b9c7-e0ed-4a9f-94f6-5705420ec3cf"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://data.europa.eu/m8g/Requirement"
            ></span
            ><span
              property="http://www.w3.org/2004/02/skos/core#prefLabel"
              content="Duurtijd"
              lang="nl-be"
            ></span>
          </div>
          <div data-content-container="true">
            <p class="say-paragraph">
              Tenzij anders bepaald, heeft de vergunning een onbeperkte
              duurtijd.
            </p>
          </div>
        </div>
      `,
      zone: /* HTML */ `
        <div
          class="say-editable say-block-rdfa"
          about="http://data.vlaanderen.be/id/zones/--ref-uuid4-32047e20-00d3-4b66-8f1f-9dc5fa275e0f"
          data-say-id="32047e20-00d3-4b66-8f1f-9dc5fa275e0f"
          property="http://www.w3.org/ns/prov#value"
          lang="nl-be"
          data-pm-slice="0 0 []"
        >
          <div
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
          >
            <span
              property="http://www.w3.org/2004/02/skos/core#prefLabel"
              content="Zone"
              lang="nl-be"
            ></span
            ><span
              about="http://data.vlaanderen.be/id/zones/--ref-uuid4-32047e20-00d3-4b66-8f1f-9dc5fa275e0f"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="https://data.vlaanderen.be/ns/mobiliteit#Zone"
            ></span
            ><span
              about="http://data.vlaanderen.be/id/zones/--ref-uuid4-32047e20-00d3-4b66-8f1f-9dc5fa275e0f"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://data.europa.eu/m8g/Requirement"
            ></span>
          </div>
          <div data-content-container="true"><p class="say-paragraph"></p></div>
        </div>
      `,
      bewijsstuk: /* HTML */ `
        <span
          class="say-variable"
          data-say-variable="true"
          data-say-variable-type="codelist"
          data-selection-style="single"
          data-label="bewijsstuk"
          data-codelist="http://lblod.data.gift/concept-schemes/6810101828455F96985D7CD2"
          data-source="/raw-sparql"
          data-say-id="5af9422e-2479-4b3b-8ca6-0a30d66cf254"
          data-literal-node="true"
          datatype="http://www.w3.org/2001/XMLSchema#string"
          ><span
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
          ></span
          ><span data-content-container="true"
            ><span
              class="mark-highlight-manual say-placeholder"
              placeholdertext="bewijsstuk"
              contenteditable="false"
              >bewijsstuk</span
            ></span
          ></span
        >
      `,
      voorwaarde: /* HTML */ `
        <div
          class="say-editable say-block-rdfa"
          about="http://data.vlaanderen.be/id/voorwaarden/--ref-uuid4-197c3905-3587-4c33-9765-d34ec7e113a1"
          data-say-id="d3ecf4b0-f9b5-4ef8-893e-94784f170a61"
          property="http://www.w3.org/ns/prov#value"
          lang="nl-be"
          data-pm-slice="0 0 []"
        >
          <div
            style="display: none"
            class="say-hidden"
            data-rdfa-container="true"
          >
            <span
              about="http://data.vlaanderen.be/id/voorwaarden/--ref-uuid4-197c3905-3587-4c33-9765-d34ec7e113a1"
              property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
              resource="http://data.europa.eu/m8g/Requirement"
            ></span
            ><span
              property="http://www.w3.org/2004/02/skos/core#prefLabel"
              content="Voorwaarde"
              lang="nl-be"
            ></span
            ><span
              rev="http://data.europa.eu/m8g/isRequirementOf"
              resource="http://collection/1"
            ></span>
          </div>
          <div data-content-container="true"><p class="say-paragraph"></p></div>
        </div>
      `,
      doelgroep: /* HTML */ `
        <div>
          <div
            class="say-editable say-block-rdfa"
            about="http://data.vlaanderen.be/7079c444-a934-4ddf-85d1-f0968b5555dd"
            data-say-id="7079c444-a934-4ddf-85d1-f0968b5555dd"
            data-pm-slice="0 0 []"
          >
            <div
              style="display: none"
              class="say-hidden"
              data-rdfa-container="true"
            >
              <span
                about="http://data.vlaanderen.be/7079c444-a934-4ddf-85d1-f0968b5555dd"
                property="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                resource="http://data.europa.eu/m8g/Requirement"
              ></span
              ><span
                property="http://www.w3.org/2004/02/skos/core#prefLabel"
                content="Doelgroep"
                lang="nl-be"
              ></span>
            </div>
            <div data-content-container="true">
              <p class="say-paragraph">
                <span
                  class="say-variable"
                  data-say-variable="true"
                  data-say-variable-type="codelist"
                  data-selection-style="single"
                  data-label="type aanvrager"
                  data-codelist="http://lblod.data.gift/concept-schemes/680FE8AD28455F96985D7CB9"
                  data-source="/raw-sparql"
                  data-say-id="0b1fedba-91c9-4d2d-9720-67bc618e8842"
                  data-literal-node="true"
                  datatype="http://www.w3.org/2001/XMLSchema#string"
                  ><span
                    style="display: none"
                    class="say-hidden"
                    data-rdfa-container="true"
                  ></span
                  ><span data-content-container="true"
                    ><span
                      class="mark-highlight-manual say-placeholder"
                      placeholdertext="type aanvrager"
                      contenteditable="false"
                      >type aanvrager</span
                    ></span
                  ></span
                >
                waarbij volgende voorwaarden van toepassing zijn:
              </p>
            </div>
          </div>
        </div>
      `,
    };
    console.log(this.editor);
    this.editor.doCommand(
      insertHtml(
        instantiateUuids(map[thing]),
        this.editor.mainEditorState.selection.from,
        this.editor.mainEditorState.selection.to,
        undefined,
        false,
        true,
      ),
      { view: this.editor.mainEditorView },
    );
  }
}
