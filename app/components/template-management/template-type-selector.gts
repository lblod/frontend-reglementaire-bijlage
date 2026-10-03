import Component from '@glimmer/component';
import PowerSelect from 'ember-power-select/components/power-select';
import { type TemplateType, getTemplateTypes } from 'frontend-reglementaire-bijlage/utils/template-type';
import type IntlService from 'ember-intl/services/intl';
import { service } from '@ember/service';
import { localCopy } from 'tracked-toolbox';

type Args = {
  selected: TemplateType;
  onChange: (templateType: TemplateType) => void;
};

export default class TemplateTypeSelector extends Component<Args> {
  @service declare intl: IntlService;
  @localCopy('args.selected') selectedType: TemplateType | null = null;

  get templateTypes(): TemplateType[] {
    return getTemplateTypes(this.intl);
  }

  <template>
    <PowerSelect
      id='template-type'
      @allowClear={{false}}
      @searchEnabled={{false}}
      @options={{this.templateTypes}}
      @selected={{this.selectedType}}
      @onChange={{@onChange}}
      as |templateType|
    >
      {{templateType.label}}
    </PowerSelect>
  </template>
}
