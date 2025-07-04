import Service from '@ember/service';
import { tracked } from 'tracked-built-ins';
import {
  loadFromLocalStorage,
  updateLocalStorage,
} from '../utils/local-storage';

import merge from 'lodash.mergewith';

type MenuState = {
  expanded: boolean;
};
export type SidebarSettings = {
  general: MenuState;
  decision: MenuState;
  citerra: MenuState;
  regulatoryStatement: MenuState;
  rdfaVisualizer: MenuState;
  nodeControls: MenuState;
  relationshipEditor: MenuState;
  docImportedResourceEditor: MenuState;
  importedResourceLinker: MenuState;
  externalTripleEditor: MenuState;
  attributeEditor: MenuState;
  debugInfo: MenuState;
};

const DEFAULT_EDITOR_SETTINGS: SidebarSettings = {
  general: {
    expanded: false,
  },
  decision: {
    expanded: false,
  },
  citerra: {
    expanded: false,
  },
  regulatoryStatement: {
    expanded: false,
  },
  rdfaVisualizer: {
    expanded: false,
  },
  nodeControls: {
    expanded: false,
  },
  relationshipEditor: {
    expanded: false,
  },
  docImportedResourceEditor: {
    expanded: false,
  },
  importedResourceLinker: {
    expanded: false,
  },
  externalTripleEditor: {
    expanded: false,
  },
  attributeEditor: {
    expanded: false,
  },
  debugInfo: {
    expanded: false,
  },
};

const SIDEBAR_SETTINGS_KEY = 'RB_EDITOR_SIDEBAR_SETTINGS';

export default class EditorSettingsService extends Service {
  @tracked _sidebarSettings: SidebarSettings;

  constructor() {
    super();
    try {
      this._sidebarSettings = merge(
        DEFAULT_EDITOR_SETTINGS,
        loadFromLocalStorage<SidebarSettings>(SIDEBAR_SETTINGS_KEY),
      );
    } catch (e) {
      console.error(e);
      this._sidebarSettings = DEFAULT_EDITOR_SETTINGS;
    }
  }

  get sidebarSettings() {
    return window.structuredClone(this._sidebarSettings);
  }

  set sidebarSettings(settings: SidebarSettings) {
    this._sidebarSettings = settings;
    updateLocalStorage(SIDEBAR_SETTINGS_KEY, settings);
  }
}
