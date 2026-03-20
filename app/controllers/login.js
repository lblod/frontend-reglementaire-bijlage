import Controller from '@ember/controller';
import environment from 'frontend-reglementaire-bijlage/config/environment';
import buildUrlFromConfig from '@lblod/ember-acmidm-login/utils/build-url-from-config';
const providerConfig = environment.torii.providers['acmidm-oauth2'];
export default class LoginController extends Controller {
  loginUrl = buildUrlFromConfig(providerConfig);
}
