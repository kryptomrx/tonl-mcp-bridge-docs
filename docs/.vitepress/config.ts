import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'TONL',
  description: 'Token-optimized format for LLM context windows',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Examples', link: '/examples/sqlite' },
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
          text: 'Database Adapters',
          items: [
            { text: 'SQLite', link: '/guide/sqlite' },
            { text: 'PostgreSQL', link: '/guide/postgres' },
            { text: 'MySQL', link: '/guide/mysql' },
            { text: 'Qdrant', link: '/guide/qdrant' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Batch Operations', link: '/guide/batch' },
            { text: 'Query Analyzer', link: '/guide/query-analyzer' },
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
            { text: 'RAG with Qdrant', link: '/examples/qdrant' }
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