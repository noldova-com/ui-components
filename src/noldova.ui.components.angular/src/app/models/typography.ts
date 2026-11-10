/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { FontChoice } from "../enums/font-choice.js";
import { Resources } from "../../resources.js";
import { TypographyResources } from "./typography.resources.js";

export class Typography {
  public readonly panelSize: number;
  public readonly messageSize: number;
  public readonly codeSize: number;
  public readonly interfaceFont: FontChoice;
  public readonly codeFont: FontChoice;

  public constructor(
    panelSize: number = Resources.defaultPanelSize,
    messageSize: number = Resources.defaultMessageSize,
    codeSize: number = Resources.defaultCodeSize,
    interfaceFont: FontChoice = FontChoice.Noldova,
    codeFont: FontChoice = FontChoice.Noldova) {
    Typography.validateSize(panelSize, TypographyResources.panelSizeParameter);
    Typography.validateSize(messageSize, TypographyResources.messageSizeParameter);
    Typography.validateSize(codeSize, TypographyResources.codeSizeParameter);

    this.panelSize = panelSize;
    this.messageSize = messageSize;
    this.codeSize = codeSize;
    this.interfaceFont = interfaceFont;
    this.codeFont = codeFont;
  }

  public get rootSize(): number {
    return Resources.defaultRootSize * this.panelSize / Resources.defaultPanelSize;
  }

  private static validateSize(size: number, parameterName: string): void {
    if (!Number.isFinite(size) || size < Resources.minimumTextSize || size > Resources.maximumTextSize)
      throw new ArgumentOutOfRangeException(parameterName, size, Resources.formatTextSizeOutOfRange(parameterName, size));
  }
}
