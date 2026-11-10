/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class GettingStartedPageResources {
  public static readonly lead: string = "Noldova's interface kit: the design tokens, the fonts, the icons and the Angular components that Noldova's products build their interfaces from.";
  public static readonly installTitle: string = "Install";
  public static readonly installText: string = "Add the package at an exact version, with the peers it names.";
  public static readonly installCommand: string = "npm install --save-exact @noldova/ui.components.angular";
  public static readonly stylesTitle: string = "Load the styles";
  public static readonly stylesText: string = "Add the kit's theme and its stylesheet to the app's global styles; the page then follows the system's light or dark mode.";
  public static readonly stylesCode: string = "\"styles\": [\n  \"@noldova/ui.components.angular/styles/theme.css\",\n  \"@noldova/ui.components.angular/styles/kit.css\"\n]";
  public static readonly useTitle: string = "Use a component";
  public static readonly useText: string = "Import a component by name from the package, as each component's page shows.";
  public static readonly useCode: string = "import { ButtonComponent } from \"@noldova/ui.components.angular\";";
  public static readonly shellLanguage: string = "bash";
  public static readonly jsonLanguage: string = "json";
  public static readonly typescriptLanguage: string = "typescript";
}
