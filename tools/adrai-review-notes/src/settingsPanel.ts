/**
 * adrai Review Notes - Settings Panel WebView
 *
 * Provides a settings UI for configuring the extension.
 */

import * as vscode from 'vscode';
import { isGitRepository } from './noteStorage';

/**
 * Settings Panel WebView provider
 */
export class SettingsPanel {
  public static currentPanel: SettingsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _hasGit: boolean = false;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Check git availability and then update
    this._initializeAndUpdate();

    // Listen for disposal
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'updateSetting':
            this._updateSetting(message.key, message.value);
            break;
        }
      },
      null,
      this._disposables
    );

    // Listen for config changes and update panel
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('adrai')) {
        this._update();
      }
    }, null, this._disposables);
  }

  /**
   * Initialize git check and update
   */
  private async _initializeAndUpdate(): Promise<void> {
    this._hasGit = await isGitRepository();
    this._update();
  }

  /**
   * Show or create the settings panel
   */
  public static show(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If panel already exists, reveal it
    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Create new panel
    const panel = vscode.window.createWebviewPanel(
      'adraiSettings',
      'adrai Review Notes Settings',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
  }

  /**
   * Update a setting
   */
  private async _updateSetting(key: string, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('adrai');
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  /**
   * Update panel content
   */
  private _update(): void {
    const config = vscode.workspace.getConfiguration('adrai');

    // Get icon URI for webview
    const iconUri = this._panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'sprantic.png')
    );

    this._panel.webview.html = this._getHtmlForWebview({
      groupBy: config.get<string>('groupBy', 'status'),
      branchFilter: config.get<boolean>('branchFilter', false),
      showLocation: config.get<boolean>('showLocation', true),
      showBranch: config.get<boolean>('showBranch', true),
      showDate: config.get<boolean>('showDate', false),
      sortBy: config.get<string>('sortBy', 'date'),
      sortOrder: config.get<string>('sortOrder', 'desc'),
      quickNoteDefaultType: config.get<string>('quickNoteDefaultType', 'bookmark'),
      quickNoteDefaultStatus: config.get<string>('quickNoteDefaultStatus', 'open'),
      showNoteIcons: config.get<boolean>('showNoteIcons', true),
      projectStorage: config.get<boolean>('projectStorage', false),
      hasGit: this._hasGit,
      iconUri: iconUri.toString()
    });
  }

  /**
   * Generate HTML for the webview
   */
  private _getHtmlForWebview(settings: Record<string, any>): string {
    // Conditionally show git-related settings
    const gitSettingsHtml = settings.hasGit ? `
    <div class="setting-row">
      <div class="setting-label">
        Branch Filter
        <small>Show only notes from current git branch</small>
      </div>
      <input type="checkbox" id="branchFilter" ${settings.branchFilter ? 'checked' : ''}>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        Show Branch
        <small>Display branch badge for notes from other branches</small>
      </div>
      <input type="checkbox" id="showBranch" ${settings.showBranch ? 'checked' : ''}>
    </div>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>adrai Review Notes Settings</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      font-size: 1.5em;
      margin-bottom: 1.5em;
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 0.5em;
    }
    h2 {
      font-size: 1.1em;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: var(--vscode-foreground);
    }
    .setting-group {
      margin-bottom: 1.5em;
      padding: 1em;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
    }
    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75em;
      padding: 0.5em 0;
    }
    .setting-row:last-child {
      margin-bottom: 0;
    }
    .setting-label {
      flex: 1;
    }
    .setting-label small {
      display: block;
      color: var(--vscode-descriptionForeground);
      margin-top: 0.25em;
    }
    select, input[type="checkbox"] {
      accent-color: var(--vscode-focusBorder);
    }
    select {
      padding: 4px 8px;
      background: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      border-radius: 2px;
      min-width: 140px;
    }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .icon {
      margin-right: 0.5em;
    }
    .about-section {
      margin-top: 2em;
      padding: 1em;
      border-top: 1px solid var(--vscode-panel-border);
      text-align: center;
      color: var(--vscode-descriptionForeground);
    }
    .about-section a {
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
    }
    .about-section a:hover {
      text-decoration: underline;
    }
    .about-logo {
      font-size: 1.2em;
      margin-bottom: 0.5em;
    }
  </style>
</head>
<body>
  <h1>adrai Review Notes Settings</h1>

  <div class="setting-group">
    <h2>Display Options</h2>

    <div class="setting-row">
      <div class="setting-label">
        Show Location
        <small>Display file path and line number in note description</small>
      </div>
      <input type="checkbox" id="showLocation" ${settings.showLocation ? 'checked' : ''}>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        Show Date
        <small>Display creation date in note description</small>
      </div>
      <input type="checkbox" id="showDate" ${settings.showDate ? 'checked' : ''}>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        Show Note Icons
        <small>Type icons for status groups, status icons for type/file groups</small>
      </div>
      <input type="checkbox" id="showNoteIcons" ${settings.showNoteIcons ? 'checked' : ''}>
    </div>
  </div>

  <div class="setting-group">
    <h2>Organization</h2>

    <div class="setting-row">
      <div class="setting-label">
        Group By
        <small>How to organize notes in the panel</small>
      </div>
      <select id="groupBy">
        <option value="status" ${settings.groupBy === 'status' ? 'selected' : ''}>Status</option>
        <option value="type" ${settings.groupBy === 'type' ? 'selected' : ''}>Type</option>
        <option value="file" ${settings.groupBy === 'file' ? 'selected' : ''}>File</option>
      </select>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        Sort By
        <small>Secondary sort within groups</small>
      </div>
      <select id="sortBy">
        <option value="date" ${settings.sortBy === 'date' ? 'selected' : ''}>Date</option>
        <option value="type" ${settings.sortBy === 'type' ? 'selected' : ''}>Type</option>
        <option value="status" ${settings.sortBy === 'status' ? 'selected' : ''}>Status</option>
      </select>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        Sort Order
        <small>Ascending or descending</small>
      </div>
      <select id="sortOrder">
        <option value="desc" ${settings.sortOrder === 'desc' ? 'selected' : ''}>Newest/Highest First</option>
        <option value="asc" ${settings.sortOrder === 'asc' ? 'selected' : ''}>Oldest/Lowest First</option>
      </select>
    </div>
  </div>

  <div class="setting-group">
    <h2>Storage</h2>

    <div class="setting-row">
      <div class="setting-label">
        Project Storage
        <small>Store notes per-project instead of globally (~/.adrai/[project]/)</small>
      </div>
      <input type="checkbox" id="projectStorage" ${settings.projectStorage ? 'checked' : ''}>
    </div>
  </div>

  ${settings.hasGit ? `<div class="setting-group">
    <h2>Git Integration</h2>
    ${gitSettingsHtml}
  </div>` : ''}

  <div class="setting-group">
    <h2>Quick Note (Ctrl+Shift+B)</h2>

    <div class="setting-row">
      <div class="setting-label">
        Default Type
        <small>Type used when no punctuation detected</small>
      </div>
      <select id="quickNoteDefaultType">
        <option value="idea" ${settings.quickNoteDefaultType === 'idea' ? 'selected' : ''}>Idea</option>
        <option value="bookmark" ${settings.quickNoteDefaultType === 'bookmark' ? 'selected' : ''}>Bookmark</option>
        <option value="uncertainty" ${settings.quickNoteDefaultType === 'uncertainty' ? 'selected' : ''}>Uncertainty</option>
        <option value="question" ${settings.quickNoteDefaultType === 'question' ? 'selected' : ''}>Question</option>
        <option value="concern" ${settings.quickNoteDefaultType === 'concern' ? 'selected' : ''}>Concern</option>
        <option value="pre-debate" ${settings.quickNoteDefaultType === 'pre-debate' ? 'selected' : ''}>Pre-debate</option>
      </select>
    </div>

    <div class="setting-row">
      <div class="setting-label">
        Default Status
        <small>Initial status for quick notes</small>
      </div>
      <select id="quickNoteDefaultStatus">
        <option value="open" ${settings.quickNoteDefaultStatus === 'open' ? 'selected' : ''}>Open</option>
        <option value="investigating" ${settings.quickNoteDefaultStatus === 'investigating' ? 'selected' : ''}>Investigating</option>
        <option value="promote" ${settings.quickNoteDefaultStatus === 'promote' ? 'selected' : ''}>Promote</option>
      </select>
    </div>
  </div>

  <div class="about-section">
    <img src="${settings.iconUri}" alt="adrai" width="64" height="64" style="margin-bottom: 0.5em;">
    <div class="about-logo">adrai Review Notes</div>
    <div>by <a href="https://github.com/sprantic" target="_blank">sprantic</a></div>
    <div style="margin-top: 0.5em;">
      <a href="https://github.com/sprantic/adrai" target="_blank">GitHub</a> |
      <a href="https://github.com/sprantic/adrai/blob/main/LICENSE" target="_blank">MIT License</a>
    </div>
    <div style="margin-top: 0.5em; font-size: 0.9em;">v0.8.2</div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    const groupBySelect = document.getElementById('groupBy');
    const sortBySelect = document.getElementById('sortBy');

    // Handle mutual exclusion by auto-switching the other select
    function handleGroupByChange(newGroupBy) {
      // If sortBy matches new groupBy, switch sortBy to something else
      if (sortBySelect.value === newGroupBy) {
        // Switch to date as safe default, or the other non-matching option
        if (newGroupBy === 'status') {
          sortBySelect.value = 'type';
        } else if (newGroupBy === 'type') {
          sortBySelect.value = 'status';
        }
        // Save the auto-switched value
        vscode.postMessage({
          command: 'updateSetting',
          key: 'sortBy',
          value: sortBySelect.value
        });
      }
    }

    function handleSortByChange(newSortBy) {
      // If groupBy matches new sortBy (and it's not file), switch groupBy
      if (groupBySelect.value === newSortBy && newSortBy !== 'file') {
        // Switch to the other option (not file, as file is never auto-selected)
        if (newSortBy === 'status') {
          groupBySelect.value = 'type';
        } else if (newSortBy === 'type') {
          groupBySelect.value = 'status';
        }
        // Save the auto-switched value
        vscode.postMessage({
          command: 'updateSetting',
          key: 'groupBy',
          value: groupBySelect.value
        });
      }
    }

    // Handle checkbox changes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        vscode.postMessage({
          command: 'updateSetting',
          key: e.target.id,
          value: e.target.checked
        });
      });
    });

    // Handle select changes
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', (e) => {
        const key = e.target.id;
        const value = e.target.value;

        // Handle mutual exclusion
        if (key === 'groupBy') {
          handleGroupByChange(value);
        } else if (key === 'sortBy') {
          handleSortByChange(value);
        }

        // Save the changed value
        vscode.postMessage({
          command: 'updateSetting',
          key: key,
          value: value
        });
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Dispose the panel
   */
  public dispose(): void {
    SettingsPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
