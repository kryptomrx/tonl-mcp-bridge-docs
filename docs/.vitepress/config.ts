import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'TONL-MCP Bridge',
  description: 'Database adapters and tooling for TONL format',
  
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/sqlite' },
      { text: 'Roadmap', link: '/roadmap' }, 
      { text: 'GitHub', link: 'https://github.com/kryptomrx/tonl-mcp-bridge' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'TONL Format', link: '/guide/tonl-format' },
            { text: 'Type System', link: '/guide/type-system' },
            { text: 'Token Savings', link: '/guide/token-savings' }
          ]
        },
        {
          text: 'CLI & Analytics',
          items: [
            { text: 'CLI Reference', link: '/guide/cli-reference' },
            { text: 'ROI Calculator', link: '/guide/roi-calculator' },
            { text: 'Visual Dashboard', link: '/guide/visual-dashboard' },
            { text: 'Live MCP Monitoring', link: '/guide/live-monitoring' },
            { text: 'Keyboard Shortcuts', link: '/guide/keyboard-shortcuts' },
            { text: 'Responsive Layouts', link: '/guide/responsive-layouts' },
            { text: 'Output Formats', link: '/guide/output-formats' },
            { text: 'CI/CD Integration', link: '/guide/ci-cd-integration' }
          ]
        },
        {
          text: 'Production Features',
          items: [
            { text: 'Claude Desktop Integration', link: '/guide/claude-desktop' },
            { text: 'MCP Server', link: '/guide/mcp-server' },
            { text: 'Docker Deployment', link: '/guide/docker' },
            { text: 'Production Deployment', link: '/guide/deployment' },
            { text: 'Privacy & Compliance', link: '/guide/privacy' }
          ]
        },
        {
          text: 'Database Adapters',
          items: [
            { text: 'SQLite', link: '/guide/sqlite' },
            { text: 'PostgreSQL', link: '/guide/postgres' },
            { text: 'MySQL', link: '/guide/mysql' }
          ]
        },
        {
          text: 'Vector Databases',
          items: [
            { text: 'MongoDB Atlas', link: '/guide/mongodb' },
            { text: 'Pinecone', link: '/guide/pinecone' },
            { text: 'Weaviate', link: '/guide/weaviate' },
            { text: 'Qdrant', link: '/guide/qdrant' },
            { text: 'Milvus', link: '/guide/milvus' }
          ]
        },
        {
          text: 'Advanced Tools',
          items: [
            { text: 'Query Analyzer', link: '/guide/query-analyzer' },
            { text: 'Batch Operations', link: '/guide/batch' },
            { text: 'Schema Drift', link: '/guide/schema-drift' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core Functions', link: '/api/core' },
            { text: 'SQL Adapters', link: '/api/sql' },
            { text: 'Vector Adapters', link: '/api/vector' },
            { text: 'MCP Server', link: '/api/server' },
            { text: 'Types', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'SQLite', link: '/examples/sqlite' },
            { text: 'PostgreSQL', link: '/examples/postgres' },
            { text: 'Batch Queries', link: '/examples/batch' },
            { text: 'RAG with Qdrant', link: '/examples/qdrant' },
            { text: 'RAG with Milvus', link: '/examples/milvus' },
            { text: 'Claude Desktop', link: '/examples/claude-desktop' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kryptomrx/tonl-mcp-bridge' }
    ],

    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2025 kryptomrx'
    }
  }
});
