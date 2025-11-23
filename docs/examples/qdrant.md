# Qdrant RAG Examples

Vector search and RAG system examples.

## Basic Setup
```typescript
import { QdrantAdapter } from 'tonl-mcp-bridge';
import OpenAI from 'openai';

const openai = new OpenAI();
const db = new QdrantAdapter({
  url: process.env.QDRANT_URL || 'http://localhost:6333'
});

await db.connect();

// Create collection for OpenAI embeddings
await db.createCollection('knowledge_base', 1536);
```

---

## Index Documents
```typescript
const documents = [
  {
    id: 1,
    text: 'TONL reduces LLM token costs by 30-60% through efficient data serialization.',
    category: 'overview'
  },
  {
    id: 2,
    text: 'Install TONL with npm install tonl-mcp-bridge for database integration.',
    category: 'installation'
  },
  {
    id: 3,
    text: 'PostgreSQL adapter provides production-ready connection pooling and transactions.',
    category: 'database'
  }
];

for (const doc of documents) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: doc.text
  });
  
  // Store in Qdrant
  await db.upsert('knowledge_base', [{
    id: doc.id,
    vector: response.data[0].embedding,
    payload: {
      text: doc.text,
      category: doc.category,
      timestamp: Date.now()
    }
  }]);
}

console.log(`Indexed ${documents.length} documents`);
```

---

## Semantic Search
```typescript
async function searchDocuments(query: string) {
  // Generate query embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  // Search with TONL conversion
  const result = await db.searchWithStats(
    'knowledge_base',
    response.data[0].embedding,
    {
      limit: 5,
      scoreThreshold: 0.7,
      model: 'gpt-5'
    }
  );
  
  console.log(`Found ${result.rowCount} documents`);
  console.log(`Saved ${result.stats.savingsPercent}% tokens`);
  
  return result;
}

// Usage
const results = await searchDocuments('How do I install TONL?');
```

---

## RAG Pipeline

Complete RAG implementation:
```typescript
async function ragQuery(userQuestion: string) {
  // Step 1: Generate query embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: userQuestion
  });
  
  // Step 2: Search similar documents
  const searchResult = await db.searchWithStats(
    'knowledge_base',
    embeddingResponse.data[0].embedding,
    {
      limit: 5,
      scoreThreshold: 0.75,
      model: 'gpt-5'
    }
  );
  
  console.log(`Retrieved ${searchResult.rowCount} relevant documents`);
  console.log(`Token savings: ${searchResult.stats.savingsPercent}%`);
  
  // Step 3: Generate answer with context
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Answer the question based on this context:\n' + searchResult.tonl
      },
      {
        role: 'user',
        content: userQuestion
      }
    ]
  });
  
  return {
    answer: completion.choices[0].message.content,
    sources: searchResult.rowCount,
    tokensSaved: searchResult.stats.savedTokens
  };
}

// Usage
const result = await ragQuery('How do I reduce token costs?');
console.log('Answer:', result.answer);
console.log('Sources:', result.sources);
console.log('Tokens saved:', result.tokensSaved);
```

---

## Filtered Search

Search with metadata filters:
```typescript
async function searchByCategory(query: string, category: string) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  const result = await db.searchWithStats(
    'knowledge_base',
    embedding.data[0].embedding,
    {
      limit: 10,
      scoreThreshold: 0.7,
      filter: {
        must: [
          { key: 'category', match: { value: category } }
        ]
      },
      model: 'gpt-5'
    }
  );
  
  return result;
}

// Search only installation docs
const installDocs = await searchByCategory(
  'getting started',
  'installation'
);
```

---

## Multi-Query RAG

