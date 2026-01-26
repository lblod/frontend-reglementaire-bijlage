import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type Owner from '@ember/owner';
import { on } from '@ember/modifier';
// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import { restartableTask, timeout } from 'ember-concurrency';
import { v4 as uuidv4 } from 'uuid';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { isBlank } from '../utils/strings';
import limitContent from '../helpers/limit-content';
import t from 'ember-intl/helpers/t';

type Sig = {
  Args: {
    title: string;
    readOnly?: boolean;
    editActive?: boolean;
    onSubmit?: (title: string) => void;
    onCancel?: () => void;
  };
};

export default class EditorDocumentTitle extends Component<Sig> {
  @tracked active = false;
  @tracked error = false;
  @tracked _title?: string;

  constructor(owner: Owner, args: Sig['Args']) {
    super(owner, args);
    this.active = !!this.args.editActive;
  }

  get title() {
    if (this._title === undefined || this._title === null) {
      return this.args.title;
    } else {
      return this._title;
    }
  }

  get isTitleModified() {
    if (!this._title) {
      return false;
    }
    return this.args.title !== this._title;
  }

  get isInvalidTitle() {
    // do not allow empty titles
    return isBlank(this.title);
  }

  @action
  setTitle(event: Event) {
    let title =
      event.target && 'value' in event.target
        ? (event.target.value as string)
        : undefined;
    this._title = title;

    if (title) {
      this.error = false;
    }
  }

  @action
  submit(event: Event) {
    event.preventDefault();
    if (this.isInvalidTitle || !this.isTitleModified) {
      this.cancel();
      return;
    }
    this.args.onSubmit?.(this.title);
    this.disableEdit();
    this.showIsSavedTask.perform();
    return false;
  }

  showIsSavedTask = restartableTask(async () => {
    await timeout(3000);
  });

  @action
  cancel() {
    this._title = undefined;
    this.args.onCancel?.();
    this.disableEdit();
  }

  @action
  cancelOnEscape(keyEvent: KeyboardEvent) {
    if (keyEvent.key === 'Escape') {
      this.cancel();
    }
  }

  // We check the value of active in these 2 functions to avoid setting it 2 times in the same computation with
  // the cancel event + submit which cause a bug in prod environments.
  @action
  enableEdit() {
    this.showIsSavedTask.cancelAll();
    if (this.active) {
      return;
    }
    this.active = true;
  }

  @action
  disableEdit() {
    if (!this.active) {
      return;
    }
    this.active = false;
  }

  @action
  focus(element: HTMLElement) {
    element.focus();
  }

  <template>
    {{#if @readOnly}}
      <h1 class='au-c-app-chrome__title' title={{this.title}}>
        {{limitContent this.title 70}}
      </h1>
    {{else}}
      {{#if this.active}}
        <form {{on 'submit' this.submit}} {{on 'focusout' this.submit}}>
          <div class='au-c-app-chrome__title-group'>
            {{#let (uuidv4) as |id|}}
              <input
                class='au-c-app-chrome__title-input
                  {{if this.isInvalidTitle "au-c-input--error"}}'
                placeholder={{t 'editor-document-title.placeholder'}}
                id={{id}}
                type='text'
                value={{this.title}}
                {{on 'input' this.setTitle}}
                {{on 'keydown' this.cancelOnEscape}}
                {{didInsert this.focus}}
              />
            {{/let}}
            <AuButton
              type='submit'
              class='au-c-app-chrome__title-button'
              @skin='secondary'
              @icon='check'
              @hideText={{true}}
              @disabled={{this.isInvalidTitle}}
            >{{t 'editor-document-title.change-title'}}</AuButton>
          </div>
        </form>
      {{else}}
        <h1
          class='au-c-app-chrome__title au-c-app-chrome__title--edit'
          title={{this.title}}
        >
          {{limitContent this.title 70}}
          <AuButton
            {{on 'click' this.enableEdit}}
            @icon='pencil'
            @skin='link'
            @hideText={{true}}
          >{{t 'editor-document-title.change-title'}}</AuButton>
        </h1>
        {{#if this.showIsSavedTask.isRunning}}
          <AuPill @skin='success' @icon='check'>
            {{t 'editor-document-title.title-saved'}}
          </AuPill>
        {{/if}}
      {{/if}}

    {{/if}}
  </template>
}
