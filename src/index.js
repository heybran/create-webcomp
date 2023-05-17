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

/** @type {Argv} */
const argv = minimist(process.argv.slice(2), { string: ["_"] });

/** @type {string} */
const cwd = process.cwd();

/** type {string} */
const defaultTargetDir = "web-components-project";

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;

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
    ]);
  } catch (err) {
    console.log(err.message);
    return;
  }

  const { overwrite } = result;
  console.log(result);

  const root = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(root);
  }
}

/**
 * Formats a target directory path by trimming trailing slashes.
 * @param {string|undefined} targetDir - The target directory path to format.
 * @returns {string|undefined} The formatted target directory path, or undefined
 */
function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

/**
 * Get project name from target directory path.
 * @param {string} targetDir - The target directory path.
 * @returns {string} The project name.
 */
function getProjectName(targetDir) {
  return targetDir === "." ? path.basename(path.resolve()) : targetDir;
}

/**
 * Checks if a directory is empty.
 * @param {string} path - The path to the directory to check.
 * @returns {boolean} True if the directory is empty, false otherwise.
 */
function isEmpty(path) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

/**
 * Deletes all files and directories in a directory, except for the .git directory.
 * @param {string} dir - The path to the directory to empty.
 * @returns {void}
 */
function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

init().catch((e) => console.error(e));
