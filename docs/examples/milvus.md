# RAG with Milvus

Complete example of a production RAG system using Milvus and TONL for token optimization.

## Overview

This example shows:
- Setting up Milvus collection
- Generating embeddings with OpenAI
- Inserting documents with metadata
- Semantic search with TONL conversion
- Building LLM prompts with compressed context

## Prerequisites

```bash
npm install tonl-mcp-bridge openai
```

```bash
# Start Milvus
docker run -d --name milvus -p 19530:19530 milvusdb/milvus:latest
```

## Complete Example

```typescript
import { MilvusAdapter } from 'tonl-mcp-bridge/sdk/vector';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const milvus = new MilvusAdapter({
  address: 'localhost:19530',
  username: 'root',
  password: 'milvus'
});

// 1. Initialize: Create collection
async function initialize() {
  await milvus.connect();
  
  // Create collection for text-embedding-3-small (1536 dimensions)
  await milvus.createCollection('knowledge_base', 1536, 'COSINE');
  
  console.log('✅ Collection created');
}

// 2. Index documents
async function indexDocuments() {
  const documents = [
    {
      id: 1,
      text: 'TONL format reduces LLM token usage by 40-60% compared to JSON',
      category: 'performance',
      source: 'docs'
    },
    {
      id: 2,
      text: 'Milvus supports billion-scale vector search with millisecond latency',
      category: 'database',
      source: 'docs'
    },
    {
      id: 3,
      text: 'RAG combines retrieval and generation for more accurate AI responses',
      category: 'ai',
      source: 'blog'
    },
    {
      id: 4,
      text: 'Vector databases enable semantic search beyond keyword matching',
      category: 'database',
      source: 'blog'
    }
  ];
  
  for (const doc of documents) {
    // Generate embedding
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: doc.text
    });
    
    // Insert with metadata
    await milvus.insert('knowledge_base', [{
      vector: embedding.data[0].embedding,
      id: doc.id,
      text: doc.text,
      category: doc.category,
      source: doc.source
    }]);
  }
  
  console.log(`✅ Indexed ${documents.length} documents`);
}

// 3. Query with TONL
async function query(question: string) {
  console.log(`\n🔍 Question: ${question}`);
  
  // Generate query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
  });
  
  // Search with TONL conversion
  const result = await milvus.searchToTonl(
    'knowledge_base',
    queryEmbedding.data[0].embedding,
    {
      limit: 3,
      outputFields: ['id', 'text', 'category', 'source'],
      model: 'gpt-4'
    }
  );
  
  console.log('\n📊 Search Results (TONL):');
  console.log(result.tonl);
  
  console.log('\n💰 Token Savings:');
  console.log(`  Original: ${result.stats.originalTokens} tokens`);
  console.log(`  Compressed: ${result.stats.compressedTokens} tokens`);
  console.log(`  Saved: ${result.stats.savedTokens} tokens (${result.stats.savingsPercent}%)`);
  
  return result;
}

// 4. Generate answer with LLM
async function generateAnswer(question: string, context: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Answer based on the provided context in TONL format.'
      },
      {
        role: 'user',
        content: `Context (TONL format):\n${context}\n\nQuestion: ${question}`
      }
    ]
  });
  
  return response.choices[0].message.content;
}

// 5. Complete RAG pipeline
async function rag(question: string) {
  await milvus.connect();
  
  // Search and get TONL context
  const result = await query(question);
  
  // Generate answer
  const answer = await generateAnswer(question, result.tonl);
  
  console.log('\n🤖 Answer:');
  console.log(answer);
  
  await milvus.disconnect();
  
  return {
    answer,
    stats: result.stats
  };
}

// Run example
async function main() {
  try {
    // Setup
    await initialize();
    await indexDocuments();
    
    // Query examples
    await rag('How much can TONL reduce token usage?');
    await rag('What is a vector database?');
    await rag('Explain RAG systems');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Output Example

```
🔍 Question: How much can TONL reduce token usage?

📊 Search Results (TONL):
results[3]{id:i32,text:str,category:str,source:str,score:f32}:
  1, "TONL format reduces LLM token usage by 40-60% compared to JSON", performance, docs, 0.94
  4, "Vector databases enable semantic search beyond keyword matching", database, blog, 0.72
  3, "RAG combines retrieval and generation for more accurate AI responses", ai, blog, 0.68

💰 Token Savings:
  Original: 142 tokens
  Compressed: 67 tokens
  Saved: 75 tokens (52.8%)

🤖 Answer:
TONL format can reduce LLM token usage by 40-60% compared to traditional JSON format. This significant reduction helps optimize costs and performance in AI applications.
```

## Advanced: Filtering

Filter by metadata during search:

```typescript
const result = await milvus.searchToTonl(
  'knowledge_base',
  queryVector,
  {
    limit: 5,
    filter: 'category == "database" && source == "docs"',
    outputFields: ['text', 'category']
  }
);
```

## Advanced: Batch Queries

Process multiple questions efficiently:

```typescript
const questions = [
  'What is TONL?',
  'How does Milvus work?',
  'Explain RAG'
];

const results = await Promise.all(
  questions.map(q => query(q))
);

const totalSavings = results.reduce(
  (sum, r) => sum + r.stats.savingsPercent, 
  0
) / results.length;

console.log(`Average savings: ${totalSavings.toFixed(1)}%`);
```

## Cost Comparison

**Without TONL (JSON):**
```
3 results × 47 tokens each = 141 tokens
Cost: $0.00042 (GPT-4 input)
```

**With TONL:**
```
3 results compressed = 67 tokens
Cost: $0.00020 (GPT-4 input)
Savings: 52.8% = $0.00022 per query
```

**At scale (1M queries/month):**
- Without TONL: $420
- With TONL: $200
- **Monthly savings: $220**

## Best Practices

1. **Batch embeddings** - Generate multiple embeddings in one API call
2. **Cache frequent queries** - Store common query results
3. **Use filters** - Reduce search space with metadata filters
4. **Monitor savings** - Track token reduction metrics
5. **Adjust limit** - Balance context size vs relevance

## Troubleshooting

**Milvus connection fails:**
```bash
docker ps  # Check Milvus is running
docker logs milvus  # Check Milvus logs
```

**Low token savings:**
- Increase `limit` for more results
- Check if results have varied fields
- Ensure consistent schema

**Empty results:**
- Verify collection has data
- Check embedding dimensions match
- Try different similarity metrics

## Next Steps

- [Milvus Guide](../guide/milvus.md) - Full API reference
- [Privacy Guide](../guide/privacy.md) - Anonymize sensitive data
- [Token Savings](../guide/token-savings.md) - Optimize further

## Related Examples

- [Qdrant RAG](./qdrant.md) - Alternative vector database
- [Batch Operations](./batch.md) - Parallel queries