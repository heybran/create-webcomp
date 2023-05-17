// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import spawn from 'cross-spawn';
import minimist from 'minimist';
import prompts from 'prompts';

import {
  blue,
  cyan,
  green,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow
} from 'kolorist';

/**
 * @typeof {Object} Argv
 * @property {string} [t]
 * @property {string} [template]
 * @property {string[]} [_]
 */ 

/** @type {Argv} */
const argv = minimist(process.argv.slice(2), { string: ['_'] });

/** @type {string} */
const cwd = process.cwd();

/** type {string} */
const defaultTargetDir = 'web-components-project';

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;

  let targetDir = argTargetDir || defaultTargetDir;
  const projectName = getProjectName(targetDir);

  let result;

  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: reset('Project name:'),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir; 
          },
        },
      ]
    );
  } catch (err) {
    console.log(err.message);
    return;
  }

  console.log( result  );
}

/**
 * Formats a target directory path by trimming trailing slashes.
 * @param {string|undefined} targetDir - The target directory path to format.
 * @returns {string|undefined} The formatted target directory path, or undefined
 */
function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, '');
}

/**
 * Get project name from target directory path.
 * @param {string} targetDir - The target directory path.
 * @returns {string} The project name.
 */
function getProjectName(targetDir) {
  return targetDir === '.' ? path.basename(path.resolve()) : targetDir;
}

init().catch((e) => console.error(e) );