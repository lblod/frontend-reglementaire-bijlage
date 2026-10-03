import { service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import ENV from 'frontend-reglementaire-bijlage/config/environment';
import type CurrentSessionService from './current-session';
export default class SessionService extends BaseSessionService {
  @service declare currentSession: CurrentSessionService;

  handleAuthentication(routeAfterAuthentication: string) {
    super.handleAuthentication(routeAfterAuthentication);
    void this.currentSession.load();
  }

  handleInvalidation() {
    const logoutUrl = ENV['torii']['providers']['acmidm-oauth2']['logoutUrl'];
    super.handleInvalidation(logoutUrl);
  }
}
