import Controller from '@ember/controller';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';
import { NodeType, PNode, SayController, Schema } from '@lblod/ember-rdfa-editor';
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
  docWithConfig,
  hard_break,
  horizontal_rule,
  invisibleRdfaWithConfig,
  paragraph,
  repairedBlockWithConfig,
  text,
} from '@lblod/ember-rdfa-editor/nodes';
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
import { linkPasteHandler } from '@lblod/ember-rdfa-editor/plugins/link';
import { citationPlugin, type CitationPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';
import { highlight } from '@lblod/ember-rdfa-editor/plugins/highlight/marks/highlight';
import { color } from '@lblod/ember-rdfa-editor/plugins/color/marks/color';
import { trackedFunction } from 'reactiveweb/function';
import {
  address,
  addressView,
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
import { BlockRDFaView } from '@lblod/ember-rdfa-editor/nodes/block-rdfa';
import { document_title } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/document-title-plugin/nodes';
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
import AutofilledInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/autofilled/insert';
import {
  editableNodePlugin,
  getActiveEditableNode,
} from '@lblod/ember-rdfa-editor/plugins/_private/editable-node';
import type { TargetOptionGeneratorArgs } from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/types';
import type { TermOption } from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/types';

import AttributeEditor from '@lblod/ember-rdfa-editor/components/_private/attribute-editor';
import NodeControlsCard from '@lblod/ember-rdfa-editor/components/_private/node-controls/card';
import DocImportedResourceEditorCard from '@lblod/ember-rdfa-editor/components/_private/doc-imported-resource-editor/card';
import ImportedResourceLinkerCard from '@lblod/ember-rdfa-editor/components/_private/imported-resource-linker/card';
import ExternalTripleEditorCard from '@lblod/ember-rdfa-editor/components/_private/external-triple-editor/card';
import RelationshipEditorCard from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/card';
import DebugInfo from '@lblod/ember-rdfa-editor/components/_private/debug-info';

import InsertArticleComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/decision-plugin/insert-article';
import StructureControlCardComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/structure-plugin/control-card';
import {
  structureViewWithConfig,
  structureWithConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
import {
  osloLocation,
  osloLocationView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/node';
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import PersonVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/person/insert';
import SnippetInsertRdfaComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-insert-rdfa';
import {
  snippetPlaceholder,
  snippetPlaceholderView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet-placeholder';
import SnippetListSelect from '@lblod/ember-rdfa-editor-lblod-plugins/components/snippet-plugin/snippet-list-select';
import {
  snippet,
  snippetView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin/nodes/snippet';
import {
  mandatee_table,
  mandateeTableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/mandatee-table-plugin/node';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { variableAutofillerPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/plugins/autofiller';
import { saveCollatedImportedResources } from '../../../utils/imported-resources';
import {
  IVGR_TAGS,
  PROPERTY_OBJECTS,
  PROPERTY_PREDICATES,
  RELATIONSHIP_PREDICATES,
  RMW_TAGS,
} from '../../../utils/constants';
import { extractSnippetListUris } from '../../../utils/extract-snippet-lists';
import {
  documentConfig,
  lovConfig,
  combineConfigs,
} from '@lblod/ember-rdfa-editor/components/_private/relationship-editor/configs';
import FormatTextIcon from '@lblod/ember-rdfa-editor/components/icons/format-text';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { ThreeDotsIcon } from '@appuniversum/ember-appuniversum/components/icons/three-dots';
import { sayDataFactory, type SayTerm } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { getContextualActionGroups as locationActionsGroups } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin/contextual-actions';
import { locationModalsPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/location-plugin';
import type Store from 'frontend-reglementaire-bijlage/services/store';
import type CurrentSessionService from 'frontend-reglementaire-bijlage/services/current-session';
import type MuTaskService from 'frontend-reglementaire-bijlage/services/mu-task';
import type EditorSettings from 'frontend-reglementaire-bijlage/services/editor-settings';
import type EditorDocumentModel from 'frontend-reglementaire-bijlage/models/editor-document';
import type { SidebarSettings } from 'frontend-reglementaire-bijlage/services/editor-settings';
import environment from 'frontend-reglementaire-bijlage/config/environment';
import type { ModelFrom } from 'frontend-reglementaire-bijlage/utils/type-utils';
import type SnippetManagementEditSnippetRoute from 'frontend-reglementaire-bijlage/routes/snippet-management/edit/edit-snippet';
import type SnippetVersion from 'frontend-reglementaire-bijlage/models/snippet-version';
import type SnippetList from 'frontend-reglementaire-bijlage/models/snippet-list';

export default class SnippetManagementEditSnippetController extends Controller {
  AttributeEditor = AttributeEditor;
  DebugInfo = DebugInfo;
  NodeControlsCard = NodeControlsCard;
  DocImportedResourceEditorCard = DocImportedResourceEditorCard;
  ImportedResourceLinkerCard = ImportedResourceLinkerCard;
  ExternalTripleEditorCard = ExternalTripleEditorCard;
  RelationshipEditorCard = RelationshipEditorCard;

  InsertArticle = InsertArticleComponent;
  StructureControlCard = StructureControlCardComponent;
  SnippetInsert = SnippetInsertRdfaComponent;
  SnippetListSelect = SnippetListSelect;
  FormatTextIcon = FormatTextIcon;
  PlusIcon = PlusIcon;
  ThreeDotsIcon = ThreeDotsIcon;

  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare currentSession: CurrentSessionService;
  @service declare muTask: MuTaskService;
  @service('editor-settings') declare editorSettingsService: EditorSettings;

  declare model: ModelFrom<SnippetManagementEditSnippetRoute>;

  @tracked editor?: SayController;
  @tracked _editorDocument?: EditorDocumentModel;
  @tracked citationPlugin = citationPlugin(this.config.citation);

  contextualActionGroupGetters = [locationActionsGroups()];

  schema = new Schema({
    nodes: {
      doc: docWithConfig({
        content: 'table_of_contents? document_title? block+',
        rdfaAware: true,
        hasResourceImports: true,
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
      ...tableNodes({ tableGroup: 'block', cellContent: 'block+' }),
      address,
      date: date(this.config.date),
      location,
      oslo_location: osloLocation(this.config.location),
      text_variable,
      person_variable,
      autofilled_variable,
      number,
      codelist,
      codelist_option,
      legacy_codelist,
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
  toggleMenu(menuKey: keyof SidebarSettings, expanded: boolean) {
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

  get config() {
    const relationshipPredicates = RELATIONSHIP_PREDICATES;
    return {
      tableOfContents: [
        {
          nodeHierarchy: [
            'title|chapter|section|subsection|article',
            'structure_header|article_header',
          ],
          scrollContainer: () =>
            document.getElementsByClassName('say-container__main')[0] as HTMLElement,
        },
      ],
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
      structures: {
        uriGenerator: 'template-uuid4' as const,
        fullLengthArticles: true,
        onlyArticleSpecialName: false,
      },
      citation: {
        activeInNodeTypes(schema: Schema) {
          return new Set([schema.nodes['doc'] as NodeType]);
        },
      } satisfies CitationPluginConfig,
      link: {
        interactive: true,
        rdfaAware: true,
      },

      snippet: {
        endpoint: '/raw-sparql',
      },

      location: {
        defaultPointUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/geometrie/',
        defaultPlaceUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/plaats/',
        defaultAddressUriRoot:
          'https://publicatie.gelinkt-notuleren.vlaanderen.be/id/adres/',
        subjectTypesToLinkTo: [BESLUIT('Artikel'), BESLUIT('Besluit')],
        additionalRDFTypes: [
          sayDataFactory.namedNode(
            'https://data.vlaanderen.be/ns/mobiliteit#Zone',
          ),
        ],
      },
      lmb: {
        endpoint: '/vendor-proxy/query',
      },
      mandateeTable: {
        tags: [...IVGR_TAGS, ...RMW_TAGS],
        defaultTag: IVGR_TAGS[0],
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
    return (controller: SayController) => {
      return {
        table_of_contents: tableOfContentsView(this.config.tableOfContents)(
          controller,
        ),
        link: linkView(this.config.link)(controller),
        address: addressView(controller),
        date: dateView(this.config.date)(controller),
        text_variable: textVariableView(controller),
        number: numberView(controller),
        codelist: codelistView(controller),
        legacy_codelist: legacyCodelistView(controller),
        templateComment: templateCommentView(controller),
        person_variable: personVariableView(controller),
        inline_rdfa: inlineRdfaWithConfigView({ rdfaAware: true })(controller),
        block_rdfa: (node: PNode) => new BlockRDFaView(node),
        snippet_placeholder: snippetPlaceholderView(this.config.snippet)(
          controller,
        ),
        location: locationView(controller),
        oslo_location: osloLocationView(this.config.location)(controller),
        snippet: snippetView(this.config.snippet)(controller),
        structure: structureViewWithConfig(this.config.structures)(controller),
        mandatee_table: mandateeTableView(controller),
        autofilled_variable: autofilledVariableView(controller),
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
      locationModalsPlugin(),
    ];
  }

  @action
  handleRdfaEditorInit(editor: SayController) {
    this.editor = editor;
    if (this.editorDocument?.content) {
      editor.initialize(this.editorDocument.content, {
        doNotClean: true,
        startsDirty: false,
      });
    }
  }

  get activeNode() {
    if (this.editor) {
      return getActiveEditableNode(this.editor.activeEditorState);
    }
    return null;
  }

  get codelistEditOptions() {
    return {
      endpoint: '/sparql',
    };
  }
  get dirty() {
    return this.editor?.isDirty;
  }

  currentVersion = trackedFunction(this, async () => {
    return await this.model.snippet.currentVersion;
  });

  get editorDocument() {
    return this.currentVersion.value;
  }

  save = task(async () => {
    if (!this.editor) throw new Error('Controller not initialized');
    const html = this.editor.htmlContent;
    const currentVersion = await this.currentVersion.promise;
    const snippet = this.model.snippet;
    const now = new Date();
    const newVersion = this.store.createRecord('snippet-version', {
      content: html,
      createdOn: now,
      title: currentVersion.title,
      snippet,
    }) as SnippetVersion;
    currentVersion.validThrough = new Date();
    await Promise.all([currentVersion.save(), newVersion.save()]);
    // @ts-expect-error Need to move to proper ED types
    snippet.currentVersion = newVersion;
    snippet.updatedOn = now;
    const snippetListUris = extractSnippetListUris(html);
    const snippetListObjects = await Promise.all(
      snippetListUris.map((uri) => this.store.findByUri('snippet-list', uri)),
    );
    snippet.linkedSnippetLists = snippetListObjects;
    await snippet.save();
    this.editor?.setHtmlContent(html);
    this.editor?.markClean();
    await this.updateImportedResourcesOnList.perform();
  });

  updateImportedResourcesOnList = task(async () => {
    const snippetListId = this.model.snippetList.id;
    if (snippetListId) {
      const list = await this.store.findRecord(
        'snippet-list',
        snippetListId,
        {
          reload: true,
          include: 'snippets,snippets.current-version',
        },
      ) as SnippetList;
      return saveCollatedImportedResources(list);
    }
  });

  get importedDecisionUri() {
    return `http://example.org/imported-decision-${this.model.snippetList.id}`;
  }

  get optionGeneratorConfig() {
    if (this.editor) {
      return combineConfigs(documentConfig(this.editor), lovConfig());
    } else {
      return undefined;
    }
  }

  subjectOptionGeneratorTask = restartableTask(async (args: TargetOptionGeneratorArgs): Promise<TermOption<SayTerm>[]> => {
    await timeout(200);
    const result = (await this.optionGeneratorConfig?.subjects?.(args)) ?? [];
    return result;
  });
  predicateOptionGeneratorTask = restartableTask(async (args: TargetOptionGeneratorArgs) => {
    await timeout(200);
    const result = (await this.optionGeneratorConfig?.predicates?.(args)) ?? [];
    return result;
  });
  objectOptionGeneratorTask = restartableTask(async (args: TargetOptionGeneratorArgs): Promise<TermOption<SayTerm>[]> => {
    await timeout(200);
    const result = (await this.optionGeneratorConfig?.objects?.(args)) ?? [];
    return result;
  });

  optionGeneratorConfigTaskified = {
    subjects: this.subjectOptionGeneratorTask.perform.bind(this),
    predicates: this.predicateOptionGeneratorTask.perform.bind(this),
    objects: this.objectOptionGeneratorTask.perform.bind(this),
  };
}
