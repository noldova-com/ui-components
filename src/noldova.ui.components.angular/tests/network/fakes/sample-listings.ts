/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Windows' listings as a machine short of ports gives them, for the spec of a resource error's census: eight sockets, five held by two processes of
// one name, two by a process tasklist doesn't list, and netstat's heading lines, which aren't sockets.
export class SampleListings {
  private static readonly LINE_END: string = String.fromCharCode(13, 10);
  private static readonly LISTINGS: ReadonlyMap<string, readonly string[]> = new Map([
    ["netstat", [
      "", "Active Connections", "", "  Proto  Local Address          Foreign Address        State           PID",
      "  TCP    127.0.0.1:50001        127.0.0.1:24315        TIME_WAIT       0",
      "  TCP    127.0.0.1:50002        127.0.0.1:24315        TIME_WAIT       0",
      "  TCP    127.0.0.1:50003        127.0.0.1:24315        ESTABLISHED     4120",
      "  TCP    127.0.0.1:50004        127.0.0.1:24315        ESTABLISHED     4120",
      "  TCP    127.0.0.1:50005        127.0.0.1:24315        ESTABLISHED     4120",
      "  TCP    127.0.0.1:50006        127.0.0.1:24315        CLOSE_WAIT      4120",
      "  TCP    127.0.0.1:50007        127.0.0.1:24315        TIME_WAIT       4188",
      "  TCP    0.0.0.0:24315          0.0.0.0:0              LISTENING       7788"
    ]],
    ["tasklist", [`"chrome.exe","4120","Console","1","120,000 K"`, `"chrome.exe","4188","Console","1","60,000 K"`, `"node.exe","7788","Console","1","80,000 K"`]],
    ["netsh", ["", "Protocol tcp Dynamic Port Range", "---------------------------------", "Start Port      : 49152", "Number of Ports : 16384", ""]]
  ]);

  public static listAsync(command: string): Promise<string> {
    return Promise.resolve((SampleListings.LISTINGS.get(command) ?? []).join(SampleListings.LINE_END));
  }
}
