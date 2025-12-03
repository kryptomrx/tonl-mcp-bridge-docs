# Weaviate

Weaviate is an open-source vector database with support for cloud and self-hosted deployments. The TONL-MCP Bridge Weaviate adapter provides seamless integration with TONL conversion.

## Installation

```bash
npm install tonl-mcp-bridge weaviate-client
```

## Basic Usage

```typescript
import { WeaviateAdapter } from 'tonl-mcp-bridge';

// Cloud deployment
const adapter = new WeaviateAdapter({
  url: 'https://your-cluster.weaviate.network',
  apiKey: process.env.WEAVIATE_API_KEY
});

// Local deployment
const adapter = new WeaviateAdapter({
  host: 'localhost',
  scheme: 'http'
});

await adapter.connect();

// Search and convert to TONL
const results = await adapter.search('Article', embedding, {
  limit: 10
});

// With statistics
const { tonl, stats } = await adapter.searchWithStats('Article', embedding, {
  limit: 10,
  model: 'gpt-4o'
});

console.log(`Saved ${stats.savingsPercent}% tokens`);

await adapter.disconnect();
```

## Configuration Options

```typescript
// Weaviate Cloud
const adapter = new WeaviateAdapter({
  url: 'https://cluster.weaviate.network',
  apiKey: 'your-api-key'
});

// Self-hosted
const adapter = new WeaviateAdapter({
  host: 'localhost',
  scheme: 'http'  // or 'https'
});

// Custom host and port
const adapter = new WeaviateAdapter({
  host: 'weaviate.example.com',
  scheme: 'https'
});
```

## Search Options

```typescript
await adapter.search('Article', embedding, {
  limit: 10,
  minScore: 0.7  // Minimum similarity score
});
```

## Weaviate Setup

1. **Choose Deployment**:
   - [Weaviate Cloud](https://console.weaviate.cloud/) - Fully managed
   - [Docker](https://weaviate.io/developers/weaviate/installation/docker-compose) - Self-hosted
   - [Kubernetes](https://weaviate.io/developers/weaviate/installation/kubernetes) - Production

2. **Create Schema**:
```python
# Example: Create Article class
client.schema.create_class({
    "class": "Article",
    "vectorizer": "text2vec-openai",  # or other vectorizer
    "properties": [
        {
            "name": "title",
            "dataType": ["text"]
        },
        {
            "name": "content",
            "dataType": ["text"]
        },
        {
            "name": "category",
            "dataType": ["text"]
        }
    ]
})
```

3. **Import Data**:
```python
# Use Weaviate client for imports
client.batch.configure(batch_size=100)
with client.batch as batch:
    for obj in objects:
        batch.add_data_object(
            data_object=obj,
            class_name="Article"
        )

# Then search with TONL adapter
const adapter = new WeaviateAdapter({...});
const results = await adapter.searchToTonl('Article', queryEmbedding);
```

## Weaviate Features

- **Automatic Vectorization**: Built-in text2vec modules
- **Hybrid Search**: Combine vector and keyword search
- **Multi-tenancy**: Isolated data per tenant
- **Generative Search**: Built-in LLM integration
- **GraphQL API**: Flexible querying

## Docker Quick Start

```bash
# Start Weaviate locally
docker run -d \
  -p 8080:8080 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  semitechnologies/weaviate:latest

# Use with TONL adapter
const adapter = new WeaviateAdapter({
  host: 'localhost',
  scheme: 'http'
});
```

## Best Practices

1. **Choose Right Vectorizer** for your data type
2. **Use Multi-tenancy** for SaaS applications
3. **Configure Replication** for high availability
4. **Monitor Resource Usage** with Weaviate metrics

## Weaviate vs MongoDB

| Feature | Weaviate | MongoDB |
|---------|----------|---------|
| Vectorization | Built-in | Manual |
| Hybrid Search | Native | Native |
| Setup Complexity | Higher | Lower |
| Nested Objects | No | Yes (60% savings) |
| Already Installed | No | Yes (millions) |

## Next Steps

- [Weaviate Documentation](https://weaviate.io/developers/weaviate) - Official docs
- [MongoDB Guide](/guide/mongodb) - Compare alternatives
- [ROI Calculator](/guide/roi-calculator) - Calculate savings
