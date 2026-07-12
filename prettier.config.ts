import type { PluginConfig as SortImportsConfig } from "@ianvs/prettier-plugin-sort-imports"
import type { Config as PrettierConfig } from "prettier"

export default {
    semi: false,
    tabWidth: 4,
    experimentalTernaries: true,
    experimentalOperatorPosition: "start",
    plugins: ["@ianvs/prettier-plugin-sort-imports"],
} satisfies PrettierConfig & SortImportsConfig
