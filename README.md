# spreadsheet-validator

A React component for validating and displaying Excel (XLSX) and CSV files with [Zod](https://zod.dev/) schema validation.

[![npm version](https://img.shields.io/npm/v/spreadsheet-validator.svg)](https://www.npmjs.com/package/spreadsheet-validator)

[![Documentation](https://img.shields.io/badge/Documentation-spreadsheet--validator.vercel.app-blue?style=for-the-badge)](https://spreadsheet-validator.vercel.app/)

> [Leia em Portugues](./README.pt-BR.md)

## Features

- **Zod Schema Validation** — type-safe validation with per-cell error highlighting
- **XLSX & CSV Support** — parse spreadsheets with automatic date conversion
- **Virtualized Scrolling** — handles 100k+ rows without performance issues
- **Web Worker Validation** — validates data off the main thread
- **Custom Styling** — full control over table appearance via `styleTable` prop
- **Column Info Tooltips** — contextual guidance for each column

## Installation

```bash
npm install spreadsheet-validator xlsx zod
# or
pnpm add spreadsheet-validator xlsx zod
```

> `xlsx` is optional — only needed if you want to read `.xlsx` files. For CSV-only usage, you can skip it:
> ```bash
> npm install spreadsheet-validator zod
> ```

## Quick Start

```tsx
import { useState } from "react";
import { z } from "zod";
import { TableReader } from "spreadsheet-validator";
import "spreadsheet-validator/style.css";

const schema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number().min(0),
});

function App() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <TableReader
        file={file}
        schema={schema}
        errorIssuesLog={(errors) => console.log(errors)}
        onTableData={(data) => console.log(data)}
      />
    </div>
  );
}
```

## API Reference

### `<TableReader<T> />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `File \| null` | — | The spreadsheet file to read and validate |
| `schema` | `ZodObject<T>` | — | Zod schema for validation |
| `errorIssuesLog` | `(errors: ErrorLog[] \| undefined) => void` | — | Callback with validation errors |
| `onTableData` | `(data: T[]) => void` | — | Callback with validated data |
| `columnInfo` | `{ name: keyof T; message: string }[]` | — | Tooltip info for each column |
| `styleTable` | `StyleTable` | — | Custom table styling |
| `rowHeight` | `number` | `36` | Row height in pixels |
| `overscan` | `number` | `5` | Extra rows rendered outside the visible area |
| `containerHeight` | `number` | `600` | Table container height in pixels |
| `loadingComponent` | `React.ReactNode` | — | Custom loading indicator |

### `StyleTable`

```typescript
interface StyleTable {
  backgroundColor?: string;     // Table body background
  borderColor?: string;         // Cell border color
  headerColor?: string;         // Header background color
  textColor?: string;           // Text color
  tableBorderColor?: string;    // Outer table border color
  tableBorderRadius?: string;   // Outer table border radius
  fontFamilyTable?: string;     // Body font family
  fontFamilyHeader?: string;    // Header font family
  paddingCell?: string;         // Cell padding
  paddingHeader?: string;       // Header padding
}
```

### `ErrorLog`

Extends Zod's `$ZodIssue` with spreadsheet context:

```typescript
type ErrorLog = z.core.$ZodIssue & {
  column?: string;
  rowIndex?: number;
};
```

### `ColumnInfo`

```typescript
interface ColumnInfo {
  name: string;
  message: string;
}
```

## Styling

Import the default stylesheet:

```tsx
import "spreadsheet-validator/style.css";
```

Customize the table appearance with the `styleTable` prop:

```tsx
<TableReader
  file={file}
  schema={schema}
  styleTable={{
    headerColor: "#1a1a2e",
    backgroundColor: "#f5f5f5",
    textColor: "#333",
    borderColor: "#ddd",
    tableBorderRadius: "8px",
    fontFamilyHeader: "Inter, sans-serif",
    paddingCell: "8px 12px",
  }}
/>
```

## Documentation

Full documentation with interactive examples is available at:

**[https://spreadsheet-validator.vercel.app](https://spreadsheet-validator.vercel.app/)**

The documentation site includes:

- **Getting Started** — installation and basic setup
- **Core Concepts** — schema validation, file upload handling
- **API Reference** — complete prop and type documentation
- **Interactive Examples** — live playground with real datasets (100k+ rows, financial data, statistical data)

## Contributing

```bash
# Clone the repository
git clone https://github.com/matheus-melo1/spreadsheet-validator.git
cd spreadsheet-validator

# Install dependencies
pnpm install

# Build the library
pnpm build

# Watch mode for development
pnpm dev
```

**Tech stack:** React, TypeScript, Vite, Zod

## License

MIT
