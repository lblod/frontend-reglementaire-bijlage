import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  value: validatePresence({ presence: true, ignoreBlank: true }),
};
