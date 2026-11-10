/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownLinkResources {
  public static readonly markdownDrivePathPattern: RegExp = /^[a-z]:[/\\]/iu;
  public static readonly markdownFileProtocol: string = "file:";
  public static readonly markdownLocalFileHosts: readonly string[] = ["", "localhost"];
  public static readonly markdownFileUrlSharePattern: RegExp = /^file:[/\\]{2}[^/\\]*[/\\]{2}/iu;
  public static readonly markdownFileUrlDrivePattern: RegExp = /^\/[a-z]:\//iu;
  public static readonly markdownFileUrlDriveFormPattern: RegExp = /^file:\/\/(?:localhost)?\/?([a-z])[:|](?=[/\\])/iu;
  public static readonly markdownFileUrlDriveForm: string = "file:///$1:";
  public static readonly markdownSchemePattern: RegExp = /^[a-z][a-z\d+.-]*:/iu;
  public static readonly markdownPathPartPattern: RegExp = /[#?][^/\\]*$/u;
  public static readonly markdownUrlPartPattern: RegExp = /[#?].*$/su;
  public static readonly markdownNotPathPattern: RegExp = /^(?:[/\\]{2}|[#?]|\s|$)|\p{Cc}/u;
}
