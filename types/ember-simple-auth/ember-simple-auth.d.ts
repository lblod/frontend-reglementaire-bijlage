declare module 'ember-simple-auth/services/session' {
  import type Transition from '@ember/routing/transition';
  export default class BaseSessionService {
    handleAuthentication(routeAfterAuthentication: string);
    handleInvalidation(routeAfterInvalidation: string);
    requireAuthentication(transition: Transition, routeName: string);
  }
}
