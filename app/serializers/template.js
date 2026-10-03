import ApplicationSerializer from './application';

export default class TemplateSerializer extends ApplicationSerializer {
  attrs = {
    tags: { serialize: true },
  };
}