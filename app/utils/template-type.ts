import type IntlService from 'ember-intl/services/intl';
import { DECISION_STANDARD_FOLDER, RS_STANDARD_FOLDER } from './constants';

/**
 * @param intl - ember intl service to translate the labels correctly
 */
export function getTemplateTypes(intl: IntlService) {
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
 * @param type - uuid for the type of template
 * @param intl - ember intl service to translate the labels correctly
 */
export function getTemplateType(type: string, intl: IntlService) {
  return getTemplateTypes(intl).find(({ folder }) => folder === type);
}
