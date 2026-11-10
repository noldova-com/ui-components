/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { AngularPackageBuilder } from "./angular-package-builder.ts";
import { ApiCatalog } from "./api/api-catalog.ts";
import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import type PackageInfo from "./package-info.ts";
import { ArchiveReader } from "./packages/archive.reader.ts";
import { PackageBuilder } from "./packages/package-builder.ts";
import { PackageManifest } from "./packages/package-manifest.ts";
import { PeerRange } from "./packages/peer-range.ts";
import { TestingIsolation } from "./packages/testing-isolation.ts";
import { ProcessRunner } from "./processes/process-runner.ts";
import { RetriedDownload } from "./processes/retried-download.ts";
import Script from "./script.ts";

export class Build extends Script {
  private static readonly ARCHIVE_ROOT: string = "package/";
  private static readonly CI_ARGUMENTS: readonly string[] = ["ci", "--no-audit", "--no-fund"];
  private static readonly FRESH_INSTALL_ARGUMENTS: readonly string[] = ["install", "--package-lock-only", "--strict-peer-deps", "--ignore-scripts", "--no-audit", "--no-fund", "--loglevel=error"];
  private static readonly APP_INSTALL_ARGUMENTS: readonly string[] = Build.FRESH_INSTALL_ARGUMENTS.filter(t => t !== "--strict-peer-deps");
  private static readonly FRESH_INSTALL_FOLDER: string = "../../_build/fresh-install";
  private static readonly FRESH_INSTALL_MANIFEST: string = JSON.stringify({ name: "fresh-install", private: true });
  private static readonly SAVE_DEV_OPTION: string = "--save-dev";
  private static readonly ANGULAR_CORE: string = "@angular/core";
  private static readonly ANGULAR_BUILD_TOOLS: string = "@angular/build";
  private static readonly RELEASE_BUILD_VARIABLE: string = "RELEASE_ADDONS";
  private static readonly NPM_CONFIG_FILE_NAME: string = ".npmrc";
  private static readonly PACK_ARGUMENTS: readonly string[] = ["pack", "--ignore-scripts", "--loglevel=error", "--pack-destination"];
  private static readonly BROWSER_ARGUMENTS: readonly string[] = ["install", "--only-shell", "chromium"];
  private static readonly NODE_MODULES_DIRECTORY_NAME: string = "node_modules";
  private static readonly DEPENDENCY_CACHE: string = ".vite";
  private static readonly PLAYWRIGHT_CLI: string = "node_modules/playwright/cli.js";
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly BROWSER_SUBJECT: string = "The browser for the Angular tests";
  private static readonly PACKAGE_MANIFEST_FILE_NAME: string = "package.json";
  private static readonly LICENSE_FILE_NAME: string = "LICENSE";
  private static readonly SCRIPTS_PROJECT: string = "scripts/tsconfig.json";
  private static readonly NODE_LOAD_SCRIPT: string = "tests/fixtures/node-load/load.mts";
  private static readonly NODE_LOAD_PROJECT: string = "tests/fixtures/node-load/tsconfig.json";
  private static readonly GIT_DIRECTORY_NAME: string = ".git";
  private static readonly STATUS_ARGUMENTS: readonly string[] = ["status", "--porcelain"];
  private static readonly COMMIT_ARGUMENTS: readonly string[] = ["rev-parse", "HEAD"];
  private static readonly GIT_COMMAND: string = "git";
  private static readonly INSTALLING_PACKAGES: string = "Installing npm packages...";
  private static readonly INSTALLING_BROWSER: string = "Installing the browser for the Angular tests...";
  private static readonly LIST_COPIES_OPTION: string = "--list-copies";
  private static readonly INPUTS_OPTION: string = "--inputs";
  private static readonly LIST_COPIES_END_LINE: string = "end of copies";
  private static readonly WORKSPACE_FIELDS: readonly string[] = ["scripts", "devDependencies", "allowScripts"];

