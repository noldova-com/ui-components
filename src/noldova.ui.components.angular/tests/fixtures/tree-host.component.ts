/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, Injector, afterNextRender, inject, signal, viewChild } from "@angular/core";

import { TreeComponent } from "../../src/app/components/tree/tree.component";
import { TreeNode } from "../../src/app/models/tree.node";

@Component({
  imports: [TreeComponent],
  template: `
    <nol-tree class="nested" label="Files" [nodes]="nodes()" [current]="current()" (activated)="activations.push($event.id)" />
    <nol-tree class="flat" label="Pages" [nodes]="pages" />
    <nol-tree class="opened" label="Opened" [nodes]="opened()" />
  `
})
export class TreeHostComponent {
  public readonly nested = viewChild.required(TreeComponent);
  public readonly opened = signal<readonly TreeNode[]>([TreeNode.open("open", "Open", "folder", [new TreeNode("inside", "Inside", "description")]), new TreeNode("closed", "Closed")]);
  public readonly nodes = signal<readonly TreeNode[]>([
    new TreeNode("project", "Project", "folder", [
      new TreeNode("source", "Source", "folder", [new TreeNode("app", "App", "description")]),
      new TreeNode("readme", "Readme", "description")
    ]),
    new TreeNode("notes", "Notes"),
    new TreeNode("trash", "Trash", "delete")
  ]);
  public readonly current = signal<string | null>("notes");
  public readonly pages: readonly TreeNode[] = [new TreeNode("appearance", "Appearance"), new TreeNode("shortcuts", "Keyboard shortcuts")];
  public readonly activations: string[] = [];

  private readonly injector: Injector = inject(Injector);

  // Sets the nodes and, once they render, focuses the target in the render's write phase, before the tree's own pass of the focus, as an owner
  // moving the focus after a removal does.
  public setNodesFocusing(nodes: readonly TreeNode[], target: HTMLElement): void {
    this.nodes.set(nodes);
    afterNextRender({ write: () => target.focus() }, { injector: this.injector });
  }
}
