import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class TemplateFetcher extends Service {
  @service session;
  @service store;

  @tracked account;
  @tracked user;
  @tracked group;
  @tracked roles = [];

  fetchByUri = async ({ uri, endpoint }) => {
    const fileEndpoint = `${endpoint}/files`;
    const sparqlEndpoint = `${endpoint}/sparql`;

    const sparqlQuery = `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX schema: <http://schema.org/>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      SELECT
        ?template_version
        ?title
        ?fileId
        (GROUP_CONCAT(?context;SEPARATOR="|") as ?contexts)
        (GROUP_CONCAT(?disabledInContext;SEPARATOR="|") as ?disabledInContexts)
      WHERE {
        <${uri}> mu:uuid ?uuid;
          pav:hasCurrentVersion ?template_version.
        ?template_version mu:uuid ?fileId;
                          dct:title ?title.
        OPTIONAL {
          ?template_version schema:validThrough ?validThrough.
        }
        OPTIONAL {
          ?template_version ext:context ?context.
        }
        OPTIONAL {
          ?template_version ext:disabledInContext ?disabledInContext.
        }
        FILTER( ! BOUND(?validThrough) || ?validThrough > NOW())
      }
      GROUP BY ?template_version ?title ?fileId
      ORDER BY LCASE(REPLACE(STR(?title), '^ +| +$', ''))
    `;

    const response = await this.sendQuery(sparqlEndpoint, sparqlQuery);
    if (response.status === 200) {
      const json = await response.json();
      const bindings = json.results.bindings;
      const templates = bindings.map(this.bindingToTemplate(fileEndpoint));
      return templates[0];
    } else {
      return null;
    }
  };

  fetch = task(async ({ endpoint, name, type }) => {
    const fileEndpoint = `${endpoint}/files`;
    const sparqlEndpoint = `${endpoint}/sparql`;
    const sparqlQuery = `
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      PREFIX pav: <http://purl.org/pav/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX schema: <http://schema.org/>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      SELECT DISTINCT
        ?template
        ?template_version
        ?title
        ?fileId
        ?type
        (GROUP_CONCAT(?context;SEPARATOR="|") as ?contexts)
        (GROUP_CONCAT(?disabledInContext;SEPARATOR="|") as ?disabledInContexts)
      WHERE {
        VALUES ?type {
${
  type
    ? `<${type}>`
    : `
          <http://data.lblod.info/vocabularies/gelinktnotuleren/ReglementaireBijlageTemplate>
          <http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt>
    `
}
}
        ?template a ?type;
          mu:uuid ?uuid;
          pav:hasCurrentVersion ?template_version.
          ?template_version dct:title ?title.
          ${name ? `FILTER (CONTAINS(?title,"${name}"))` : ''}
          ?template_version mu:uuid ?fileId.
        OPTIONAL {
          ?template_version schema:validThrough ?validThrough.
        }
        OPTIONAL {
          ?template_version ext:context ?context.
        }
        OPTIONAL {
          ?template_version ext:disabledInContext ?disabledInContext.
        }
        FILTER( ! BOUND(?validThrough) || ?validThrough > NOW())
      }
      GROUP BY ?template ?template_version ?title ?fileId ?type
      ORDER BY LCASE(REPLACE(STR(?title), '^ +| +$', ''))
    `;
    const response = await this.sendQuery(sparqlEndpoint, sparqlQuery);
    if (response.status === 200) {
      const json = await response.json();
      const bindings = json.results.bindings;
      const templates = bindings.map(this.bindingToTemplate(fileEndpoint));
      return templates;
    } else {
      return [];
    }
  });

  /**
   * @param {string} sparqlQuery
   * @returns {string}
   */
  queryToFormBody(sparqlQuery) {
    const details = {
      query: sparqlQuery,
      format: 'application/json',
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    return formBody;
  }
  bindingToTemplate(fileEndpoint) {
    return (binding) => {
      let type;
      if (
        binding.type?.value ===
        'http://data.lblod.info/vocabularies/gelinktnotuleren/ReglementaireBijlageTemplate'
      )
        type = 'Reglementaire Bijlage';
      else if (
        binding.type?.value ===
        'http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt'
      )
        type = 'Behandeling van Agendapunt';
      else type = binding.type?.value;
      return {
        title: binding.title?.value,
        type,
        uri: binding.template?.value,
        loadBody: async function () {
          const response = await fetch(
            `${fileEndpoint}/${binding.fileId.value}/download`,
          );
          this.body = await response.text();
        },
        contexts: binding.contexts.value
          ? binding.contexts.value.split('|')
          : [],
        disabledInContexts: binding.disabledInContexts.value
          ? binding.disabledInContexts.value.split('|')
          : [],
      };
    };
  }
  /**
   * @param {string} endpoint
   * @param {string} sparqlQuery
   * @returns {Promise<Response>}
   */
  async sendQuery(endpoint, sparqlQuery) {
    const formBody = this.queryToFormBody(sparqlQuery);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody,
    });
    return response;
  }
}
