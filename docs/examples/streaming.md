# Streaming Example

Real-world examples for processing large files with constant memory.

## Basic File Streaming

### NDJSON to TONL

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

async function convertFile() {
  await pipeline(
    createReadStream('logs.ndjson'),
    new NdjsonParse({ skipInvalid: true }),
    new TonlTransform({ collectionName: 'logs' }),
    createWriteStream('logs.tonl')
  );
  
  console.log('Conversion complete');
}

convertFile();
```

### With Progress Tracking

```typescript
import { Transform } from 'stream';

class ProgressStream extends Transform {
  private count = 0;
  private startTime = Date.now();
  
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: Function) {
    this.count++;
    
    if (this.count % 10000 === 0) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const rate = Math.round(this.count / elapsed);
      console.log(`Processed ${this.count} records (${rate}/sec)`);
    }
    
    this.push(chunk);
    callback();
  }
}

await pipeline(
  createReadStream('huge-file.ndjson'),
  new NdjsonParse(),
  new ProgressStream(),
  new TonlTransform({ collectionName: 'data' }),
  createWriteStream('output.tonl')
);
```

## Docker Logs

### Stream Docker Container Logs

```bash
#!/bin/bash
# docker-logs.sh

CONTAINER_ID=$1
OUTPUT_FILE="logs-$(date +%Y%m%d-%H%M%S).tonl"

# Stream logs to TONL
docker logs -f $CONTAINER_ID 2>&1 | \
  jq -c '. | {timestamp: .time, level: .level, message: .msg}' | \
  curl -X POST http://localhost:3000/stream/convert?collection=docker_logs \
    -H "Content-Type: application/x-ndjson" \
    --data-binary @- > $OUTPUT_FILE
```

### Usage

```bash
./docker-logs.sh my-container
```

## Nginx Access Logs

### Convert Access Logs

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

// Parse nginx access log format
class NginxLogParser extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(line: Buffer, encoding: string, callback: Function) {
    const logLine = line.toString().trim();
    
    // Parse: IP - - [date] "method path protocol" status bytes
    const match = logLine.match(
      /^(\S+) - - \[(.*?)\] "(.*?)" (\d+) (\d+)/
    );
    
    if (match) {
      this.push({
        ip: match[1],
        timestamp: match[2],
        request: match[3],
        status: parseInt(match[4]),
        bytes: parseInt(match[5])
      });
    }
    
    callback();
  }
}

await pipeline(
  createReadStream('/var/log/nginx/access.log'),
  new NginxLogParser(),
  new TonlTransform({ collectionName: 'nginx_logs' }),
  createWriteStream('nginx-logs.tonl')
);
```

## Application Logs

### Real-time Log Processing

```typescript
import { Tail } from 'tail';
import { TonlTransform } from 'tonl-mcp-bridge/streams';
import { createWriteStream } from 'fs';

// Watch application log file
const tail = new Tail('app.log');
const transform = new TonlTransform({ collectionName: 'app_logs' });
const output = createWriteStream('app-logs.tonl', { flags: 'a' });

transform.pipe(output);

tail.on('line', (line) => {
  try {
    const log = JSON.parse(line);
    transform.write(log);
  } catch (err) {
    console.error('Failed to parse log:', line);
  }
});

tail.on('error', (error) => {
  console.error('Tail error:', error);
});

console.log('Watching app.log...');
```

## HTTP Streaming

### Server Endpoint

```typescript
import express from 'express';
import { pipeline } from 'stream/promises';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

const app = express();

app.post('/convert', async (req, res) => {
  const collection = req.query.collection as string || 'data';
  
  res.setHeader('Content-Type', 'text/plain');
  
  try {
    await pipeline(
      req,
      new NdjsonParse({ skipInvalid: true }),
      new TonlTransform({ collectionName: collection }),
      res
    );
  } catch (error) {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      res.status(500).send('Stream failed');
    }
  }
});

app.listen(3000, () => {
  console.log('Streaming server running on :3000');
});
```

### Client Usage

```bash
# Stream file to server
curl -X POST "http://localhost:3000/convert?collection=events" \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @events.ndjson \
  -o events.tonl

# Stream with gzip compression
gzip -c logs.ndjson | \
  curl -X POST http://localhost:3000/convert \
    -H "Content-Type: application/x-ndjson" \
    -H "Content-Encoding: gzip" \
    --data-binary @- \
    -o logs.tonl
```

## Database Export

### PostgreSQL to TONL

