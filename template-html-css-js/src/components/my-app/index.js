import html from "./index.html";
import css from "./style.css?inline";
import webComponentsLogo from "/web-components.svg";
import viteLogo from "/vite.svg";
import "../my-counter/index.js";

export default class MyApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      ${html}
      <style>${css}</style>
    `;
    this.shadowRoot.querySelector("img.vite").src = viteLogo;
    this.shadowRoot.querySelector("img.web-components").src = webComponentsLogo;
  }
}

customElements.define("my-app", MyApp);
