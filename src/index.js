// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import minimist from "minimist";
import * as p from "@clack/prompts";
import { bold, cyan, grey, yellow } from "kleur/colors";
import prompts from "prompts";

// import {
//   blue,
//   cyan,
//   green,
//   lightGreen,
//   lightRed,
//   magenta,
//   red,
//   reset,
//   yellow,
// } from "kolorist";

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

/**
 * @typeof {Object} Argv
 * @property {string} [t]
 * @property {string} [template]
 * @property {string[]} [_]
 */

/**
 * @typeof {Object} UserAnswers
 * @property {string} [projectName]
 * @property {boolean} [overwrite]
 * @property {string} []
 * @property {string[]} [_]
 */

/**
 * @typeof {Object} WebComponentsTemplate
 * @property {string} name
 * @property {string} title
 * @property {string} description
 */

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
p.intro(`Okies, let's get you started with a fresh web components project.`);

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

  emptyDir(path.join(process.cwd(), targetDir));
} else {
  fs.mkdirSync(path.join(process.cwd(), targetDir), { recursive: true });
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

console.log(options);

/** @type {Argv} */
const argv = minimist(process.argv.slice(2), { string: ["_"] });

/** @type {string} */
const cwd = process.cwd();

/** type {string} */
const defaultTargetDir = "web-components-project";

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  const argStructure = argv.structure || argv.s;

  let targetDir = argTargetDir || defaultTargetDir;
  const projectName = getProjectName(targetDir);

  /** @type {prompts.Answers<UserAnswers>} */
  let result;

  try {
    result = await prompts([
      {
        type: argTargetDir ? null : "text",
        name: "projectName",
        message: reset("Project name:"),
        initial: defaultTargetDir,
        onState: (state) => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir;
        },
      },
      {
        type: () => {
          return !fs.existsSync(targetDir) || isEmpty(targetDir)
            ? null
            : "confirm";
        },
        name: "overwrite",
        message: () => {
          return (
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`
          );
        },
      },
      {
        type: () =>
          isValidPackageName(getProjectName(targetDir)) ? null : "text",
        name: "packageName",
        message: reset("Package name:"),
        initial: () => toValidPackageName(getProjectName(targetDir)),
        validate: (dir) =>
          isValidPackageName(dir) || "Invalid package.json name",
      },
      {
        type: argStructure ? null : "select",
        name: "structure",
        message: reset("Select a web components structure:"),
        initial: 0,
        choices: STRUCTURES.map((structure) => {
          return {
            title: structure.display,
            value: structure,
          };
        }),
      },
    ]);
  } catch (err) {
    console.log(err.message);
    return;
  }

  const { overwrite, packageName, structure } = result;

  const root = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");

  console.log(`\nScaffolding web components project in ${root}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `template-${structure.name}`,
  );

  /**
   * Writes content to a file, or copies a file from a template directory to a target directory.
   * @param {string} file - The name of the file to write or copy.
   * @param {string} [content] - The content to write to the file. If not provided, the file will be copied from a template directory.
   * @returns {void}
   */
  const write = (file, content) => {
    const targetPath = path.join(root, file);
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

  const _template_gitignore = path.join(
    fileURLToPath(import.meta.url),
    "../..",
    `_template_gitignore`,
  );

  write(".gitignore", fs.readFileSync(_template_gitignore, "utf-8"));

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8"),
  );

  pkg.name = packageName || getProjectName(targetDir);
  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  const cdProjectName = path.relative(cwd, root);
  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`,
    );
  }

  switch (pkgManager) {
    case "yarn":
      console.log("  yarn");
      console.log("  yarn dev");
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();
}

// init().catch((e) => console.error(e));
