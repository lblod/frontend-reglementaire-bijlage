/**
 * Type declarations for
 *    import config from 'mow-registry/config/environment'
 */
declare const config: {
  environment: string;
  modulePrefix: string;
  podModulePrefix: string;
  locationType: 'history' | 'hash' | 'none';
  rootURL: string;
  APP: Record<string, unknown>;
  baseUrl?: string;

  environmentName: string;
  featureFlags: {
    simpleLogin: boolean;
  };

  insertVariablePlugin: { endpoint: string };
  mowRegistryEndpoint: string;
  roadsignImageBaseUrl: string;
};

export default config;