Search with multiple queries:
```typescript
async function multiQueryRAG(userQuestion: string) {
  // Generate variations of the query
  const variations = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Generate 3 variations of this question: "${userQuestion}"`
    }]
  });
  
  const queries = variations.choices[0].message.content
    .split('\n')
    .filter(q => q.trim());
  
  // Search with each variation
  const allResults = [];
  
  for (const query of queries) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    
    const result = await db.search(
      'knowledge_base',
      embedding.data[0].embedding,
      { limit: 3, scoreThreshold: 0.7 }
    );
    
    allResults.push(...result.data);
  }
  
  // Deduplicate by ID
  const uniqueResults = Array.from(
    new Map(allResults.map(r => [r.id, r])).values()
  );
  
  console.log(`Found ${uniqueResults.length} unique documents`);
  
  return uniqueResults;
}
```

---

## Hybrid Search

Combine vector and keyword search:
```typescript
async function hybridSearch(query: string, keywords: string[]) {
  // Vector search
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  const vectorResults = await db.search(
    'knowledge_base',
    embedding.data[0].embedding,
    {
      limit: 10,
      scoreThreshold: 0.6
    }
  );
  
  // Filter by keywords in payload
  const filteredResults = vectorResults.data.filter(result => {
    const text = result.payload?.text as string;
    return keywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  });
  
  console.log(`Found ${filteredResults.length} matching documents`);
  
  return filteredResults;
}

// Usage
const results = await hybridSearch(
  'database integration',
  ['postgresql', 'connection']
);
```

---

## Batch Indexing

Index large document sets:
```typescript
async function batchIndex(documents: Array<{id: number, text: string, metadata: any}>) {
  const batchSize = 100;
  
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    // Generate embeddings for batch
    const texts = batch.map(d => d.text);
    const embeddings = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });
    
    // Prepare points
    const points = batch.map((doc, idx) => ({
      id: doc.id,
      vector: embeddings.data[idx].embedding,
      payload: {
        text: doc.text,
        ...doc.metadata
      }
    }));
    
    // Upsert batch
    await db.upsert('knowledge_base', points);
    
    console.log(`Indexed batch ${i / batchSize + 1}: ${points.length} documents`);
  }
  
  console.log(`Total indexed: ${documents.length} documents`);
}
```

---

## Re-ranking Results

Post-process search results:
```typescript
async function searchWithReranking(query: string) {
  // Initial search with higher limit
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  const initialResults = await db.search(
    'knowledge_base',
    embedding.data[0].embedding,
    { limit: 20, scoreThreshold: 0.6 }
  );
  
  // Re-rank with LLM
  const texts = initialResults.data.map(r => r.payload?.text);
  
  const reranking = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Given the query: "${query}"\n\nRank these documents by relevance:\n${texts.join('\n\n')}`
    }]
  });
  
  console.log('Reranked results:', reranking.choices[0].message.content);
  
  return initialResults;
}
```

---

## Production RAG System
```typescript
import { QdrantAdapter } from 'tonl-mcp-bridge';
import OpenAI from 'openai';

class RAGSystem {
  private db: QdrantAdapter;
  private openai: OpenAI;
  private collectionName: string;

  constructor(collectionName: string) {
    this.db = new QdrantAdapter();
    this.openai = new OpenAI();
    this.collectionName = collectionName;
  }

  async initialize() {
    await this.db.connect();
    try {
      await this.db.createCollection(this.collectionName, 1536);
    } catch (error) {
      console.log('Collection already exists');
    }
  }

  async indexDocument(id: number, text: string, metadata: any) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    await this.db.upsert(this.collectionName, [{
      id,
      vector: embedding.data[0].embedding,
      payload: { text, ...metadata }
    }]);
  }

  async query(question: string, limit: number = 5) {
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question
    });

    const searchResult = await this.db.searchWithStats(
      this.collectionName,
      embedding.data[0].embedding,
      { limit, scoreThreshold: 0.7, model: 'gpt-5' }
    );

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Answer based on context:\n' + searchResult.tonl
        },
        {
          role: 'user',
          content: question
        }
      ]
    });

    return {
      answer: completion.choices[0].message.content,
      sources: searchResult.rowCount,
      tokensSaved: searchResult.stats.savedTokens,
      savingsPercent: searchResult.stats.savingsPercent
    };
  }

  async close() {
    await this.db.disconnect();
  }
}

// Usage
const rag = new RAGSystem('docs');
await rag.initialize();

await rag.indexDocument(1, 'TONL documentation...', { category: 'docs' });

const result = await rag.query('How do I install TONL?');
console.log('Answer:', result.answer);
console.log(`Saved ${result.savingsPercent}% tokens`);

await rag.close();
```