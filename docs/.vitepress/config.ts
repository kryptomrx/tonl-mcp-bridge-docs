import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'TONL-MCP Bridge',
  description: 'Production-grade token optimization with streaming, privacy, and real-time monitoring',
  
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
          text: 'v1.0.0 Features',
          items: [
            { text: 'Streaming Pipeline', link: '/guide/streaming' },
            { text: 'Privacy & Compliance', link: '/guide/privacy' },
            { text: 'Live Monitoring', link: '/guide/live-monitoring' },
            { text: 'Health Checks', link: '/guide/health-checks' }
          ]
        },
        {
          text: 'CLI & Analytics',
          items: [
            { text: 'CLI Reference', link: '/guide/cli-reference' },
            { text: 'Commands Reference', link: '/guide/commands' },
            { text: 'ROI Calculator', link: '/guide/roi-calculator' },
            { text: 'Visual Dashboard', link: '/guide/visual-dashboard' },
            { text: 'Keyboard Shortcuts', link: '/guide/keyboard-shortcuts' },
            { text: 'Responsive Layouts', link: '/guide/responsive-layouts' },
            { text: 'Output Formats', link: '/guide/output-formats' },
            { text: 'CI/CD Integration', link: '/guide/ci-cd-integration' }
          ]
        },
        {
          text: 'Production Features',
          items: [
            { text: 'MCP Server', link: '/guide/mcp-server' },
            { text: 'Claude Desktop Integration', link: '/guide/claude-desktop' },
            { text: 'Docker Deployment', link: '/guide/docker' },
            { text: 'Kubernetes Deployment', link: '/guide/kubernetes' },
            { text: 'Production Deployment', link: '/guide/deployment' },
            { text: 'Security', link: '/guide/security' }
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
            { text: 'Milvus', link: '/guide/milvus' },
            { text: 'ChromaDB', link: '/guide/chromadb' }
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
            { text: 'Streaming API', link: '/api/streaming' },
            { text: 'Privacy API', link: '/api/privacy' },
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
            { text: 'Streaming Logs', link: '/examples/streaming' },
            { text: 'Privacy Masking', link: '/examples/privacy' },
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
      message: 'MIT Licensed | v1.0.0',
      copyright: 'Copyright © 2025 kryptomrx'
    }
  }
});
