import Controller from '@ember/controller';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import { v4 as uuid } from 'uuid';
import isAfter from 'date-fns/isAfter';
import { PNode, SayController, Schema } from '@lblod/ember-rdfa-editor';
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
  orderedListWithConfig,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { placeholder } from '@lblod/ember-rdfa-editor/plugins/placeholder';
import { headingWithConfig } from '@lblod/ember-rdfa-editor/plugins/heading';
import { blockquote } from '@lblod/ember-rdfa-editor/plugins/blockquote';
import { code_block } from '@lblod/ember-rdfa-editor/plugins/code';
import { image } from '@lblod/ember-rdfa-editor/plugins/image';

import instantiateUuids from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/standard-template-plugin/utils/instantiate-uuids';
import { generateTemplate } from '../../utils/generate-template';
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import {
  codelist,
  codelist_option,
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
import {
  legacy_codelist,
  legacyCodelistView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables/legacy-codelist';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import { docWithConfig } from '@lblod/ember-rdfa-editor/nodes/doc';
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
import FormatTextIcon from '@lblod/ember-rdfa-editor/components/icons/format-text';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import {
  insertArticleContainerAtCursor,
  insertDescriptionAtCursor,
  insertMotivationAtCursor,
  insertTitleAtCursor,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-validation-plugin/common-fixes';
import { decisionShape } from '../../utils/decision-shape';
import {
  documentValidationPlugin,
  documentValidationPluginKey,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-validation-plugin';
import type Store from '../../services/store';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';
import type CurrentSessionService from '../../services/current-session';
import type EditorSettingsService from '../../services/editor-settings';
import { citerraMap } from './citerra-insert-map';

import environment from 'frontend-reglementaire-bijlage/config/environment';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';
import type TemplateManagementEditRoute from 'frontend-reglementaire-bijlage/routes/template-management/edit';
import type EditorDocumentModel from 'frontend-reglementaire-bijlage/models/editor-document';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';
import type {
  TargetOptionGeneratorArgs,
  SubjectOption,
  PredicateOption,
  ObjectOption,
} from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/types';
/** @import EditorSettings from '../../services/editor-settings'; */

const SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE = 'data-snippet-list-ids';
const GEMEENTE_CLASSIFICATION_URI =
  'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001';

export default class TemplateManagementEditController extends Controller {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare currentSession: CurrentSessionService;

  declare model: ModelFrom<TemplateManagementEditRoute>;
  @service('editor-settings')
  declare editorSettingsService: EditorSettingsService;

  @tracked editor?: SayController;
  @tracked _editorDocument?: EditorDocumentModel;
  @tracked citationPlugin = citationPlugin(this.config.citation);
  @tracked assignedSnippetListsIds: string[] = [];
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

  SnippetListSelect: unknown = SnippetListSelectRdfaComponent;
  SnippetInsert = SnippetInsertRdfaComponent;
  StructureInsert = StructureInsert;
  StructureControl = StructureControl;
  FormatTextIcon = FormatTextIcon;
  PlusIcon = PlusIcon;
  ThreeDotsIcon = ThreeDotsIcon;

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
      codelist_option,
      legacy_codelist,
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
  toggleMenu(menuKey: keyof typeof this.sidebarSettings, expanded: boolean) {
    const sidebarSettings = this.sidebarSettings;
    sidebarSettings[menuKey]['expanded'] = expanded;
    this.editorSettingsService.sidebarSettings = sidebarSettings;
  }

  get variableTypes() {
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
          endpoint: environment.insertVariablePlugin.endpoint,
          publisher: this.currentSession.group?.uri as string,
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
          document.getElementsByClassName(
            'say-container__main',
          )[0] as HTMLElement,
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
              uriGenerator: 'template-uuid4' as const,
              fullLengthArticles: false,
              onlyArticleSpecialName: true,
            }
          : {
              uriGenerator: 'template-uuid4' as const,
              fullLengthArticles: true,
              onlyArticleSpecialName: false,
            },
      citation: {
        type: 'nodes',
        activeInNodeTypes(schema: Schema) {
          return new Set([schema.nodes['doc']!]);
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
        endpoint: environment.mowRegistryEndpoint,
        imageBaseUrl: environment.roadsignImageBaseUrl,
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
        additionalRDFTypes: [
          sayDataFactory.namedNode(
            'https://data.vlaanderen.be/ns/mobiliteit#Zone',
          ),
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
      documentValidation: {
        rules: [
          {
            shaclRule:
              'https://data.vlaanderen.be/shacl/besluit-publicatie#besluit-title-validation',
            violations: {
              'http://www.w3.org/ns/shacl#MaxCountConstraintComponent': {
                helpText: this.intl.t(
                  'document-validation.helptext.too-many-title',
                ),
              },
              'http://www.w3.org/ns/shacl#MinCountConstraintComponent': {
                action: (controller: SayController) =>
                  insertTitleAtCursor(controller, this.intl),
                buttonTitle: this.intl.t(
                  'document-validation.actions.insert-title',
                ),
              },
            },
          },
          {
            shaclRule:
              'https://data.vlaanderen.be/shacl/besluit-publicatie#besluit-description-validation',
            violations: {
              'http://www.w3.org/ns/shacl#MaxCountConstraintComponent': {
                helpText: this.intl.t(
                  'document-validation.helptext.too-many-description',
                ),
              },
              'http://www.w3.org/ns/shacl#MinCountConstraintComponent': {
                action: (controller: SayController) =>
                  insertDescriptionAtCursor(controller, this.intl),
                buttonTitle: this.intl.t(
                  'document-validation.actions.insert-description',
                ),
              },
            },
          },
          {
            shaclRule:
              'https://data.vlaanderen.be/shacl/besluit-publicatie#besluit-motivering-validation',
            violations: {
              'http://www.w3.org/ns/shacl#MaxCountConstraintComponent': {
                helpText: this.intl.t(
                  'document-validation.helptext.too-many-motivation',
                ),
              },
              'http://www.w3.org/ns/shacl#MinCountConstraintComponent': {
                action: (controller: SayController) =>
                  insertMotivationAtCursor(controller, this.intl),
                buttonTitle: this.intl.t(
                  'document-validation.actions.insert-motivation',
                ),
              },
            },
          },
          {
            shaclRule:
              'https://data.vlaanderen.be/shacl/besluit-publicatie#besluit-article-container-validation',
            violations: {
              'http://www.w3.org/ns/shacl#MaxCountConstraintComponent': {
                helpText: this.intl.t(
                  'document-validation.helptext.too-many-article-container',
                ),
              },
              'http://www.w3.org/ns/shacl#MinCountConstraintComponent': {
                action: (controller: SayController) =>
                  insertArticleContainerAtCursor(controller, this.intl),
                buttonTitle: this.intl.t(
                  'document-validation.actions.insert-article-container',
                ),
              },
            },
          },
        ],
        //We use a custom shape because we had to hide temporaly the language validation
        documentShape: decisionShape,
      },
    };
  }

  get nodeViews() {
    return (controller: SayController) => {
      return {
        table_of_contents: tableOfContentsView(this.config.tableOfContents)(
          controller,
        ),
        link: linkView(this.config.link)(controller),
        date: dateView(this.config.date)(controller),
        number: numberView(controller),
        text_variable: textVariableView(controller),
        codelist: codelistView(controller),
        legacy_codelist: legacyCodelistView(controller),
        oslo_location: osloLocationView(this.config.location)(controller),
        templateComment: templateCommentView(controller),
        person_variable: personVariableView(controller),
        inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
        block_rdfa: (node: PNode) => new BlockRDFaView(node),
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
      editableNodePlugin(),
      variableAutofillerPlugin(this.config.autofilledVariable),
      documentValidationPlugin(this.config.documentValidation),
    ];
  }
  get activeNode() {
    if (this.editor) {
      return getActiveEditableNode(this.editor.activeEditorState);
    }
    return null;
  }

  get internalTypeName(): 'decision' | 'regulatory-attachment' {
    return this.model?.templateTypeId === DECISION_STANDARD_FOLDER
      ? 'decision'
      : 'regulatory-attachment';
  }

  @action
  async handleRdfaEditorInit(editor: SayController) {
    this.editor = editor;
    if (this.editorDocument.content) {
      editor.initialize(this.editorDocument.content as string, {
        doNotClean: true,
        startsDirty: false,
      });
      this.assignedSnippetListsIds = this.documentSnippetListIds;
    } else if (this.model?.templateTypeId === DECISION_STANDARD_FOLDER) {
      // This is a decision with no content, so we need to insert a decision (besluit) node so that
      // any of the decision-based plugins work
      const decisionNodeType = this.editor.schema.nodes['block_rdfa'];
      if (decisionNodeType) {
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
          this.editor.schema.nodes['paragraph']?.create(),
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
    // Validate document
    const pluginState = documentValidationPluginKey.getState(
      editor.mainEditorView.state,
    );
    if (!pluginState) return;
    const { validationCallback } = pluginState;
    await validationCallback(editor.mainEditorView, editor.htmlContent);
  }

  get dirty() {
    return this.editor?.isDirty;
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
    if (this.editor) {
      const html = this.editor.htmlContent;
      const templateVersion = generateTemplate(this.editor);
      const editorDocument = this.store.createRecord('editor-document', {
        title: this.model.editorDocument.title,
        content: html,
        templateVersion: templateVersion,
        createdOn: this.model.editorDocument.createdOn,
        updatedOn: new Date(),
        documentContainer: this.model.documentContainer,
      }) as EditorDocumentModel;
      await editorDocument.save();

      const documentContainer = this.model.documentContainer;
      documentContainer.currentVersion = editorDocument;

      const snippetListUris = extractSnippetListUris(html);
      const snippetListObjects = await Promise.all(
        snippetListUris.map(
          (uri: string) =>
            this.store.findByUri('snippet-list', uri) as Promise<SnippetList>,
        ),
      );
      documentContainer.linkedSnippetLists = snippetListObjects;
      await documentContainer.save();

      this._editorDocument = editorDocument;
      this.editor?.setHtmlContent(html);
      this.editor?.markClean();
    }
  });

  get documentSnippetListIds() {
    return (
      this.editor
        ?.getDocumentAttribute(SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE)
        ?.split(',')
        .filter(Boolean) ?? []
    );
  }

  set documentSnippetListIds(snippetIds) {
    if (this.editor) {
      this.editor.setDocumentAttribute(
        SNIPPET_LISTS_IDS_DOCUMENT_ATTRIBUTE,
        snippetIds.join(','),
      );
      this.assignedSnippetListsIds = snippetIds;
    }
  }

  get isPublished(): boolean {
    const version = this.model.templateVersion;
    return (
      Boolean(version) &&
      (!this.unpublishDate || isAfter(this.unpublishDate, Date.now()))
    );
  }
  get unpublishDate() {
    const validThrough = this.model.templateVersion?.validThrough as
      | string
      | Date
      | undefined;
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
    if (this.model.templateVersion) {
      this.model.templateVersion.validThrough = new Date();
      await this.model.templateVersion.save();
    }
  });

  /**
   * CITERRA POC
   */
  visualizerConfig = RDFA_VISUALIZER_CONFIG;
  get optionGeneratorConfig() {
    if (this.editor) {
      return combineConfigs(documentConfig(this.editor), lovConfig());
    } else {
      return undefined;
    }
  }

  subjectOptionGeneratorTask = restartableTask(
    async (args: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result: SubjectOption[] =
        (await this.optionGeneratorConfig?.subjects?.(args)) ?? [];
      return result;
    },
  );
  predicateOptionGeneratorTask = restartableTask(
    async (args: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result: PredicateOption[] =
        (await this.optionGeneratorConfig?.predicates?.(args)) ?? [];
      return result;
    },
  );
  objectOptionGeneratorTask = restartableTask(
    async (args: TargetOptionGeneratorArgs) => {
      await timeout(200);
      const result: ObjectOption[] =
        (await this.optionGeneratorConfig?.objects?.(args)) ?? [];
      return result;
    },
  );

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
  insertThing(thing: keyof typeof citerraMap) {
    if (this.editor) {
      this.editor.doCommand(
        insertHtml(
          instantiateUuids(citerraMap[thing]),
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
}
