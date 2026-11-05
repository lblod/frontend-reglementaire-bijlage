import AuTooltip from '@appuniversum/ember-appuniversum/components/au-tooltip';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import t from 'ember-intl/helpers/t';
import detailedDate from 'frontend-reglementaire-bijlage/helpers/detailed-date';
import type { TOC } from '@ember/component/template-only';

type Sig = {
  Args: {
    validity?: { created: Date; validThrough?: Date };
    unpublish?: () => void;
  };
};
export const PublicationStatus: TOC<Sig> = <template>
  {{#let @validity as |info|}}
    {{#if info.validThrough}}
      <AuTooltip as |tooltip|>
        <AuPill @icon='hide' @skin='warning' {{tooltip.target}}>
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
        <AuPill
          @icon='eye'
          @onClickAction={{@unpublish}}
          @actionIcon='cross'
          @actionText={{t 'template-edit.unpublish'}}
          @skin='success'
          {{tooltip.target}}
        >
          {{t 'template-management.available'}}
        </AuPill>
        <tooltip.Content>
          {{t 'template-management.published-on'}}
          {{detailedDate info.created}}
        </tooltip.Content>
      </AuTooltip>
    {{else}}
      <AuPill @icon='hide'>
        {{t 'template-management.not-published'}}
      </AuPill>
    {{/if}}
  {{/let}}
</template>;
