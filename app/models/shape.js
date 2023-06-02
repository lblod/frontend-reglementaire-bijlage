import Model, { belongsTo } from '@ember-data/model';

export default class ShapeModel extends Model {
  @belongsTo('resource', { polyMorphic: true, async: true, inverse: null })
  targetClass;
  @belongsTo('resource', { polyMorphic: true, async: true, inverse: null })
  targetNode;
  @belongsTo('concept', { async: true, inverse: null }) targetHasConcept;
}
