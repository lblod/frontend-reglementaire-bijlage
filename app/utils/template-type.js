import { DECISION_STANDARD_FOLDER, RS_STANDARD_FOLDER } from './constants';

/**
 * @param {IntlService} intl - ember intl service to translate the labels correctly
 */
export function getTemplateTypes(intl) {
  return [
    {
      folder: RS_STANDARD_FOLDER,
      label: intl.t('template-management.template-type.regulatory-attachment'),
    },
    {
      folder: DECISION_STANDARD_FOLDER,
      label: intl.t('template-management.template-type.decision'),
    },
  ];
}

/**
 * @param {string} type - uuid for the type of template
 * @param {IntlService} intl - ember intl service to translate the labels correctly
 */
export function getTemplateType(type, intl) {
  return getTemplateTypes(intl).find(({ folder }) => folder === type);
}