```typescript
import { Client } from 'pg';
import { TonlTransform } from 'tonl-mcp-bridge/streams';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const client = new Client({
  host: 'localhost',
  database: 'myapp',
  user: 'postgres',
  password: 'password'
});

await client.connect();

// Stream query results
const query = client.query('SELECT * FROM users');
const stream = Readable.from(query);

await pipeline(
  stream,
  new TonlTransform({ collectionName: 'users' }),
  createWriteStream('users.tonl')
);

await client.end();
console.log('Export complete');
```

### MongoDB to TONL

```typescript
import { MongoClient } from 'mongodb';
import { TonlTransform } from 'tonl-mcp-bridge/streams';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();

const db = client.db('myapp');
const collection = db.collection('products');

// Stream cursor
const cursor = collection.find({});
const stream = cursor.stream();

await pipeline(
  stream,
  new TonlTransform({ collectionName: 'products' }),
  createWriteStream('products.tonl')
);

await client.close();
```

## Error Handling

### Robust Pipeline

```typescript
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { NdjsonParse, TonlTransform } from 'tonl-mcp-bridge/streams';

async function convertWithRetry(input: string, output: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}`);
      
      await pipeline(
        createReadStream(input),
        new NdjsonParse({ skipInvalid: true }),
        new TonlTransform({ collectionName: 'data' }),
        createWriteStream(output)
      );
      
      console.log('Success');
      return;
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

await convertWithRetry('input.ndjson', 'output.tonl');
```

## Performance Optimization

### Parallel Processing

```typescript
import { Worker } from 'worker_threads';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

// Split stream into chunks
class ChunkSplitter extends Transform {
  private chunkSize = 1000;
  private buffer: any[] = [];
  
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: Function) {
    this.buffer.push(chunk);
    
    if (this.buffer.length >= this.chunkSize) {
      this.push(this.buffer);
      this.buffer = [];
    }
    
    callback();
  }
  
  _flush(callback: Function) {
    if (this.buffer.length > 0) {
      this.push(this.buffer);
    }
    callback();
  }
}

// Process chunks in parallel workers
const workers = Array.from({ length: 4 }, () => 
  new Worker('./processor-worker.js')
);

let workerIndex = 0;

const splitter = new ChunkSplitter();

splitter.on('data', (chunk) => {
  const worker = workers[workerIndex];
  worker.postMessage(chunk);
  workerIndex = (workerIndex + 1) % workers.length;
});

createReadStream('huge-file.ndjson')
  .pipe(new NdjsonParse())
  .pipe(splitter);
```

## Monitoring

### Stream Metrics

```typescript
import { Transform } from 'stream';

class MetricsStream extends Transform {
  private stats = {
    total: 0,
    bytesIn: 0,
    bytesOut: 0,
    errors: 0,
    startTime: Date.now()
  };
  
  constructor() {
    super({ objectMode: true });
  }
  
  _transform(chunk: any, encoding: string, callback: Function) {
    this.stats.total++;
    this.stats.bytesIn += JSON.stringify(chunk).length;
    
    try {
      this.push(chunk);
      callback();
    } catch (error) {
      this.stats.errors++;
      callback(error);
    }
  }
  
  _flush(callback: Function) {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    const throughput = Math.round(this.stats.total / duration);
    
    console.log('Stream Statistics:');
    console.log(`  Records: ${this.stats.total}`);
    console.log(`  Duration: ${duration.toFixed(2)}s`);
    console.log(`  Throughput: ${throughput} records/sec`);
    console.log(`  Bytes In: ${this.stats.bytesIn}`);
    console.log(`  Errors: ${this.stats.errors}`);
    
    callback();
  }
}

await pipeline(
  createReadStream('input.ndjson'),
  new NdjsonParse(),
  new MetricsStream(),
  new TonlTransform({ collectionName: 'data' }),
  createWriteStream('output.tonl')
);
```

## CLI Usage

```bash
# Stream from stdin
cat logs.ndjson | tonl stream > output.tonl

# Stream from file
tonl stream --input logs.ndjson --output logs.tonl

# With collection name
tonl stream -i logs.ndjson -o logs.tonl --name events

# With statistics
tonl stream -i logs.ndjson --stats

# Skip invalid lines
tonl stream -i dirty-data.ndjson --skip-invalid
```

## See Also

- [Streaming Guide](/guide/streaming) - Complete guide
- [Streaming API](/api/streaming) - API reference
- [CLI Reference](/guide/cli-reference) - CLI commands
- [Privacy](/examples/privacy) - Data anonymization
