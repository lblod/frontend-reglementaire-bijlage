import { modifier } from 'ember-modifier';

export default modifier(function autoFocus(element: HTMLElement) {
  element.focus();
});
