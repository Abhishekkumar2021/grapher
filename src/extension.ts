import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log("Congratulations, your extension 'grapher' is now active!");

  let disposable = vscode.commands.registerCommand("grapher.start", () => {
    GrapherPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);
}

class GrapherPanel {
  public static currentPanel: GrapherPanel | undefined;

  public static readonly viewType = "Grapher";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (GrapherPanel.currentPanel) {
      GrapherPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      GrapherPanel.viewType,
      "Grapher",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    );

    GrapherPanel.currentPanel = new GrapherPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    GrapherPanel.currentPanel = new GrapherPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    GrapherPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview();
  }

  private _getHtmlForWebview() {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.file(
		path.join(this._extensionUri.fsPath, "media", "app.js")
	);

    // And the uri we use to load this script in the webview
    const scriptUri = this._panel.webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const stylePathOnDisk = vscode.Uri.file(
		path.join(this._extensionUri.fsPath, "media", "style.css")
	);

	// And the uri we use to load this script in the webview
	const styleUri = this._panel.webview.asWebviewUri(stylePathOnDisk);

    // Use a nonce to only allow specific scripts to be run
    const nonce = uuidv4();

    return `<!DOCTYPE html>
	  <html lang="en">
	  <head>
		  <meta charset="UTF-8">
		  <!--
			  Use a content security policy to only allow loading images from https or from our extension directory,
			  and only allow scripts that have a specific nonce.
		  -->
		  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src ${this._panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Play with graphs</title>
		  <link href="` + styleUri + `" rel="stylesheet">
	  </head>
	  <body>
		<canvas id="canvas"></canvas>
		<button id="menu-btn">Menu</button>
		<div class="container">
			<div class="add-node card">
				<input type="text" id="node-name" placeholder="Node Name">
				<input type="color" id="node-color" value="#ffffff">
				<button id="add-node-btn">Add Node</button>
			</div>
			<div class="add-edge card">
				<input type="text" id="edge-source" placeholder="Source Node">
				<input type="text" id="edge-target" placeholder="Target Node">
				<button id="add-edge-btn">Add Edge</button>
			</div>
			<div class="remove-node card">
				<input type="text" id="remove-node-name" placeholder="Node Name">
				<button id="remove-node-btn">Remove Node</button>
			</div>
			<div class="remove-edge card">
				<input type="text" id="remove-edge-source" placeholder="Source Node">
				<input type="text" id="remove-edge-target" placeholder="Target Node">
				<button id="remove-edge-btn">Remove Edge</button>
			</div>
			<div class="buttons">
				<button id="clear-graph-btn">Clear Graph</button>
        <button id="save-json-btn">Save as JSON</button>
        <input type="file" id="file-input" accept=".json" hidden>
        <button id="load-json-btn">Load JSON</button>
        <button id="save-png-btn">Save as PNG</button>
        <input type="file" id="file-input-graphviz" accept=".gv, .dot" hidden>
        <button id="load-graphviz-btn">Load Graphviz</button>
        <button id="save-graphviz-btn">Save as Graphviz</button>
			</div>
		</div>
		<div id="node-card" >
			<p id="node-indegree"></p>
			<p id="node-outdegree"></p>
			<p id="node-degree"></p>
			<p id="node-adjacency"></p>
			<p id="node-color"></p>
		</div>
		<script nonce="${nonce}" src="${scriptUri}"></script>
	  </body>
	  </html>`;
  }
}
