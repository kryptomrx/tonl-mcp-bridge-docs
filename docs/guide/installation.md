# Installation

## Requirements

- Node.js 18.x or higher
- npm, yarn, or pnpm

## Package Installation

Install via npm:
```bash
npm install tonl-mcp-bridge
```

Or using yarn:
```bash
yarn add tonl-mcp-bridge
```

Or using pnpm:
```bash
pnpm add tonl-mcp-bridge
```

## Global Installation (CLI)

For command-line tools:
```bash
npm install -g tonl-mcp-bridge
```

This provides access to CLI commands:
- `tonl convert` - Convert files
- `tonl batch` - Batch conversion
- `tonl watch` - Watch mode

## Database Drivers

Depending on your database, install the required driver:

### PostgreSQL
```bash
npm install pg
```

### MySQL
```bash
npm install mysql2
```

### SQLite
SQLite support is built-in. No additional driver needed.

### Qdrant
```bash
docker run -p 6333:6333 qdrant/qdrant
```

## TypeScript Support

TONL includes TypeScript definitions out of the box. No additional @types packages needed.

## Verification

Verify installation:
```typescript
import { jsonToTonl } from 'tonl-mcp-bridge';

const data = [{ id: 1, name: "Test" }];
const tonl = jsonToTonl(data);
console.log(tonl);
```

Expected output:
```
data[1]{id:i8,name:str}:
  1, Test
```

## Troubleshooting

### Module Resolution Errors

If you encounter module resolution errors, ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

### Database Connection Issues

For database adapters, verify:
- Database server is running
- Credentials are correct
- Network access is allowed
- Required driver is installed