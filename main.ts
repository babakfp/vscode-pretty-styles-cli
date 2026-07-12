#!/usr/bin/env node
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { styleText as s } from "node:util"
import JSONC from "tiny-jsonc"
import pkg from "./package.json" with { type: "json" }

console.clear()

console.log(pkg.name, s("gray", `v${pkg.version}`))

if (os.platform() !== "win32") {
    console.error(s("red", "Works only on Windows!"))
    process.exit(1)
}

const homeDir = os.homedir()
if (!homeDir) {
    console.error(s("red", "Failed to locate Home directory!"))
    process.exit(1)
}

const assetsDir = path.join(homeDir, pkg.name)
const workbenchCssPath = path.join(assetsDir, "workbench.css")
const markdownIframeCssPath = path.join(assetsDir, "markdown-iframe.css")

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir)
    console.log(s("green", `Created ${s(["blue", "underline"], assetsDir)}`))
}
if (!fs.existsSync(workbenchCssPath)) {
    fs.writeFileSync(workbenchCssPath, "")
    console.log(
        s("green", `Created ${s(["blue", "underline"], workbenchCssPath)}`),
    )
}
if (!fs.existsSync(markdownIframeCssPath)) {
    fs.writeFileSync(markdownIframeCssPath, "")
    console.log(
        s("green", `Created ${s(["blue", "underline"], workbenchCssPath)}`),
    )
}

const args = process.argv.slice(2)

updateVsCodeStyles(homeDir, {
    editorFontFamily: readEditorFontFamily(),
    workbenchCSS: fs.readFileSync(workbenchCssPath, "utf-8"),
    markdownIframeCss: fs.readFileSync(markdownIframeCssPath, "utf-8"),
    revert: args.includes("revert"),
})

function readEditorFontFamily(): string {
    const winAppDataDir = process.env.APPDATA // C:\Users\Babak\AppData\Roaming
    if (!winAppDataDir) return ""

    const filePath = path.join(winAppDataDir, "Code/User/settings.json")
    if (!fs.existsSync(filePath)) return ""

    const content = fs.readFileSync(filePath, "utf-8")
    const settings = JSONC.parse(content) as {
        "editor.fontFamily"?: string
    }

    return settings?.["editor.fontFamily"] ?? ""
}

function updateVsCodeStyles(
    homeDir: string,
    options?: {
        editorFontFamily?: string
        workbenchCSS?: string
        markdownIframeCss?: string
        revert?: boolean
    },
): void {
    const vscodeRootDir = path.join(
        homeDir,
        "AppData/Local/Programs/Microsoft VS Code",
    )
    const vscodeDir = resolveVsCodeDir(vscodeRootDir)
    if (!vscodeDir) {
        console.error(
            s(
                "red",
                `Failed to locate VS Code installation in ${s("blue", `"${vscodeRootDir}"`)}!`,
            ),
        )
        process.exit(1)
    }
    const workbenchDir = path.join(vscodeDir, "resources/app/out/vs/workbench")

    const cssPath = path.join(workbenchDir, "workbench.desktop.main.css")
    const cssBackupPath = path.join(
        workbenchDir,
        "workbench.desktop.main.backup.css",
    )

    const jsPath = path.join(workbenchDir, "workbench.desktop.main.js")
    const jsBackupPath = path.join(
        workbenchDir,
        "workbench.desktop.main.backup.js",
    )

    if (options?.revert) {
        if (!fs.existsSync(cssBackupPath) && !fs.existsSync(jsBackupPath)) {
            console.log(s("gray", "All done!"))
            process.exit(1)
        }

        // CSS
        fs.copyFileSync(cssBackupPath, cssPath)
        fs.rmSync(cssBackupPath)

        // JS
        fs.copyFileSync(jsBackupPath, jsPath)
        fs.rmSync(jsBackupPath)

        console.log(s("green", "All done!"))

        process.exit()
    }

    // CSS

    if (!fs.existsSync(cssPath)) {
        console.error(
            s("red", `Failed to locate ${s("blue", `"${cssPath}"`)}!`),
        )
        process.exit(1)
    }

    if (!fs.existsSync(cssBackupPath)) {
        fs.copyFileSync(cssPath, cssBackupPath)
    }

    // JS

    if (!fs.existsSync(jsPath)) {
        console.error(s("red", `Failed to locate ${s("blue", `"${jsPath}"`)}!`))
        process.exit(1)
    }

    if (!fs.existsSync(jsBackupPath)) {
        fs.copyFileSync(jsPath, jsBackupPath)
    }

    // ---

    let cssContent = fs.readFileSync(cssBackupPath, "utf-8")
    let jsContent = fs.readFileSync(jsBackupPath, "utf-8")

    if (options?.editorFontFamily) {
        // CSS

        const customCssVariables = `
            :root {
                --vscode-pretty-styles-font-family: ${options.editorFontFamily};
            }
        `

        cssContent = customCssVariables + cssContent

        cssContent = cssContent.replace(
            "Segoe WPC,Segoe UI,sans-serif",
            `var(--vscode-pretty-styles-font-family)`,
        )

        cssContent += `
            .composite.viewlet .scm-editor-placeholder,
            .composite.viewlet .view-lines.monaco-mouse-cursor-text,
            .editorPlaceholder {
                font-family: var(--vscode-pretty-styles-font-family) !important;
            }
        `

        // JS

        jsContent = jsContent
            .replaceAll(
                `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`,
                options.editorFontFamily,
            )
            .replaceAll(
                `"Segoe WPC", "Segoe UI", sans-serif`,
                options.editorFontFamily,
            )
    }

    if (options?.workbenchCSS) {
        cssContent += "\n" + options.workbenchCSS
    }

    if (options?.markdownIframeCss) {
        const searchValue = [
            `@media (forced-colors: active) and (prefers-color-scheme: dark){`,
            `	body {`,
            `		forced-color-adjust: none;`,
            `	}`,
            `}`,
        ].join("\n")
        jsContent = jsContent.replace(
            searchValue,
            `${searchValue}\n${options.markdownIframeCss}`,
        )
    }

    fs.writeFileSync(cssPath, cssContent, "utf-8")
    fs.writeFileSync(jsPath, jsContent, "utf-8")

    console.log(s("green", "All done!"))

    process.exit()
}

function resolveVsCodeDir(vscodeRootDir: string): string | null {
    const directResourcesPath = path.join(vscodeRootDir, "resources/app")
    if (fs.existsSync(directResourcesPath)) {
        return vscodeRootDir
    }

    for (const entry of fs.readdirSync(vscodeRootDir, {
        withFileTypes: true,
    })) {
        if (!entry.isDirectory()) continue
        const candidate = path.join(vscodeRootDir, entry.name)
        const candidateResourcesPath = path.join(candidate, "resources/app")
        if (fs.existsSync(candidateResourcesPath)) {
            return candidate
        }
    }

    return null
}
