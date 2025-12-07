# Streaming API

High-performance streaming API for real-time NDJSON to TONL conversion.

## Overview

The Streaming API provides Node.js Transform streams for processing large datasets with constant memory usage. Process gigabyte-scale files at 250,000 lines/second without loading everything into memory.

**Key Features:**
- Constant memory usage (independent of file size)
- 250,000 lines/second throughput
- Backpressure handling
- Error recovery
- 47% compression ratio maintained

## Classes

### NdjsonParse

Transform stream that parses NDJSON (newline-delimited JSON) input.

```typescript
import { NdjsonParse } from 'tonl-mcp-bridge/streams';

const parser = new NdjsonParse({
  skipInvalid: true  // Skip malformed JSON lines
});
```

**Constructor Options:**
```typescript
interface NdjsonParseOptions {
  skipInvalid?: boolean;  // Skip invalid JSON (default: false)
}
```

**Events:**
- `data` - Emits parsed JSON objects
- `error` - Emits on JSON parse errors (if skipInvalid is false)
- `end` - Stream complete

**Example:**
```typescript
import { createReadStream } from 'fs';
import { NdjsonParse } from 'tonl-mcp-bridge/streams';

const parser = new NdjsonParse({ skipInvalid: true });

createReadStream('logs.ndjson')
  .pipe(parser)
  .on('data', (obj) => {
    console.log('Parsed:', obj);
  })
  .on('error', (err) => {
    console.error('Parse error:', err);
  })
  .on('end', () => {
    console.log('Stream complete');
  });
```

### TonlTransform

Transform stream that converts JSON objects to TONL format.

```typescript
import { TonlTransform } from 'tonl-mcp-bridge/streams';

const transform = new TonlTransform({
  collectionName: 'logs',
  skipInvalid: true
});
```

**Constructor Options:**
```typescript
interface TonlTransformOptions {
  collectionName?: string;  // Collection name (default: 'data')
  skipInvalid?: boolean;    // Skip invalid objects (default: false)
}
```

**Methods:**
```typescript
getRowCount(): number  // Get total rows processed
```

**Example:**
```typescript
import { TonlTransform } from 'tonl-mcp-bridge/streams';

const transform = new TonlTransform({ 
  collectionName: 'events' 
});

transform.on('data', (tonlChunk) => {
  console.log('TONL:', tonlChunk.toString());
});

transform.on('end', () => {
  console.log(`Processed ${transform.getRowCount()} rows`);
});

// Write JSON objects
transform.write({ id: 1, event: 'login' });
transform.write({ id: 2, event: 'logout' });
transform.end();
```

## Complete Pipeline

### File to File

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

await pipeline(
  createReadStream('input.ndjson'),
  new NdjsonParse({ skipInvalid: true }),
  new TonlTransform({ collectionName: 'logs' }),
  createWriteStream('output.tonl')
);

console.log('Conversion complete');
```

### stdin to stdout

```typescript
import { pipeline } from 'stream/promises';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

await pipeline(
  process.stdin,
  new NdjsonParse({ skipInvalid: true }),
  new TonlTransform({ collectionName: 'data' }),
  process.stdout
);
```

### HTTP Request to Response

```typescript
import express from 'express';
import { pipeline } from 'stream/promises';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

const app = express();

app.post('/convert', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  
  await pipeline(
    req,
    new NdjsonParse({ skipInvalid: true }),
    new TonlTransform({ collectionName: 'data' }),
    res
  );
});

app.listen(3000);
```

## HTTP Endpoint

### POST /stream/convert

Server endpoint for streaming conversion.

**URL:** `POST /stream/convert`

**Query Parameters:**
- `collection` - Collection name (default: 'data')
- `skipInvalid` - Skip invalid lines (default: true)

**Headers:**
- `Content-Type: application/x-ndjson`

**Request Body:** NDJSON stream

**Response:** TONL stream (text/plain)

**Example:**
```bash
curl -X POST "http://localhost:3000/stream/convert?collection=logs" \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @logs.ndjson
```

**With stdin:**
```bash
cat logs.ndjson | curl -X POST http://localhost:3000/stream/convert \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @-
```

**Response Headers:**
```
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked
X-Collection-Name: logs
```

## Performance

### Benchmarks

**Test Setup:**
- File: 1GB NDJSON (1M records)
- Hardware: MacBook Pro M1, 16GB RAM
- Node.js: v18.17.0

**Results:**
```
File size:     1.0 GB
Records:       1,000,000
Duration:      4.2 seconds
Throughput:    238,095 lines/second
Memory usage:  45 MB (constant)
Compression:   47.3% savings
```

### Memory Usage

Streaming maintains constant memory:

```typescript
import { pipeline } from 'stream/promises';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

