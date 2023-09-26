import { modifier } from 'ember-modifier';
import Yasgui from '@triply/yasgui';

export default modifier(
  function yasgui(element /*, params, hash*/) {
    const config = {
      /**
       * Change the default request configuration, such as the headers
       * and default yasgui endpoint.
       * Define these fields as plain values, or as a getter function
       */
      requestConfig: {
        endpoint: '/sparql',
        method: 'POST',
      },
      // Allow resizing of the Yasqe editor
      resizeable: false,

      // Whether to autofocus on Yasqe on page load
      autofocus: true,

      // Use the default endpoint when a new tab is opened
      copyEndpointOnNewTab: true,
    };

    new Yasgui(element, config);
  },
  { eager: false },
);
