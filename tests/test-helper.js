import Application from 'frontend-reglementaire-bijlage/app';
import environment from 'frontend-reglementaire-bijlage/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

setApplication(Application.create(environment.APP));

setup(QUnit.assert);

start();
