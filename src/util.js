// @ts-check
import path from "node:path";
import fs from "node:fs";
/**
 * Formats a target directory path by trimming trailing slashes.
 * @param {string|undefined} targetDir - The target directory path to format.
 * @returns {string|undefined} The formatted target directory path, or undefined
 */
export function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

/**
 * Get project name from target directory path.
 * @param {string} targetDir - The target directory path.
 * @returns {string} The project name.
 */
export function getProjectName(targetDir) {
  return targetDir === "." ? path.basename(path.resolve()) : targetDir;
}

/**
 * Checks if a directory is empty.
 * @param {string} path - The path to the directory to check.
 * @returns {boolean} True if the directory is empty, false otherwise.
 */
export function isEmpty(path) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

/**
 * Deletes all files and directories in a directory, except for the .git directory.
 * @param {string} dir - The path to the directory to empty.
 * @returns {void}
 */
export function emptyDir(dir) {
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

/**
 * Copies a file or directory from the source path to the destination path.
 * @param {string} src - The path to the source file or directory.
 * @param {string} dest - The path to the destination file or directory.
 * @returns {void}
 */
export function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * Copies a directory and its contents from the source path to the destination path.
 * @param {string} srcDir - The path to the source directory.
 * @param {string} destDir - The path to the destination directory.
 * @returns {void}
 */
export function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

/**
 * Checks if a project name is a valid package name according to the npm naming rules.
 * @param {string} projectName - The name of the project to check.
 * @returns {boolean} `true` if the project name is a valid package name, `false` otherwise.
 */
export function isValidPackageName(projectName) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

/**
 * Converts a project name to a valid package name according to the npm naming rules.
 * @param {string} projectName - The name of the project to convert.
 * @returns {string} The converted package name.
 */
export function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

/**
 * Parses a user agent string to extract the package name and version.
 * @param {string|undefined} userAgent - The user agent string to parse.
 * @returns {{name: string, version: string}|undefined} An object containing the package name and version, or `undefined` if the user agent string is not provided.
 */
export function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}
