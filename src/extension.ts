// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process";
import * as kill from "tree-kill";

let _channel: vscode.OutputChannel;
let _watchProcess: ChildProcess;

function getOutputChannel(): vscode.OutputChannel {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel("Flutter Helper Logs");
  }

  return _channel;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-flutter-helper" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "flutterHelper.genModel",
    () => {
      // The code you place here will be executed every time your command is executed

      let process = spawn(
        "flutter",
        [
          "packages",
          "pub",
          "run",
          "build_runner",
          "build",
          "--delete-conflicting-outputs"
        ],
        {
          shell: true,
          cwd: vscode.workspace.rootPath
          //   detached: true
        }
      );

      process.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
        getOutputChannel().appendLine(data);
      });

      process.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
        getOutputChannel().appendLine(data);
      });

      process.on("close", code => {
        console.log(`child process exited with code ${code}`);
        getOutputChannel().appendLine(`child process exited with code ${code}`);
      });

      // Display a message box to the user
      //   vscode.window.showInformationMessage("Hello World!");
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.commands.registerCommand("flutterHelper.genModelWatch", () => {
      if (_watchProcess && !_watchProcess.killed) {
        vscode.window.showInformationMessage("Stopped Codegen Process");
        kill(_watchProcess.pid);
        _watchProcess.kill();
      } else {
        vscode.window.showInformationMessage("Started Codegen Process");
        _watchProcess = spawn(
          "flutter",
          [
            "packages",
            "pub",
            "run",
            "build_runner",
            "watch",
            "--delete-conflicting-outputs"
          ],
          {
            shell: true,
            cwd: vscode.workspace.rootPath
            //   detached: true
          }
        );

        _watchProcess.stdout.on("data", data => {
          console.log(`stdout: ${data}`);
          getOutputChannel().appendLine(data);
        });

        _watchProcess.stderr.on("data", data => {
          console.error(`stderr: ${data}`);
          getOutputChannel().appendLine(data);
        });

        _watchProcess.on("close", code => {
          console.log(`child process exited with code ${code}`);
          getOutputChannel().appendLine(
            `child process exited with code ${code}`
          );
        });
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (_watchProcess && !_watchProcess.killed) {
    kill(_watchProcess.pid);
    _watchProcess.kill();
  }
}
