import Model, { belongsTo } from '@ember-data/model';

export default class ShapeModel extends Model {
  @belongsTo('resource', { polyMorphic: true }) targetClass;
  @belongsTo('resource', { polyMorphic: true }) targetNode;
  @belongsTo('concept') targetHasConcept;
}
