import Component from '@glimmer/component';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import type TemplateTag from 'frontend-reglementaire-bijlage/models/template-tag';
import { modifier } from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';

type Args = {
  tags?: TemplateTag[];
};

export default class TemplateTagsComponent extends Component<Args> {
  @tracked visibleCount = this.tags.length;
  @tracked isExpanded = false;

  containerElement: HTMLElement | null = null;
  resizeObserver: ResizeObserver | null = null;

  get tags() {
    return this.args.tags ?? [];
  }

  get visibleTags() {
    return this.isExpanded ? this.tags : this.tags.slice(0, this.visibleCount);
  }

  get hiddenCount() {
    return this.tags.length - this.visibleCount;
  }

  get showMorePill() {
    return !this.isExpanded && this.hiddenCount > 0;
  }

  get sortedTags() {
    return this.tags.map((tag: TemplateTag) => tag.label as string).toSorted();
  }

  containerModifier = modifier((element: HTMLElement) => {
    this.containerElement = element;
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.isExpanded) this.recalculate();
    });
    this.resizeObserver.observe(element);
    this.recalculate();
    return () => {
      this.resizeObserver?.disconnect();
    };
  });

  expand = () => {
    this.isExpanded = true;
  };

  collapse = () => {
    this.isExpanded = false;
    this.recalculate();
  };

  recalculate = () => {
    const container = this.containerElement;
    if (!container) return;

    const measureRow = container.querySelector('[data-measure-row]');
    if (!measureRow) return;

    const availableWidth = container.clientWidth;
    const tagEls = Array.from(
      measureRow.querySelectorAll('[data-measure-tag]'),
    );
    const moreEl = measureRow.querySelector('[data-measure-more]');
    if (!moreEl) return;

    const gap = Number.parseFloat(getComputedStyle(measureRow).columnGap) || 0;

    let total = 0;
    let fitCount = tagEls.length;

    for (let i = 0; i < tagEls.length; i++) {
      const tagWidth = (tagEls[i] as HTMLElement).getBoundingClientRect().width;
      const nextTotal = total + (i > 0 ? gap : 0) + tagWidth;

      const remainingAfterThis = tagEls.length - (i + 1);
      const moreWidth =
        remainingAfterThis > 0 ? gap + moreEl.getBoundingClientRect().width : 0;

      if (nextTotal + moreWidth > availableWidth) {
        fitCount = i;
        break;
      }

      total = nextTotal;
    }

    this.visibleCount = fitCount;
  };

  <template>
    <div
      class='tag-overflow-list
        {{if this.isExpanded "tag-overflow-list--expanded"}}'
      {{this.containerModifier}}
    >
      {{! hidden row used only to measure natural widths }}
      <div
        class='tag-overflow-list__measure'
        data-measure-row
        aria-hidden='true'
      >
        {{#each this.tags as |tag|}}
          <span data-measure-tag>
            <AuPill class='tag-pill'>
              {{tag.label}}
            </AuPill>
          </span>
        {{/each}}
        <span data-measure-more>
          <AuPill class='tag-pill'>
            +{{this.tags.length}}
          </AuPill>
        </span>
      </div>
      <div class='tag-overflow-list__visible'>
        {{#each this.visibleTags as |tag|}}
          <AuPill class='tag-pill'>
            {{tag.label}}
          </AuPill>
        {{/each}}

        {{#if this.showMorePill}}
          <AuPill
            type='button'
            class='tag-pill tag-pill--more'
            {{on 'click' this.expand}}
          >
            +{{this.hiddenCount}}
          </AuPill>
        {{/if}}

        {{#if this.isExpanded}}
          <button
            type='button'
            class='tag-pill--collapse au-u-muted au-u-italic'
            {{on 'click' this.collapse}}
          >
            {{t 'template-management.tags.show-less'}}
          </button>
        {{/if}}
      </div>
    </div>
  </template>
}
