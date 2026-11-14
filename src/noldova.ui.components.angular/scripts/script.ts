/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import type PackageInfo from "./package-info.ts";
import { ProcessRunner } from "./processes/process-runner.ts";
import { ProcessException } from "./processes/process.exception.ts";

export default abstract class Script {
  private static readonly RUNNER: ProcessRunner = new ProcessRunner();
  private static readonly NPM_EXECUTABLE_PATH_VARIABLE: string = "npm_execpath";
  private static readonly NPM_EXECUTABLE_PATH_UNAVAILABLE: string = "npm_execpath is unavailable. Run the bootstrap through npm.";
  private static readonly PACKAGE_MANIFEST_PATH: string = "typescript/package.json";
  private static readonly MISSING_CODE: string = "ENOENT";
  private static readonly STEP_DONE: string = " Done.";
  private static readonly STEP_FAILED: string = " Failed.";
  private static readonly TYPESCRIPT_COMPILER_DIRECTORY_NAME: string = "bin";
  private static readonly TYPESCRIPT_COMPILER_FILE_NAME: string = "tsc";
  private static readonly TYPESCRIPT_PRETTY_OPTION: string = "--pretty";
  protected static readonly TYPESCRIPT_PROJECT_OPTION: string = "--project";
  protected static readonly README_FILE_NAME: string = "README.md";
  protected static readonly SOURCE_DIRECTORY_NAME: string = "src";
  protected static readonly TEXT_ENCODING: BufferEncoding = "utf8";

  public abstract runAsync(): Promise<void>;

  public async runAsEntryPointAsync(): Promise<void> {
    try {
      await this.runAsync();
    }
    catch (error) {
      if (!(error instanceof CommandFailedException || error instanceof ProcessException))
        throw error;

      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }

  protected async executeProcessAsync(command: string, arguments_: readonly string[], workingDirectory: string, silent: boolean = false): Promise<void> {
    if (!silent) {
      const exitCode = await Script.RUNNER.runAsync(command, arguments_, workingDirectory);
      if (exitCode !== 0)
        throw new CommandFailedException(Script.commandFailed(command, exitCode, ""));
      return;
    }
    const result = await Script.RUNNER.captureAsync(command, arguments_, workingDirectory, null);
    if (!result.isSuccessful)
      throw new CommandFailedException(Script.commandFailed(command, result.exitCode, result.text));
  }

  protected async readProcessOutputAsync(command: string, arguments_: readonly string[], workingDirectory: string): Promise<string> {
    const result = await Script.RUNNER.captureAsync(command, arguments_, workingDirectory, null);
    if (!result.isSuccessful)
      throw new CommandFailedException(Script.commandFailed(command, result.exitCode, result.errorOutput));
    return result.output;
  }

  protected async executeNPMCommandAsync(arguments_: readonly string[], workingDirectory: string, silent: boolean = false,): Promise<void> {
    await this.executeProcessAsync(process.execPath, [Script.readNPMPath(), ...arguments_], workingDirectory, silent,);
  }

  protected async readNPMOutputAsync(arguments_: readonly string[], workingDirectory: string): Promise<string> {
    return await this.readProcessOutputAsync(process.execPath, [Script.readNPMPath(), ...arguments_], workingDirectory);
  }

  protected async executeTypeScriptCompilerAsync(arguments_: readonly string[]): Promise<void> {
    const packagePath: string = fileURLToPath(import.meta.resolve(Script.PACKAGE_MANIFEST_PATH));
    const compilerPath: string = path.join(path.dirname(packagePath), Script.TYPESCRIPT_COMPILER_DIRECTORY_NAME, Script.TYPESCRIPT_COMPILER_FILE_NAME);

    await this.executeProcessAsync(process.execPath, [compilerPath, Script.TYPESCRIPT_PRETTY_OPTION, ...arguments_], process.cwd(), true);
  }

  protected async writeLogAsync(message: string): Promise<void> {
    console.log(message);
  }

  protected async runStepAsync(message: string, stepAsync: () => Promise<void>): Promise<void> {
    process.stdout.write(message);
    try {
      await stepAsync();
    }
    catch (error) {
      console.log(Script.STEP_FAILED);
      throw error;
    }
    console.log(Script.STEP_DONE);
  }

  protected async createDirectoryAsync(directoryName: string): Promise<void> {
    await fs.mkdir(directoryName, { recursive: true });
  }

  protected async removeDirectoryAsync(directoryName: string): Promise<void> {
    await fs.rm(directoryName, { recursive: true, force: true });
  }

  protected async pathExistsAsync(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    }
    catch (error) {
      if (error instanceof Error && "code" in error && error.code === Script.MISSING_CODE)
        return false;
      throw error;
    }
  }

  protected async copyFileAsync(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }

  protected async readFileAsync(filePath: string): Promise<string> {
    return await fs.readFile(filePath, Script.TEXT_ENCODING);
  }

  protected async writeFileAsync(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content);
  }

  protected async copyReadmeFileAsync(packageInfo: PackageInfo): Promise<void> {
    const sourceFilePath = Script.README_FILE_NAME;
    if (!await this.pathExistsAsync(sourceFilePath))
      throw new CommandFailedException(Script.readmeMissing(packageInfo.packageName, sourceFilePath));

    await this.copyFileAsync(sourceFilePath, `${Config.BUILD_FOLDER}/${packageInfo.name}/${Script.README_FILE_NAME}`);
  }

  private static readNPMPath(): string {
    const npmPath: string | undefined = process.env[Script.NPM_EXECUTABLE_PATH_VARIABLE];
    if (npmPath === undefined || npmPath.length === 0)
      throw new CommandFailedException(Script.NPM_EXECUTABLE_PATH_UNAVAILABLE);

    return npmPath;
  }

  private static commandFailed(command: string, exitCode: number | null, output: string): string {
    return output.trim().length === 0 ? `Command "${command}" failed with exit code ${exitCode}.` : output.trimEnd();
  }

  private static readmeMissing(packageName: string, readmeFilePath: string): string {
    return `Package ${packageName} has no ${Script.README_FILE_NAME} at "${readmeFilePath}"; every package ships one.`;
  }
}
