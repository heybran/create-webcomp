// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import { bold, cyan, grey, yellow } from "kleur/colors";

import {
  formatTargetDir,
  getProjectName,
  isEmpty,
  emptyDir,
  copy,
  isValidPackageName,
  toValidPackageName,
  pkgFromUserAgent,
} from "./util.js";

const spinner = p.spinner();

/**
 * @typeof {Object} WebComponentsTemplate
 * @property {string} name
 * @property {string} title
 * @property {string} description
 */

/** @type {string} */
const cwd = process.cwd();

/** @type Array<WebComponentsTemplate> **/
const TEMPLATES = [
  {
    name: "js-only",
    title: `Standalone JavaScript`,
    description: "e.g., ./components/MyCouter.js",
  },
  {
    name: "css-js",
    title: "CSS + JavaScript",
    description: "e.g., ./components/my-counter/style.css+index.js",
  },
  {
    name: "html-css-js",
    title: "HTML + CSS + JavaScript",
    description: "e.g., ./components/my-counter/index.html+style.css+index.js",
  },
];

const { /** @type {string} */ version } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
);

// 1) Show welcome message
console.log(`${grey(`create-webcomp version ${version}`)}`);
p.intro(`Okies, let's get you started with a shiny web components project.`);

/** @type {string} **/
let targetDir = process.argv[2] || ".";

// 2) Get target directory
if (targetDir === ".") {
  const dir = await p.text({
    message: "Where should we create your project?",
    placeholder: "  (hit Enter to use current directory)",
  });

  // The isCancel function is a guard that detects when a user cancels a question with CTRL + C.
  // You should handle this situation for each prompt,
  // optionally providing a nice cancellation message with the cancel utility.
  if (p.isCancel(dir)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  if (dir) {
    targetDir = dir;
  }
}

targetDir = formatTargetDir(targetDir);

// 3) Check if target directory is empty
if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
  const dir = await p.confirm({
    message:
      (targetDir === "."
        ? "Current directory"
        : `Target directory "${targetDir}"`) +
      " is not empty. Remove existing files and continue?",
    initialValue: false,
  });

  if (dir !== true) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  emptyDir(path.join(cwd, targetDir));
} else {
  fs.mkdirSync(path.join(cwd, targetDir), { recursive: true });
}

// 4) Choose a web components template
const options = await p.group(
  {
    template: () => {
      return p.select({
        message: "Which web components template?",
        options: TEMPLATES.map((template) => {
          return {
            label: template.title,
            hint: template.description,
            value: template.name,
          };
        }),
      });
    },
  },
  {
    onCancel: () => {
      p.cancel("Operation cancelled.");
      process.exit(0);
    },
  },
);

/** @type {string} */
const projectName = getProjectName(targetDir);

const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
const pkgManager = pkgInfo ? pkgInfo.name : "npm";

spinner.start(`Scaffolding your web components project`);

// 5) Copy template folder into target directory
const templateDir = path.resolve(
  fileURLToPath(import.meta.url),
  "../..",
  `template-${options.template}`,
);

/**
 * Writes content to a file, or copies a file from a template directory to a target directory.
 * @param {string} file - The name of the file to write or copy.
 * @param {string} [content] - The content to write to the file. If not provided, the file will be copied from a template directory.
 * @returns {void}
 */
const write = (file, content) => {
  const targetPath = path.join(cwd, targetDir, file);
  if (content) {
    fs.writeFileSync(targetPath, content);
  } else {
    copy(path.join(templateDir, file), targetPath);
  }
};

// template files that we need to copy over target directory.
const files = fs.readdirSync(templateDir);
for (const file of files.filter(
  (f) =>
    !["package.json", "pnpm-lock.yaml", "dist", "node_modules"].includes(f),
)) {
  write(file);
}

// 6) Rename _template_gitignore to .gitignore
const _template_gitignore = path.join(
  fileURLToPath(import.meta.url),
  "../..",
  `_template_gitignore`,
);

write(".gitignore", fs.readFileSync(_template_gitignore, "utf-8"));

// 7) Update package name
const pkg = JSON.parse(
  fs.readFileSync(path.join(templateDir, `package.json`), "utf-8"),
);

pkg.name = getProjectName(targetDir);
write("package.json", JSON.stringify(pkg, null, 2) + "\n");

await new Promise((res, rej) => {
  setTimeout(() => {
    res();
  }, 2000);
});

spinner.stop(`Your project is ready!`);

// 8) Show next steps
console.log("\nNext steps:");
let i = 1;

const root = path.join(cwd, targetDir);
const cdProjectName = path.relative(cwd, root);
if (root !== cwd) {
  console.log(
    `  ${i++}: cd ${
      cdProjectName.includes(" ")
        ? `"${bold(cyan(cdProjectName))}"`
        : bold(cyan(cdProjectName))
    }`,
  );
}

switch (pkgManager) {
  case "yarn":
    console.log(`  ${i++}: yarn`);
    console.log(`  ${i++}: yarn dev`);
    break;
  default:
    console.log(`  ${i++}: ${pkgManager} install`);
    console.log(`  ${i++}: ${pkgManager} run dev`);
    break;
}
