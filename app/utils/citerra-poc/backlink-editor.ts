import type { PNode, SayController } from '@lblod/ember-rdfa-editor';
import { BESLUIT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';
import type {
  PredicateOptionGenerator,
  SubjectOptionGenerator,
  TermOption,
} from '@lblod/ember-rdfa-editor/components/_private/link-rdfa-node-poc/modal';
import {
  isRdfaAttrs,
  type RdfaResourceAttrs,
} from '@lblod/ember-rdfa-editor/core/rdfa-types';
import {
  ResourceNodeTerm,
  sayDataFactory,
  type SayNamedNode,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { rdfaInfoPluginKey } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';
import { RDF } from '../namespaces';
import type { Resource } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import limitContent from '../../helpers/limit-content';

const predicateOptionGenerator: PredicateOptionGenerator = ({
  searchString = '',
} = {}) => {
  const options: TermOption<SayNamedNode>[] = [
    {
      label: 'Is titel van',
      term: sayDataFactory.namedNode('eli:title'),
    },
    {
      label: 'Is beschrijving van',
      term: sayDataFactory.namedNode('dct:description'),
    },
    {
      label: 'Is motivering van',
      term: sayDataFactory.namedNode('besluit:motivering'),
    },
  ];
  return options.filter(
    (option) =>
      option.label?.toLowerCase().includes(searchString.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchString.toLowerCase()) ||
      option.term.value.toLowerCase().includes(searchString.toLowerCase()),
  );
};

const hasRdfType = (attrs: RdfaResourceAttrs, type: Resource) => {
  const rdfTypes = attrs.properties
    .filter((property) => RDF('type').matches(property.predicate))
    .map((prop) => prop.object);
  return rdfTypes.some((rdfType) => type.matches(rdfType.value));
};
type SubjectOptionMatcher = (
  node: PNode,
) => TermOption<ResourceNodeTerm> | undefined;

const SUBJECT_OPTION_MATCHERS: SubjectOptionMatcher[] = [
  (node) => {
    if (
      !isRdfaAttrs(node.attrs) ||
      !('subject' in node.attrs) ||
      !hasRdfType(node.attrs, BESLUIT('Besluit'))
    ) {
      return;
    }
    return {
      label: 'Besluit',
      description: limitContent(node.textContent, 50),
      term: sayDataFactory.resourceNode(node.attrs.subject),
    };
  },
  (node) => {
    if (
      !isRdfaAttrs(node.attrs) ||
      !('subject' in node.attrs) ||
      !hasRdfType(node.attrs, BESLUIT('Artikel'))
    ) {
      return;
    }
    const number = (node.attrs as unknown as Record<string, unknown>)[
      'number'
    ] as number;
    return {
      label: `Artikel ${number}`,
      description: limitContent(node.textContent, 50),
      term: sayDataFactory.resourceNode(node.attrs.subject),
    };
  },
];

const subjectOptionGenerator = (
  controller: SayController,
): SubjectOptionGenerator => {
  return ({ searchString = '' } = {}) => {
    const subjectMapping = rdfaInfoPluginKey.getState(
      controller.mainEditorState,
    )?.subjectMapping;
    if (!subjectMapping) {
      return [];
    }
    const options: TermOption<ResourceNodeTerm>[] = [];
    for (const [_subject, nodes] of subjectMapping.entries()) {
      const node = unwrap(nodes[0]).value;
      let option: TermOption<ResourceNodeTerm> | undefined;
      for (const optionMatcher of SUBJECT_OPTION_MATCHERS) {
        const match = optionMatcher(node);
        if (match) {
          option = match;
          break;
        }
      }
      if (option) {
        options.push(option);
      }
    }
    return options.filter(
      (option) =>
        option.label?.toLowerCase().includes(searchString.toLowerCase()) ||
        option.description
          ?.toLowerCase()
          .includes(searchString.toLowerCase()) ||
        option.term.value.toLowerCase().includes(searchString.toLowerCase()),
    );
  };
};

export const BACKLINK_EDITOR_CONFIG = {
  predicateOptionGenerator,
  subjectOptionGenerator,
};