  public override async runAsync(): Promise<void> {
    const arguments_ = process.argv.slice(2);
    for (const option of [Build.LIST_COPIES_OPTION, Build.INPUTS_OPTION])
      if (arguments_.includes(option) && arguments_.length !== 1)
        throw new CommandFailedException(Build.optionAlone(option));
    if (arguments_.includes(Build.LIST_COPIES_OPTION)) {
      await this.listCopiesAsync();
      return;
    }
    if (arguments_.includes(Build.INPUTS_OPTION)) {
      for (const input of await Build.createBuilder().listInputsAsync())
        process.stdout.write(`${Build.describe(input)}\n`);
      return;
    }

    await this.npmInstallAsync();
    const version = Config.VERSION;
    const commit = await this.readCommitAsync();
    await this.createDirectoryAsync(Config.BUILD_FOLDER);
    await this.createDirectoryAsync(Config.PACKAGES_FOLDER);

    await this.buildKitAsync(version, commit);
    await this.compareApisAsync();

    await this.runStepAsync(Build.checkingScripts(), async () => {
      await this.executeTypeScriptCompilerAsync([Build.TYPESCRIPT_PROJECT_OPTION, Build.SCRIPTS_PROJECT]);
    });
  }

  private static createBuilder(): AngularPackageBuilder {
    return new AngularPackageBuilder(Build.ROOT, process.cwd(), new ProcessRunner());
  }

  private static describe(file: string): string {
    return path.relative(Build.ROOT, file).split(path.sep).join(path.posix.sep);
  }

  private async npmInstallAsync(): Promise<void> {
    if (await this.pathExistsAsync(path.join(Build.ROOT, Build.NODE_MODULES_DIRECTORY_NAME)))
      return;
    await this.writeLogAsync(Build.INSTALLING_PACKAGES);
    await this.executeNPMCommandAsync(Build.CI_ARGUMENTS, Build.ROOT);
  }

  private async buildKitAsync(version: string, commit: string | null): Promise<void> {
    const kit = Config.KIT_INFO;
    await fs.rm(path.join(Build.ROOT, Build.NODE_MODULES_DIRECTORY_NAME, Build.DEPENDENCY_CACHE), { recursive: true, force: true });
    await this.writeLogAsync(Build.INSTALLING_BROWSER);
    await RetriedDownload.runAsync(Build.BROWSER_SUBJECT, process.stdout, () => this.installBrowserAsync());

    const archive = this.locateArchive(kit, version);
    await this.runStepAsync(Build.buildingPackage(kit.packageName), async () => {
      const manifest = await PackageManifest.readAsync(Build.ROOT, kit);
      const output = await this.createPackageDirectoryAsync(kit);
      await this.removeInstalledKitAsync(kit);
      const builder = Build.createBuilder();
      await builder.buildAsync(path.resolve(output));
      const leaks = await new TestingIsolation(Build.ROOT, manifest).findLeaksAsync();
      if (leaks.length > 0)
        throw new CommandFailedException(leaks.join("\n"));
      await this.copyReadmeFileAsync(kit);
      await this.finishPackageAsync(output, version, commit);
      await this.compareArchiveAsync(await builder.listInputsAsync(), archive);
      await this.installAsync(kit, archive);
    });
    await this.runStepAsync(Build.loadingInNode(kit.packageName), async () => {
      await this.executeProcessAsync(process.execPath, [Build.NODE_LOAD_SCRIPT], process.cwd(), true);
      await this.executeTypeScriptCompilerAsync([Build.TYPESCRIPT_PROJECT_OPTION, Build.NODE_LOAD_PROJECT]);
    });
    const peers = await this.readPeersAsync(path.join(Config.BUILD_FOLDER, kit.name, Build.PACKAGE_MANIFEST_FILE_NAME));
    await this.runStepAsync(Build.resolvingFreshInstall(kit.packageName), async () => {
      await this.resolveFreshInstallAsync([path.resolve(archive), ...Object.entries(peers).map(([name, version]) => `${name}@${PeerRange.lowestOf(version)}`)]);
    });
    await this.runStepAsync(Build.resolvingFreshInstallAlone(kit.packageName), async () => {
      await this.resolveFreshInstallAsync([path.resolve(archive)]);
    });
    if (process.env[Build.RELEASE_BUILD_VARIABLE] === undefined) {
      await this.writeLogAsync(Build.skippingBuildTools(kit.packageName));
      return;
    }
    await this.runStepAsync(Build.addingBuildTools(kit.packageName), async () => {
      const angular = peers[Build.ANGULAR_CORE];
      if (angular === undefined)
        throw new CommandFailedException(Build.missingPeer(kit.packageName, Build.ANGULAR_CORE));
      await this.executeNPMCommandAsync([...Build.APP_INSTALL_ARGUMENTS, Build.SAVE_DEV_OPTION, `${Build.ANGULAR_BUILD_TOOLS}@${angular}`], path.resolve(Build.FRESH_INSTALL_FOLDER), true);
    });
  }

