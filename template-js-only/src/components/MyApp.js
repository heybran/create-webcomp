import webComponentsLogo from "/web-components.svg";
import viteLogo from "/vite.svg";
import "./MyCounter.js";

export default class MyApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="${viteLogo}" class="logo" alt="Vite logo" />
        </a>
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components" target="_blank">
          <img src="${webComponentsLogo}" class="logo vanilla" alt="Web Components logo" />
        </a>
        <h1>Hello Vite & Web Components!</h1>
        <div class="card">
          <my-counter count="0"></my-counter>
        </div>
        <p class="read-the-docs">
          Click on the Vite or Web Components logo to learn more
        </p>
      </div>
      <style>
        a {
          font-weight: 500;
          color: #646cff;
          text-decoration: inherit;
        }

        a:hover {
          color: #535bf2;
        }

        h1 {
          font-size: 3.2em;
          line-height: 1.1;
        }

        .logo {
          height: 6em;
          padding: 1.5em;
          will-change: filter;
          transition: filter 300ms;
        }

        .logo:hover {
          filter: drop-shadow(0 0 2em #646cffaa);
        }

        .logo.vanilla:hover {
          filter: drop-shadow(0 0 2em #f7df1eaa);
        }

        .card {
          padding: 2em;
        }

        .read-the-docs {
          color: #888;
        }

        @media (prefers-color-scheme: light) {
          a:hover {
            color: #747bff;
          }
        }
      </style>
    `;
  }
}

customElements.define("my-app", MyApp);
