import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Features from 'ember-feature-flags';
import { and, not } from 'ember-truth-helpers';
import perform from 'ember-concurrency/helpers/perform';
import AuToolbar from '@appuniversum/ember-appuniversum/components/au-toolbar';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import { getTemplateType } from '../utils/template-type';
import EditorDocumentModel from '../models/editor-document';
import SnippetVersionModel from '../models/snippet-version';
import type CurrentSessionService from '../services/current-session';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import t from 'ember-intl/helpers/t';
import humanFriendlyDate from '../helpers/human-friendly-date';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import EditorDocumentTitle from './editor-document-title';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';

export interface PublishSaveAction {
  isRunning: boolean;
  action: () => Promise<void>;
}
export interface AppChromeComponentSignature {
  Args: {
    document: EditorDocumentModel | SnippetVersionModel;
    onUpdateDocumentTitle: () => Promise<void>;
    readOnly?: boolean;
    templateTypeId?: string;
    dirty?: boolean;
    save?: PublishSaveAction;
    publish?: PublishSaveAction;
  };
  Blocks: {
    leadingButtons: [];
  };
}

export default class AppChromeComponent extends Component<AppChromeComponentSignature> {
  @service declare currentSession: CurrentSessionService;
  @service declare features: Features;
  @service declare intl: IntlService;
  @service declare router: RouterService;

  get document() {
    return this.args.document;
  }

  get updatedOn() {
    if (this.document instanceof EditorDocumentModel) {
      return this.document.updatedOn;
    } else if (this.document instanceof SnippetVersionModel) {
      return this.document.createdOn;
    } else {
      return null;
    }
  }

  templateTypeLabel =
    this.args.templateTypeId &&
    // @ts-expect-error This is used before the constructor runs so should fail...
    getTemplateType(this.args.templateTypeId, this.intl)?.label;

  updateDocumentTitle = task(async (title) => {
    this.document.title = title;
    this.document.set('updatedOn', new Date());
    await this.document.save();

    if (this.args.onUpdateDocumentTitle) {
      await this.args.onUpdateDocumentTitle();
    }
  });

  resetDocument = task(async () => {
    this.document.rollbackAttributes();
  });

  <template>
    <nav>
      <div class='au-c-app-chrome'>
        <AuToolbar @size='small' class='au-u-padding-bottom-none' as |Group|>
          <Group>
            <span
              class='au-c-app-chrome__entity'
            >{{this.currentSession.group.classificatie.label}}
              {{this.currentSession.group.naam}}</span>
          </Group>
          <Group>
            <ul class='au-c-list-horizontal au-u-padding-right-tiny'>
              {{#unless @document.isNew}}
                {{#if (and this.updatedOn (not @dirty))}}
                  <li class='au-c-list-horizontal__item'>
                    <span class='au-c-app-chrome__status'>
                      {{t 'utility.saved-on'}}
                      {{humanFriendlyDate
                        this.updatedOn
                        locale=this.intl.primaryLocale
                      }}
                    </span>
                  </li>
                {{else}}
                  <li class='au-c-list-horizontal__item'>
                    <span class='au-c-app-chrome__status'>
                      <AuIcon @icon='alert-triangle' @alignment='left' />
                      {{t 'utility.unsaved-changes'}}
                    </span>
                  </li>
                {{/if}}
              {{/unless}}
            </ul>
          </Group>
        </AuToolbar>
        <AuToolbar @size='small' class='au-u-padding-top-none' as |Group|>
          <Group>
            {{#if @document.isNew}}
              <AuPill @skin='warning'>
                <AuIcon @icon='alert-triangle' @alignment='left' />
                {{t 'utility.unsaved-concept'}}
              </AuPill>
            {{/if}}
            <EditorDocumentTitle
              @title={{@document.title}}
              @editActive={{@document.isNew}}
              @onSubmit={{perform this.updateDocumentTitle}}
              @onCancel={{perform this.resetDocument}}
              @readOnly={{@readOnly}}
            />
            {{#if this.templateTypeLabel}}
              <AuPill>{{this.templateTypeLabel}}</AuPill>
            {{/if}}
          </Group>
          <Group>
            {{yield to='leadingButtons'}}
            {{#if @save}}
              <AuButton
                {{on 'click' @save.action}}
                @disabled={{@save.isRunning}}
              >{{t 'utility.save'}}</AuButton>
            {{/if}}
            {{#if @publish}}
              <AuButton
                {{on 'click' @publish.action}}
                @disabled={{@publish.isRunning}}
              >{{t 'utility.save-and-publish'}}
              </AuButton>
            {{/if}}
          </Group>
        </AuToolbar>
      </div>
    </nav>
  </template>
}
