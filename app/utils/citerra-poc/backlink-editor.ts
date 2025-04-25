import type {
  PredicateOptionGenerator,
  SubjectOptionGenerator,
  TermOption,
} from '@lblod/ember-rdfa-editor/components/_private/link-rdfa-node-poc/modal';
import {
  ResourceNodeTerm,
  sayDataFactory,
  type SayNamedNode,
} from '@lblod/ember-rdfa-editor/core/say-data-factory';

const predicateOptionGenerator: PredicateOptionGenerator = ({
  searchString = '',
} = {}) => {
  const options: TermOption<SayNamedNode>[] = [
    {
      label: 'Titel',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      term: sayDataFactory.namedNode('eli:title'),
    },
    {
      label: 'Beschrijving',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
      term: sayDataFactory.namedNode('dct:description'),
    },
    {
      label: 'Motivering',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
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

const subjectOptionGenerator: SubjectOptionGenerator = ({
  searchString = '',
} = {}) => {
  const options: TermOption<ResourceNodeTerm>[] = [
    {
      label: '(Besluit) Kennisname van de definitieve verkiezingsuitslag',
      term: sayDataFactory.resourceNode('http://example.org/decisions/1'),
    },
    {
      label: 'Artikel 1',
      term: sayDataFactory.resourceNode('http://example.org/articles/1'),
    },
  ];
  return options.filter(
    (option) =>
      option.label?.toLowerCase().includes(searchString.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchString.toLowerCase()) ||
      option.term.value.toLowerCase().includes(searchString.toLowerCase()),
  );
};

export const BACKLINK_EDITOR_CONFIG = {
  predicateOptionGenerator,
  subjectOptionGenerator,
};
