import Model, { belongsTo } from '@ember-data/model';

export default class ShapeModel extends Model {
  @belongsTo('resource', { polyMorphic: true, async: true }) targetClass;
  @belongsTo('resource', { polyMorphic: true, async: true }) targetNode;
  @belongsTo('concept', { async: true }) targetHasConcept;
}
