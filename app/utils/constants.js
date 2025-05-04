//codelist types
export const COD_CONCEPT_SCHEME_ID = 'F452BCB4-4CE7-4318-8E00-5A96E7FED207';
export const RS_STANDARD_FOLDER = '7A4CA4A9-D7A4-4A99-B2FB-39B6D535FC1D';
export const RS_DELETED_FOLDER = '52331F9C-6CF6-403F-94A0-EDC1BF0633AD';
export const DECISION_STANDARD_FOLDER = '8460981D-CB21-4710-B7B5-9DD2DFD11888';

export const IVGR_TAGS = /** @type {const} */ ([
  'IVGR2-LMB-1-geloofsbrieven',
  'IVGR3-LMB-1-eedafleggingen',
  'IVGR4-LMB-1-rangorde-gemeenteraadsleden',
  'IVGR5-LMB-1-splitsing-fracties',
  'IVGR5-LMB-2-grootte-fracties',
  'IVGR5-LMB-3-samenstelling-fracties',
  'IVGR7-LMB-1-kandidaat-schepenen',
  'IVGR7-LMB-2-ontvankelijkheid-schepenen',
  'IVGR7-LMB-3-verhindering-schepenen',
  'IVGR8-LMB-1-verkozen-schepenen',
  'IVGR8-LMB-2-coalitie',
]);

export const RMW_TAGS = /** @type {const} */ ([
  'IVRMW2-LMB-1-zetelverdeling',
  'IVRMW2-LMB-2-kandidaat-leden',
  'IVRMW2-LBM-3-verkiezing-leden',
  'IVRMW2-LBM-4-geloofsbrieven-leden',
  'IVRMW2-LBM-5-eed-leden',
]);

export const JOB_STATUSES = {
  scheduled: 'http://redpencil.data.gift/id/concept/JobStatus/scheduled',
  busy: 'http://redpencil.data.gift/id/concept/JobStatus/busy',
  success: 'http://redpencil.data.gift/id/concept/JobStatus/success',
  failed: 'http://redpencil.data.gift/id/concept/JobStatus/failed',
  canceled: 'http://redpencil.data.gift/id/concept/JobStatus/canceled',
};

export const RELATIONSHIP_PREDICATES = [
  'https://say.data.gift/ns/body',
  'https://say.data.gift/ns/hasPart',
  'http://data.europa.eu/eli/ontology#title',
  'http://data.europa.eu/eli/ontology#description',
  'http://data.vlaanderen.be/ns/besluit#motivering',
  'http://data.europa.eu/eli/ontology#has_part',
  'http://mu.semte.ch/vocabularies/ext/title',
  'http://www.w3.org/2004/02/skos/core#label',
  'http://data.europa.eu/m8g/hasSupportingEvidence',
  'http://data.europa.eu/m8g/isRequirementOf',
];
export const PROPERTY_PREDICATES = [
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  'http://www.w3.org/ns/prov#value',
  'http://www.w3.org/2004/02/skos/core#prefLabel',
  'https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#operatie',
  ...RELATIONSHIP_PREDICATES,
];
export const PROPERTY_OBJECTS = [
  'http://data.europa.eu/m8g/Requirement',
  'http://mu.semte.ch/vocabularies/ext/Doelgroep',
  'http://purl.org/vocab/cpsv#PublicService',
  'https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#Voorwaardecollectie',
  'https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#EN-operatie',
  'https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#OF-operatie',
  'https://data.vlaanderen.be/ns/mobiliteit#Zone',
];
