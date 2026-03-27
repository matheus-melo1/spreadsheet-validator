# spreadsheet-validator

Um componente React para validar e exibir arquivos Excel (XLSX) e CSV com validacao de schema usando [Zod](https://zod.dev/).

[![npm version](https://img.shields.io/npm/v/spreadsheet-validator.svg)](https://www.npmjs.com/package/spreadsheet-validator)

[![Documentacao](https://img.shields.io/badge/Documentacao-spreadsheet--validator.vercel.app-blue?style=for-the-badge)](https://spreadsheet-validator.vercel.app/)

> [Read in English](./README.md)

## Funcionalidades

- **Validacao com Zod Schema** — validacao type-safe com destaque de erros por celula
- **Suporte a XLSX e CSV** — leitura de planilhas com conversao automatica de datas
- **Virtual Scrolling** — suporta 100k+ linhas sem problemas de performance
- **Validacao em Web Worker** — validacao fora da thread principal
- **Estilizacao Customizavel** — controle total da aparencia via prop `styleTable`
- **Tooltips por Coluna** — informacoes contextuais para cada coluna

## Instalacao

```bash
npm install spreadsheet-validator xlsx zod
# ou
pnpm add spreadsheet-validator xlsx zod
```

> `xlsx` e opcional — so e necessario para ler arquivos `.xlsx`. Para uso apenas com CSV, pode pular:
> ```bash
> npm install spreadsheet-validator zod
> ```

## Inicio Rapido

```tsx
import { useState } from "react";
import { z } from "zod";
import { TableReader } from "spreadsheet-validator";
import "spreadsheet-validator/style.css";

const schema = z.object({
  nome: z.string(),
  email: z.email(),
  idade: z.number().min(0),
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

## Referencia da API

### `<TableReader<T> />`

| Prop | Tipo | Padrao | Descricao |
|------|------|--------|-----------|
| `file` | `File \| null` | — | O arquivo de planilha para ler e validar |
| `schema` | `ZodObject<T>` | — | Schema Zod para validacao |
| `errorIssuesLog` | `(errors: ErrorLog[] \| undefined) => void` | — | Callback com os erros de validacao |
| `onTableData` | `(data: T[]) => void` | — | Callback com os dados validados |
| `columnInfo` | `{ name: keyof T; message: string }[]` | — | Informacoes de tooltip para cada coluna |
| `styleTable` | `StyleTable` | — | Estilizacao customizada da tabela |
| `rowHeight` | `number` | `36` | Altura da linha em pixels |
| `overscan` | `number` | `5` | Linhas extras renderizadas fora da area visivel |
| `containerHeight` | `number` | `600` | Altura do container da tabela em pixels |
| `loadingComponent` | `React.ReactNode` | — | Indicador de carregamento customizado |

### `StyleTable`

```typescript
interface StyleTable {
  backgroundColor?: string;     // Cor de fundo do corpo da tabela
  borderColor?: string;         // Cor da borda das celulas
  headerColor?: string;         // Cor de fundo do header
  textColor?: string;           // Cor do texto
  tableBorderColor?: string;    // Cor da borda externa da tabela
  tableBorderRadius?: string;   // Border radius externo da tabela
  fontFamilyTable?: string;     // Fonte do corpo da tabela
  fontFamilyHeader?: string;    // Fonte do header
  paddingCell?: string;         // Padding das celulas
  paddingHeader?: string;       // Padding do header
}
```

### `ErrorLog`

Estende o `$ZodIssue` do Zod com contexto da planilha:

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

## Estilizacao

Importe o stylesheet padrao:

```tsx
import "spreadsheet-validator/style.css";
```

Customize a aparencia da tabela com a prop `styleTable`:

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

## Documentacao

A documentacao completa com exemplos interativos esta disponivel em:

**[https://spreadsheet-validator.vercel.app](https://spreadsheet-validator.vercel.app/)**

O site de documentacao inclui:

- **Getting Started** — instalacao e configuracao basica
- **Core Concepts** — validacao de schema, tratamento de upload de arquivos
- **API Reference** — documentacao completa de props e tipos
- **Exemplos Interativos** — playground ao vivo com datasets reais (100k+ linhas, dados financeiros, dados estatisticos)

## Contribuindo

```bash
# Clone o repositorio
git clone https://github.com/matheus-melo1/spreadsheet-validator.git
cd spreadsheet-validator

# Instale as dependencias
pnpm install

# Build da biblioteca
pnpm build

# Modo watch para desenvolvimento
pnpm dev
```

**Stack:** React, TypeScript, Vite, Zod

## Licenca

MIT