  private async readPeersAsync(manifest: string): Promise<Readonly<Record<string, string>>> {
    const fields = JSON.parse(await this.readFileAsync(manifest)) as { readonly peerDependencies?: Readonly<Record<string, string>> };
    return fields.peerDependencies ?? {};
  }

  private async resolveFreshInstallAsync(packages: readonly string[]): Promise<void> {
    await this.removeDirectoryAsync(Build.FRESH_INSTALL_FOLDER);
    await this.createDirectoryAsync(Build.FRESH_INSTALL_FOLDER);
    await this.writeFileAsync(path.join(Build.FRESH_INSTALL_FOLDER, Build.PACKAGE_MANIFEST_FILE_NAME), Build.FRESH_INSTALL_MANIFEST);
    await this.copyFileAsync(path.join(Build.ROOT, Build.NPM_CONFIG_FILE_NAME), path.join(Build.FRESH_INSTALL_FOLDER, Build.NPM_CONFIG_FILE_NAME));
    await this.executeNPMCommandAsync([...Build.FRESH_INSTALL_ARGUMENTS, ...packages], path.resolve(Build.FRESH_INSTALL_FOLDER), true);
  }

  private async compareApisAsync(): Promise<void> {
    const { ApiDeclarationCheck } = await import("./checks/api-declaration-check.ts");
    const { ApiDocumentationCheck } = await import("./checks/api-documentation-check.ts");
    const root = Build.ROOT;
    const catalog = new ApiCatalog(root, Config.KIT_INFO);
    for (const check of [new ApiDeclarationCheck(root, catalog), new ApiDocumentationCheck(root, catalog)]) {
      await this.writeLogAsync(Build.comparing(check.title));
      if (!await check.runAsync(process.stdout))
        throw new CommandFailedException(Build.comparisonFailed(check.title));
    }
  }

  private async installBrowserAsync(): Promise<string | null> {
    try {
      await this.executeProcessAsync(process.execPath, [path.join(Build.ROOT, Build.PLAYWRIGHT_CLI), ...Build.BROWSER_ARGUMENTS], Build.ROOT, true);
      return null;
    }
    catch (error) {
      if (!(error instanceof CommandFailedException))
        throw error;
      return error.message;
    }
  }

  private async createPackageDirectoryAsync(packageInfo: PackageInfo): Promise<string> {
    const output = path.join(Config.BUILD_FOLDER, packageInfo.name);
    await this.removeDirectoryAsync(output);
    await this.createDirectoryAsync(output);
    return output;
  }

  private async finishPackageAsync(output: string, version: string, commit: string | null): Promise<void> {
    const manifest = await this.readFileAsync(Build.PACKAGE_MANIFEST_FILE_NAME);
    await this.writeFileAsync(path.join(output, Build.PACKAGE_MANIFEST_FILE_NAME), Build.stampManifest(manifest, version, commit));
    await this.copyFileAsync(path.join(Build.ROOT, Build.LICENSE_FILE_NAME), path.join(output, Build.LICENSE_FILE_NAME));
    await this.executeNPMCommandAsync([...Build.PACK_ARGUMENTS, path.resolve(Config.PACKAGES_FOLDER)], path.resolve(output), true);
  }

  private async listCopiesAsync(): Promise<void> {
    const kit = Config.KIT_INFO;
    const copies: (readonly [string, string])[] = [[Build.LICENSE_FILE_NAME, Build.LICENSE_FILE_NAME]];
    if (await this.pathExistsAsync(Build.README_FILE_NAME))
      copies.push([Build.describe(path.resolve(Build.README_FILE_NAME)), Build.README_FILE_NAME]);
    for (const [file, entry] of await new PackageBuilder(Build.ROOT).listCopiesAsync(await Build.createBuilder().listInputsAsync()))
      copies.push([Build.describe(file), entry]);
    for (const [source, entry] of copies)
      process.stdout.write(`${source}\t${kit.packageName}\t${entry}\n`);
    process.stdout.write(`${Build.LIST_COPIES_END_LINE}\n`);
  }

