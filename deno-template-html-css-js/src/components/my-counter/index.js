import html from "./index.html";
// Default and named imports from CSS files are deprecated.
// Use the ?inline query instead.
// For example: import css from './style.css?inline'
import css from "./style.css?inline";

export default class MyCounter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      ${html}
      <style>${css}</style>
    `;
    this.span = this.shadowRoot.querySelector("span");
    this.span.textContent = `count is ${this.count}`;
  }

  get count() {
    return this.getAttribute("count");
  }

  set count(count) {
    if (+count <= 0) {
      count = 0;
      this.shadowRoot.querySelector(".decrement").setAttribute("disabled", "");
    } else {
      this.shadowRoot.querySelector(".decrement").removeAttribute("disabled");
    }
    this.setAttribute("count", count);
    this.span.innerHTML = `count is ${count}`;
  }
}

customElements.define("my-counter", MyCounter);
