import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class Template extends Model {
  @belongsTo('template-version', { inverse: null, async: true })
  currentVersion;
  @belongsTo('document-container', {
    inverse: 'template',
    async: true,
    as: 'template',
  })
  derivedFrom;
  @belongsTo('administrative-unit', { inverse: null, async: true }) publisher;
  @hasMany('template-version', { inverse: null, async: true }) versions;
  @hasMany('template-tag', { inverse: 'template', async: true }) tags;
}
