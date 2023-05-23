import css from "./style.css?inline";
import webComponentsLogo from "/web-components.svg";
import viteLogo from "/vite.svg";
import denoLogo from "/deno.svg";
import "../my-counter/index.js";

export default class MyApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <div>
        <a href="https://deno.com/runtime" target="_blank">
          <img src="${denoLogo}" class="logo" alt="Deno logo" />
        </a>
        <a href="https://vitejs.dev" target="_blank">
          <img src="${viteLogo}" class="logo" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components" target="_blank">
          <img src="${webComponentsLogo}" class="logo vanilla" alt="Web Components logo" />
        </a>
        <h1>Hello Deno, Vite & Web Components!</h1>
        <div class="card">
          <my-counter count="0"></my-counter>
        </div>
        <p class="read-the-docs">
          Click on the Deno, Vite or Web Components logo to learn more
        </p>
      </div>
      <style>${css}</style>
    `;
  }
}

customElements.define("my-app", MyApp);