// Process 10GB file with ~50MB memory
await pipeline(
  createReadStream('huge-file.ndjson'),
  new NdjsonParse(),
  new TonlTransform({ collectionName: 'data' }),
  createWriteStream('output.tonl')
);
```

### Optimization Tips

**1. Use skipInvalid for dirty data:**
```typescript
new NdjsonParse({ skipInvalid: true })  // Faster, more resilient
```

**2. Buffer writes:**
```typescript
createWriteStream('output.tonl', {
  highWaterMark: 64 * 1024  // 64KB buffer
})
```

**3. Process in parallel:**
```typescript
import { Worker } from 'worker_threads';

// Split file and process chunks in parallel
const workers = Array.from({ length: 4 }, () => new Worker('./processor.js'));
```

## Error Handling

### Invalid JSON Lines

```typescript
const parser = new NdjsonParse({ skipInvalid: true });

parser.on('error', (err) => {
  console.error('Parse error:', err.message);
  // Continue processing
});
```

### Backpressure

Streams automatically handle backpressure:

```typescript
const transform = new TonlTransform({ collectionName: 'data' });

// Pauses input if output is slow
transform.on('drain', () => {
  console.log('Ready for more data');
});
```

### Pipeline Errors

```typescript
try {
  await pipeline(
    createReadStream('input.ndjson'),
    new NdjsonParse(),
    new TonlTransform({ collectionName: 'data' }),
    createWriteStream('output.tonl')
  );
} catch (error) {
  console.error('Pipeline failed:', error);
  // Cleanup, retry, or alert
}
```

## Advanced Usage

### Custom Transform

```typescript
import { Transform } from 'stream';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

// Filter stream
class FilterTransform extends Transform {
  constructor(private predicate: (obj: any) => boolean) {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: Function) {
    if (this.predicate(chunk)) {
      this.push(chunk);
    }
    callback();
  }
}

// Pipeline with filter
await pipeline(
  createReadStream('logs.ndjson'),
  new NdjsonParse(),
  new FilterTransform(obj => obj.level === 'error'),
  new TonlTransform({ collectionName: 'errors' }),
  createWriteStream('errors.tonl')
);
```

### Progress Tracking

```typescript
import { Transform } from 'stream';

class ProgressTransform extends Transform {
  private count = 0;
  
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: Function) {
    this.count++;
    if (this.count % 10000 === 0) {
      console.log(`Processed ${this.count} records`);
    }
    this.push(chunk);
    callback();
  }
}

await pipeline(
  createReadStream('input.ndjson'),
  new NdjsonParse(),
  new ProgressTransform(),
  new TonlTransform({ collectionName: 'data' }),
  createWriteStream('output.tonl')
);
```

### Metrics Collection

```typescript
import { Transform } from 'stream';

class MetricsTransform extends Transform {
  private stats = {
    total: 0,
    errors: 0,
    bytesIn: 0,
    startTime: Date.now()
  };
  
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: Function) {
    this.stats.total++;
    this.stats.bytesIn += JSON.stringify(chunk).length;
    this.push(chunk);
    callback();
  }
  
  _flush(callback: Function) {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    const throughput = Math.round(this.stats.total / duration);
    
    console.log({
      total: this.stats.total,
      duration: `${duration.toFixed(2)}s`,
      throughput: `${throughput} records/sec`,
      avgSize: Math.round(this.stats.bytesIn / this.stats.total)
    });
    
    callback();
  }
}

await pipeline(
  createReadStream('input.ndjson'),
  new NdjsonParse(),
  new MetricsTransform(),
  new TonlTransform({ collectionName: 'data' }),
  createWriteStream('output.tonl')
);
```

## CLI Integration

### tonl stream command

```bash
# Stream from file
tonl stream --input logs.ndjson --output logs.tonl

# Stream from stdin
cat logs.ndjson | tonl stream > output.tonl

# With collection name
tonl stream -i logs.ndjson -o logs.tonl --name events

# With statistics
tonl stream -i logs.ndjson --stats
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';
import { Readable } from 'stream';

describe('Streaming', () => {
  it('should parse NDJSON', async () => {
    const input = Readable.from([
      '{"id":1}\n',
      '{"id":2}\n'
    ]);
    
    const parser = new NdjsonParse();
    const results: any[] = [];
    
    parser.on('data', (obj) => results.push(obj));
    
    await pipeline(input, parser);
    
    expect(results).toEqual([
      { id: 1 },
      { id: 2 }
    ]);
  });
  
  it('should convert to TONL', async () => {
    const input = Readable.from([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
    
    const transform = new TonlTransform({ collectionName: 'users' });
    let output = '';
    
    transform.on('data', (chunk) => {
      output += chunk.toString();
    });
    
    await pipeline(input, transform);
    
    expect(output).toContain('users[2]{id:i32,name:str}:');
    expect(transform.getRowCount()).toBe(2);
  });
});
```

## See Also

- [Core API](/api/core) - Basic conversion functions
- [Privacy API](/api/privacy) - Data anonymization
- [MCP Server](/api/server) - HTTP endpoint details
- [Streaming Guide](/guide/streaming) - User guide
- [CLI Reference](/guide/cli-reference) - CLI commands
