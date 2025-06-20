// eslint-disable-next-line ember/no-at-ember-render-modifiers
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { firefoxCursorFix } from '@lblod/ember-rdfa-editor/plugins/firefox-cursor-fix';
import { lastKeyPressedPlugin } from '@lblod/ember-rdfa-editor/plugins/last-key-pressed';
import recreateUuidsOnPaste from '@lblod/ember-rdfa-editor/plugins/recreateUuidsOnPaste';
import { chromeHacksPlugin } from '@lblod/ember-rdfa-editor/plugins/chrome-hacks-plugin';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
import type {
  ProsePlugin,
  SayController,
  Schema,
} from '@lblod/ember-rdfa-editor';
import type EditorDocumentModel from '../models/editor-document';
import { getOwner } from '@ember/owner';
import { unwrap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

import AuBodyContainer from '@appuniversum/ember-appuniversum/components/au-body-container';
import AuHelpText from '@appuniversum/ember-appuniversum/components/au-help-text';
import EditorContainer from '@lblod/ember-rdfa-editor/components/editor-container';
import Editor, {
  type RdfaEditorArgs,
} from '@lblod/ember-rdfa-editor/components/editor';
import { htmlSafe } from '@ember/template';
import t from 'ember-intl/helpers/t';
import { hash } from '@ember/helper';

type Signature = {
  Args: {
    editorDocument?: EditorDocumentModel;
    prefix?: string;
    property?: string;
    plugins?: ProsePlugin[];
    rdfaEditorInit?: (controller: SayController) => unknown;
    busy?: boolean;
    busyText?: string;
    schema: Schema;
    nodeViews?: RdfaEditorArgs['nodeViews'];
  };
  Blocks: {
    toolbar: [{ controller: SayController }];
    sidebarRight: [{ controller: SayController }];
  };
};
export default class RdfaEditorContainerComponent extends Component<Signature> {
  @tracked editor?: SayController;
  @tracked ready = false;

  get documentContext() {
    if (this.args.editorDocument && this.args.editorDocument.context) {
      try {
        return JSON.parse(this.args.editorDocument.context);
      } catch (e) {
        console.warn(
          'Error encountered during parsing of document context. ' +
            'Reverting to default context.',
          e,
        );
      }
    }
    return {
      prefix: this.args.prefix ?? '',
      typeof: '',
      vocab: '',
    };
  }

  get plugins() {
    const plugins = this.args.plugins || [];
    return plugins.concat(
      firefoxCursorFix(),
      lastKeyPressedPlugin,
      chromeHacksPlugin(),
      recreateUuidsOnPaste,
      emberApplication({ application: unwrap(getOwner(this)) }),
    );
  }

  get vocab() {
    return this.documentContext['vocab'];
  }

  /**
   * this is a workaround because emberjs does not allow us to assign the prefix attribute in the template
   * see https://github.com/emberjs/ember.js/issues/19369
   */
  @action
  setPrefix(element: HTMLElement) {
    element.setAttribute(
      'prefix',
      this.prefixToAttrString(this.documentContext.prefix),
    );
    this.ready = true;
  }

  @action
  rdfaEditorInit(editor: SayController) {
    if (this.args.rdfaEditorInit) {
      this.args.rdfaEditorInit(editor);
    }
    this.editor = editor;
  }

  prefixToAttrString(prefix: Record<string, string>) {
    let attrString = '';
    Object.keys(prefix).forEach((key) => {
      let uri = prefix[key];
      attrString += `${key}: ${uri} `;
    });
    return attrString;
  }

  get htmlSafeContent() {
    return htmlSafe(this.editor?.htmlContent ?? '');
  }

  <template>
    {{#if @busy}}
      <AuBodyContainer>
        <div class='au-c-rdfa-editor'>
          <div
            class='say-container say-container--sidebar-left say-container--paper say-container--sidebar-right'
          >
            <div class='say-container__main'>
              <div class='say-editor'>
                <div class='say-editor__paper'>
                  <div class='au-c-scanner'>
                    <div class='au-c-scanner__text'>
                      <AuHelpText @size='large'>{{if
                          @busyText
                          @busyText
                          (t 'rdfaEditorContainer.defaultBusyText')
                        }}
                      </AuHelpText>
                    </div>
                    <span class='au-c-scanner__bar'></span>
                  </div>
                  <div class='say-editor__inner say-content'>
                    {{this.htmlSafeContent}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuBodyContainer>
    {{else}}
      <AuBodyContainer
        vocab='{{this.vocab}}'
        {{didInsert this.setPrefix}}
        property='{{@property}}'
        resource='#'
      >
        {{#if this.ready}}
          <EditorContainer
            @controller={{this.editor}}
            @editorOptions={{hash showPaper=true showToolbarBottom=false}}
          >
            <:toolbar as |container|>
              {{yield (hash controller=container.controller) to='toolbar'}}
            </:toolbar>
            <:default>
              <Editor
                @plugins={{this.plugins}}
                @schema={{@schema}}
                @nodeViews={{@nodeViews}}
                @rdfaEditorInit={{this.rdfaEditorInit}}
              />
            </:default>
            <:sidebarRight as |container|>
              {{yield (hash controller=container.controller) to='sidebarRight'}}
            </:sidebarRight>
          </EditorContainer>
        {{/if}}
      </AuBodyContainer>
    {{/if}}
  </template>
}
