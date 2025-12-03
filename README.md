# TONL-MCP Bridge Documentation

Professional documentation for TONL-MCP Bridge - database adapters, visual analytics, and production tooling for token-optimized data transmission.

## Overview

This documentation covers:

- **Getting Started** - Installation, quick start, and basic concepts
- **CLI Tools** - Command reference, visual dashboard, output formats
- **Database Integration** - SQL and vector database adapters
- **Production Deployment** - CI/CD integration, Docker, MCP server
- **API Reference** - Complete programmatic API documentation

## Documentation Structure

```
docs/
├── guide/              # User guides and tutorials
│   ├── getting-started.md
│   ├── cli-reference.md
│   ├── visual-dashboard.md
│   ├── output-formats.md
│   ├── ci-cd-integration.md
│   └── ...
├── api/                # API reference documentation
│   ├── core.md
│   ├── sql.md
│   └── vector.md
└── examples/           # Real-world usage examples
    ├── sqlite.md
    ├── postgres.md
    └── ...
```

## Recent Updates (v1.0.0)

### New Documentation

- **CLI Reference** - Complete command documentation with all flags and options
- **Visual Dashboard** - Terminal UI guide for presentations and demos
- **Output Formats** - JSON, Markdown, and CSV export documentation
- **CI/CD Integration** - GitHub Actions, GitLab CI, Jenkins examples

### Updated Documentation

- **Getting Started** - Added v1.0.0 features and CLI quickstart
- **ROI Calculator** - Multi-currency support and new output formats
- **Quick Start** - Visual dashboard and analysis examples

## Building the Documentation

### Prerequisites

```bash
npm install
```

### Development Server

```bash
npm run docs:dev
```

Visit `http://localhost:5173` to view the documentation.

### Production Build

```bash
npm run docs:build
```

Output will be in `docs/.vitepress/dist/`.

### Preview Production Build

```bash
npm run docs:preview
```

## Documentation Standards

### File Organization

- Use kebab-case for file names: `visual-dashboard.md`
- Place images in `docs/public/`
- Keep related content in logical sections

### Writing Style

- Professional tone without excessive emojis
- Clear, concise language
- Code examples for every feature
- Real-world use cases

### Code Examples

Use consistent formatting:

```bash
# CLI examples with comments
tonl analyze data.json --visual
```

```typescript
// TypeScript examples with types
import { MongoDBAdapter } from 'tonl-mcp-bridge';

const db = new MongoDBAdapter({ uri: '...' });
```

### Sections Structure

1. **Overview** - Brief introduction
2. **Features** - Key capabilities
3. **Usage** - Basic examples
4. **Advanced** - Complex scenarios
5. **Troubleshooting** - Common issues
6. **Next Steps** - Related documentation

## Contributing

### Adding New Pages

1. Create markdown file in appropriate directory
2. Add to sidebar in `docs/.vitepress/config.ts`
3. Link from related pages
4. Include in navigation if needed

### Updating Existing Pages

1. Maintain existing structure
2. Add new sections at appropriate locations
3. Update examples with current syntax
4. Check all internal links

### Testing Changes

```bash
# Start dev server
npm run docs:dev

# Test all links
npm run docs:build

# Preview production
npm run docs:preview
```

## Deployment

Documentation is automatically deployed via:

- GitHub Pages
- Netlify
- Vercel

Configuration in `.github/workflows/` (if using GitHub Pages).

## Maintenance

### Regular Updates

- Update version numbers when releasing
- Add new features to relevant guides
- Keep examples up-to-date with API changes
- Review and fix broken links

### Versioning

Documentation versions align with package versions:

- `v1.0.0` - Current stable
- `v0.9.0` - Previous release
- `next` - Development branch

## Support

- **Issues**: [GitHub Issues](https://github.com/kryptomrx/tonl-mcp-bridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kryptomrx/tonl-mcp-bridge/discussions)
- **Updates**: [Changelog](../CHANGELOG.md)

## License

Documentation is MIT licensed, same as the project.
