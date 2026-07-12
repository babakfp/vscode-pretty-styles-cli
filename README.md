# VS Code Pretty Styles

Uses `editor.formatOnSave` for Workbench, and bring your own CSS to customize Workbench UI.

## How it works

This application modifies vsCode installation files. It doesn't make any breaking or unexpected changes. You can easily revert all the changes back.

## Guide

Use without installing:

    Apply changes:

    ```bash
    npx vscode-pretty-styles
    ```

    Revert changes:

    ```bash
    npx vscode-pretty-styles revert
    ```

Install globally:

    ```bash
    npm i -g vscode-pretty-styles
    ```

    Apply changes:

    ```bash
    vscode-pretty-styles
    ```

    Revert changes:

    ```bash
    vscode-pretty-styles revert
    ```

## Files

Directory: `<HOME>/vscode-pretty-styles`

    Example: `C:\Users\Babak\vscode-pretty-styles`

Files:

- `workbench.css`
- `markdown-iframe.css`

## How to open dev tools?

1. Press `ctrl` + `shift` + `p`.
2. Select "Toggle Developer Tools".

## CSS variables

- `--vscode-pretty-styles-font-family`.

## Limitations

- Works only on Windows.
- Works only on my system.
- May not work on your computer.

## Modified vsCode files

Files that are modify to get things working:

- `C:\Users\Babak\AppData\Local\Programs\Microsoft VS Code\resources\app\out\vs\workbench\workbench.desktop.main.css`
- `C:\Users\Babak\AppData\Local\Programs\Microsoft VS Code\resources\app\out\vs\workbench\workbench.desktop.main.js`
