import Component from '@glimmer/component';
import { getValidity } from 'frontend-reglementaire-bijlage/api/template';
import type Template from 'frontend-reglementaire-bijlage/models/template';
import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import t from 'ember-intl/helpers/t';
import detailedDate from 'frontend-reglementaire-bijlage/helpers/detailed-date';
import { getPromiseState } from 'reactiveweb/get-promise-state';

type Sig = {
  Args: { template?: Template };
};
export class PublicationStatus extends Component<Sig> {
  get validityInfo() {
    if (this.args.template) {
      return getPromiseState(getValidity(this.args.template));
    }
    return undefined;
  }
  <template>
    {{#let this.validityInfo.resolved as |info|}}
      {{#if info.validThrough}}
        <AuTooltip as |tooltip|>
          <AuPill @skin='warning' {{tooltip.target}}>
            {{t 'template-management.retracted'}}
          </AuPill>
          <tooltip.Content>
            {{t 'template-management.publish-date'}}
            {{detailedDate info.created}},
            {{t 'template-management.retracted-on'}}
            {{detailedDate info.validThrough}}
          </tooltip.Content>
        </AuTooltip>
      {{else if info}}
        <AuTooltip as |tooltip|>
          <AuPill @skin='success' {{tooltip.target}}>
            {{t 'template-management.available'}}
          </AuPill>
          <tooltip.Content>
            {{t 'template-management.published-on'}}
            {{detailedDate info.created}}
          </tooltip.Content>
        </AuTooltip>
      {{else}}
        <AuPill>
          {{t 'template-management.not-available'}}
        </AuPill>
      {{/if}}
    {{/let}}
  </template>
}
