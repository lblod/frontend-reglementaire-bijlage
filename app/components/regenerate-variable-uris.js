import Component from '@glimmer/component';
import { action } from '@ember/object';
import { getOutgoingTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import { EXT } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { v4 as uuidv4 } from 'uuid';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';

const VARIABLE_TYPES = [
  'address',
  'date',
  'text_variable',
  'oslo_location',
  'person_variable',
  'autofilled_variable',
  'number',
  'codelist',
];
export default class RegenerateVariableUrisComponent extends Component {
  get controller() {
    return this.args.controller;
  }

  @action
  regenerate() {
    const doc = this.controller.mainEditorState.doc;
    const nodesReversed = [];
    doc.descendants((node, pos) => {
      if (VARIABLE_TYPES.includes(node.type.name)) {
        nodesReversed.unshift({ node, pos });
      }
    });
    for (let { node, pos } of nodesReversed) {
      this.recreateUris(node, pos);
    }
  }
  recreateUris(node, pos) {
    const newAttrs = { ...node.attrs };
    console.log();
    if (newAttrs.subject) {
      newAttrs.subject = `http://data.lblod.info/mappings/--ref-uuid4-${uuidv4()}`;
    }
    const instanceTriple = getOutgoingTriple(newAttrs, EXT('instance'));
    if (instanceTriple) {
      let recreatedUri = `http://data.lblod.info/variables/--ref-uuid4-${uuidv4()}`;
      instanceTriple.object = sayDataFactory.namedNode(recreatedUri);
    }
    this.controller.withTransaction((tr) => {
      tr.setNodeAttribute(pos, 'subject', newAttrs.subject);
      tr.setNodeAttribute(pos, 'properties', newAttrs.properties);
      return tr;
    });
  }
}
