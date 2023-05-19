# create-webcomp

This package allows you to quickly scaffold a new web components project powered by Vite.

## Scaffolding Your First Web Components Project

With NPM:

```bash
npm create webcomp@latest
```

With PNPM:

```bash
pnpm create webcomp
```

Then follow the prompts. You can use `.` for the project name to scaffold in the current directory.

## Available Web Components Structure/Templates

1. Standalone JavaScript

```
└── components
    ├── MyApp.js
    └── MyCounter.js
```

2. CSS + JavaScript

```
└── components
    ├── my-app
    │   ├── index.js
    │   └── style.css
    └── my-counter
        ├── index.js
        └── style.css
```

3. HTML + CSS + JavaScript

```
└── components
    ├── my-app
    │   ├── index.html
    │   ├── index.js
    │   └── style.css
    └── my-counter
        ├── index.html
        ├── index.js
        └── style.css
```
