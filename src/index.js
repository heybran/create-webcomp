// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import minimist from "minimist";
import prompts from "prompts";

import {
  blue,
  cyan,
  green,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from "kolorist";

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
 * @typeof {Object} WebComponentsStructure
 * @property {string} name
 * @property {string} [display]
 * @property {string}
 */

/** @type WebComponentsStructure **/
const STRUCTURES = [
  {
    name: "js-only",
    display: `${yellow("Standalone JavaScript")} ("./components/MyCouter.js")`,
  },
  {
    name: "css-js",
    display: `${magenta(
      "CSS + JavaScript",
    )} ("./components/my-counter/MyCouter.css+MyCounter.js")`,
  },
  {
    name: "html-css-js",
    display: `${green(
      "HTML + CSS + JavaScript",
    )} ("./components/my-counter/MyCouter.html+MyCounter.css+MyCouter.js")`,
  },
];

/** @type {Argv} */
const argv = minimist(process.argv.slice(2), { string: ["_"] });

/** @type {string} */
const cwd = process.cwd();

/** type {string} */
const defaultTargetDir = "web-components-project";

/**
 * A record of file name mappings for renaming files during project initialization.
 * @typedef {Object.<string, string|undefined>} RenameFiles
 */

/**
 * A record of file name mappings for renaming files during project initialization.
 * @type {RenameFiles}
 */
const renameFiles = {
  _gitignore: ".gitignore",
};

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
  console.log(result);

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
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  // template files that we need to copy over target directory.
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

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

init().catch((e) => console.error(e));
