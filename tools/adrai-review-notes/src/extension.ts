/**
 * adrAI Review Notes - VS Code Extension
 *
 * Personal annotation layer for adrAI artifact review with debate promotion.
 *
 * Features:
 * - Sidebar panel showing all notes grouped by status/type/file
 * - Quick note creation at current cursor position
 * - Multi-location linking (one note → multiple files)
 * - Personal storage in ~/.adrai/review-notes.yaml
 * - Promotion workflow to create DEB-NNNN from notes
 */

import * as vscode from 'vscode';
import { NoteStorage } from './noteStorage';
import { NoteProvider } from './noteProvider';
import { registerCommands } from './commands';

/**
 * FileDecorationProvider to color notes based on branch
 * URI format: adrai-note://branchFlag.filterMode/noteId
 * - branchFlag: 'current' or 'other'
 * - filterMode: 'all' (show all branches) or 'filtered' (branch filter on)
 */
class NoteDecorationProvider implements vscode.FileDecorationProvider {
  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    // Only handle our custom scheme
    if (uri.scheme !== 'adrai-note') {
      return undefined;
    }

    // Parse authority: branchFlag.filterMode
    const [branchFlag, filterMode] = uri.authority.split('.');

    // If branch filter is on (filtered mode), no coloring needed
    if (filterMode === 'filtered') {
      return undefined;
    }

    // In show-all mode, color by branch
    if (branchFlag === 'other') {
      return {
        color: new vscode.ThemeColor('adrai.otherBranchForeground'),
        tooltip: 'Note from another branch'
      };
    } else if (branchFlag === 'current') {
      return {
        color: new vscode.ThemeColor('adrai.currentBranchForeground'),
        tooltip: 'Note from current branch'
      };
    }

    return undefined;
  }
}

let storage: NoteStorage;
let provider: NoteProvider;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
  try {
    console.log('adrAI Review Notes extension is activating...');

    // Initialize storage
    storage = new NoteStorage();
    context.subscriptions.push({ dispose: () => storage.dispose() });

    // Initialize tree view provider
    provider = new NoteProvider(storage);

    // Create tree view with multi-select enabled
    const treeView = vscode.window.createTreeView('adraiReviewNotes', {
      treeDataProvider: provider,
      showCollapseAll: true,
      canSelectMany: true
    });
    context.subscriptions.push(treeView);

    // Register commands
    registerCommands(context, storage, provider);

    // Register file decoration provider for colored text
    const decorationProvider = new NoteDecorationProvider();
    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider(decorationProvider)
    );

    // Show welcome message on first use
    const hasShownWelcome = context.globalState.get<boolean>('adrai.shownWelcome');
    if (!hasShownWelcome) {
      showWelcomeMessage(context);
    }

    // Status bar item showing note count
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    statusBarItem.command = 'adrai.showPanel';
    updateStatusBar(statusBarItem, storage);
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Update status bar when notes change
    storage.onChange(() => updateStatusBar(statusBarItem, storage));

    console.log('adrAI Review Notes extension activated');
    vscode.window.showInformationMessage('adrAI Review Notes activated!');
  } catch (error) {
    console.error('adrAI Review Notes activation failed:', error);
    vscode.window.showErrorMessage(`adrAI Review Notes failed to activate: ${error}`);
  }
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  console.log('adrAI Review Notes extension deactivated');
}

/**
 * Update the status bar item with note count
 */
function updateStatusBar(item: vscode.StatusBarItem, storage: NoteStorage): void {
  const notes = storage.getAllNotes();
  const openCount = notes.filter(n => n.status !== 'resolved').length;

  if (openCount > 0) {
    item.text = `$(note) ${openCount} review note${openCount === 1 ? '' : 's'}`;
    item.tooltip = `${openCount} open review note${openCount === 1 ? '' : 's'} - Click to show panel`;
  } else {
    item.text = '$(note) Notes';
    item.tooltip = 'No open review notes - Click to show panel';
  }
}

/**
 * Show welcome message for first-time users
 */
async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
  const action = await vscode.window.showInformationMessage(
    'adrAI Review Notes is ready! Use Ctrl+Shift+N (Cmd+Shift+N on Mac) to add a note at your cursor.',
    'Got it',
    'Show Panel'
  );

  if (action === 'Show Panel') {
    vscode.commands.executeCommand('adraiReviewNotes.focus');
  }

  context.globalState.update('adrai.shownWelcome', true);
}