  private async compareArchiveAsync(inputs: readonly string[], archive: string): Promise<void> {
    const packages = new PackageBuilder(Build.ROOT);
    const differences = await packages.findArchiveDifferencesAsync(await packages.listCopiesAsync(inputs), path.resolve(archive));
    if (differences.length > 0)
      throw new CommandFailedException(differences.join("\n"));
  }

  // npm links a workspace's own package in place of any archive of it, so the packed kit is unpacked where the link was; its dependencies are the workspace's, already installed.
  private async installAsync(packageInfo: PackageInfo, archive: string): Promise<void> {
    const installed = Build.locateInstalledKit(packageInfo);
    for (const [name, content] of await new ArchiveReader().readAsync(archive)) {
      if (!name.startsWith(Build.ARCHIVE_ROOT))
        throw new CommandFailedException(`${archive} holds ${name} outside its ${Build.ARCHIVE_ROOT} folder.`);
      const target = path.join(installed, name.slice(Build.ARCHIVE_ROOT.length));
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content);
    }
  }

  private static locateInstalledKit(packageInfo: PackageInfo): string {
    return path.join(Build.ROOT, Build.NODE_MODULES_DIRECTORY_NAME, ...packageInfo.packageName.split("/"));
  }

  private async removeInstalledKitAsync(packageInfo: PackageInfo): Promise<void> {
    const installed = Build.locateInstalledKit(packageInfo);
    if (!await this.pathExistsAsync(installed))
      return;
    if ((await fs.lstat(installed)).isSymbolicLink())
      await fs.unlink(installed);
    else
      await this.removeDirectoryAsync(installed);
  }

  private locateArchive(packageInfo: PackageInfo, version: string): string {
    return path.join(Config.PACKAGES_FOLDER, packageInfo.archiveName(version));
  }

  private async readCommitAsync(): Promise<string | null> {
    if (!await this.pathExistsAsync(path.join(Build.ROOT, Build.GIT_DIRECTORY_NAME)))
      return null;
    if ((await this.readProcessOutputAsync(Build.GIT_COMMAND, Build.STATUS_ARGUMENTS, Build.ROOT)).length > 0)
      return null;
    return (await this.readProcessOutputAsync(Build.GIT_COMMAND, Build.COMMIT_ARGUMENTS, Build.ROOT)).trim();
  }

  private static stampManifest(text: string, version: string, commit: string | null): string {
    const fields = Object.fromEntries(Object.entries(JSON.parse(text) as Readonly<Record<string, unknown>>).filter(([t]) => !Build.WORKSPACE_FIELDS.includes(t)));
    return JSON.stringify({ ...fields, version, ...(commit === null ? {} : { gitHead: commit }) }, null, 2);
  }

  private static optionAlone(option: string): string {
    return `Option ${option} takes no other value.`;
  }

  private static buildingPackage(packageName: string): string {
    return `Building "${packageName}"...`;
  }

  private static loadingInNode(packageName: string): string {
    return `Loading "${packageName}" in Node.js and checking its types with NodeNext resolution...`;
  }

  private static resolvingFreshInstall(packageName: string): string {
    return `Resolving a fresh install of "${packageName}" with only its peers...`;
  }

  private static resolvingFreshInstallAlone(packageName: string): string {
    return `Resolving a fresh install of "${packageName}" alone...`;
  }

  private static addingBuildTools(packageName: string): string {
    return `Adding Angular's build tools at "${packageName}"'s Angular version to its fresh install alone...`;
  }

  private static skippingBuildTools(packageName: string): string {
    return `Skipping Angular's build tools at "${packageName}"'s Angular version: only a release's build adds them.`;
  }

  private static missingPeer(packageName: string, peer: string): string {
    return `"${packageName}" names no "${peer}" peer, so its Angular version is unknown.`;
  }

  private static checkingScripts(): string {
    return `Checking the types of ${Build.SCRIPTS_PROJECT}...`;
  }

  private static comparing(title: string): string {
    return `Comparing the ${title}...`;
  }

  private static comparisonFailed(title: string): string {
    return `The ${title} differ from the source.`;
  }
}

const builder = new Build();
await builder.runAsEntryPointAsync();
