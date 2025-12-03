# CI/CD Integration

Integrate TONL analysis into your continuous integration and deployment pipelines to track token costs, monitor savings, and enforce cost thresholds automatically.

## Overview

TONL CLI provides machine-readable outputs and exit codes that integrate seamlessly with popular CI/CD platforms. Track token optimization progress, generate automated reports, and prevent cost regressions.

## GitHub Actions

### Basic Analysis Workflow

```yaml
name: TONL Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install TONL
        run: npm install -g tonl-mcp-bridge
      
      - name: Analyze Token Usage
        run: tonl analyze data/*.json --format markdown > analysis.md
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: tonl-analysis
          path: analysis.md
```

### PR Comment Integration

Automatically post analysis results as pull request comments:

```yaml
name: TONL PR Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install TONL
        run: npm install -g tonl-mcp-bridge
      
      - name: Generate Analysis
        run: tonl analyze fixtures/**/*.json --format markdown > analysis.md
      
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const analysis = fs.readFileSync('analysis.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: analysis
            });
```

### Cost Threshold Enforcement

Fail the build if token savings drop below a threshold:

```yaml
name: Token Savings Threshold
on: [pull_request]

jobs:
  check-savings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install TONL and jq
        run: |
          npm install -g tonl-mcp-bridge
          sudo apt-get install -y jq
      
      - name: Check Savings Threshold
        run: |
          savings=$(tonl analyze data.json --format json | jq '.[0].savingsPercent')
          threshold=40
          
          echo "Token savings: ${savings}%"
          echo "Threshold: ${threshold}%"
          
          if (( $(echo "$savings < $threshold" | bc -l) )); then
            echo "❌ Token savings below threshold"
            exit 1
          fi
          
          echo "✅ Token savings above threshold"
```

### Multi-Currency Reports

Generate reports for different regions:

```yaml
name: Regional Cost Reports
on:
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday

jobs:
  generate-reports:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install TONL
        run: npm install -g tonl-mcp-bridge
      
      - name: Generate Regional Reports
        run: |
          # US Report
          tonl analyze data/*.json --currency USD --export reports/us-report.csv
          
          # EU Report
          tonl analyze data/*.json --currency EUR --export reports/eu-report.csv
          
          # APAC Report
          tonl analyze data/*.json --currency JPY --export reports/apac-report.csv
      
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: regional-reports
          path: reports/
```

## GitLab CI

### Basic Pipeline

```yaml
stages:
  - analyze
  - report

tonl-analysis:
  stage: analyze
  image: node:18
  before_script:
    - npm install -g tonl-mcp-bridge
  script:
    - tonl analyze data/**/*.json --format markdown > analysis.md
    - tonl analyze data/**/*.json --format json > metrics.json
  artifacts:
    paths:
      - analysis.md
      - metrics.json
    reports:
      dotenv: metrics.env

generate-report:
  stage: report
  dependencies:
    - tonl-analysis
  script:
    - cat analysis.md
```

### Merge Request Comments

```yaml
tonl-mr-comment:
  stage: analyze
  image: node:18
  before_script:
    - npm install -g tonl-mcp-bridge
  script:
    - tonl analyze data/**/*.json --format markdown > analysis.md
    - |
      curl --request POST \
        --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
        --header "Content-Type: application/json" \
        --data "{\"body\": \"$(cat analysis.md | sed 's/"/\\"/g')\"}" \
        "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes"
  only:
    - merge_requests
```

### Cost Monitoring

```yaml
cost-check:
  stage: test
  image: node:18
  before_script:
    - npm install -g tonl-mcp-bridge jq
  script:
    - |
      savings=$(tonl analyze data.json --format json | jq '.[0].savingsPercent')
      if [ $(echo "$savings < 40" | bc) -eq 1 ]; then
        echo "Warning: Token savings below 40%"
        exit 1
      fi
```

## Jenkins

### Declarative Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install TONL') {
            steps {
                sh 'npm install -g tonl-mcp-bridge'
            }
        }
        
        stage('Analyze') {
            steps {
                sh '''
                    tonl analyze data/*.json --format csv > analysis.csv
                    tonl analyze data/*.json --format markdown > analysis.md
                '''
            }
        }
        
        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'analysis.csv,analysis.md'
            }
        }
        
        stage('Publish') {
            steps {
                publishHTML([
                    reportDir: '.',
                    reportFiles: 'analysis.md',
                    reportName: 'TONL Analysis'
                ])
            }
        }
    }
}
```

### Scripted Pipeline with Thresholds

```groovy
node {
    stage('Setup') {
        sh 'npm install -g tonl-mcp-bridge'
    }
    
    stage('Analyze') {
        sh 'tonl analyze data.json --format json > analysis.json'
        
        def analysis = readJSON file: 'analysis.json'
        def savings = analysis[0].savingsPercent
        
        echo "Token savings: ${savings}%"
        
        if (savings < 40) {
            error("Token savings ${savings}% below threshold of 40%")
        }
    }
    
    stage('Report') {
        sh 'tonl analyze data/*.json --format csv > report.csv'
        archiveArtifacts artifacts: 'report.csv'
    }
}
```

## CircleCI

### Basic Configuration

```yaml
version: 2.1

jobs:
  analyze:
    docker:
      - image: node:18
    steps:
      - checkout
      
      - run:
          name: Install TONL
          command: npm install -g tonl-mcp-bridge
      
      - run:
          name: Analyze Files
          command: |
            tonl analyze data/**/*.json --format markdown > analysis.md
            tonl analyze data/**/*.json --format json > metrics.json
      
      - store_artifacts:
          path: analysis.md
      
      - store_artifacts:
          path: metrics.json

workflows:
  version: 2
  analyze-tokens:
    jobs:
      - analyze
```

### Scheduled Reports

```yaml
version: 2.1

jobs:
  weekly-report:
    docker:
      - image: node:18
    steps:
      - checkout
      
      - run:
          name: Install TONL
          command: npm install -g tonl-mcp-bridge
      
      - run:
          name: Generate Weekly Report
          command: |
            tonl analyze data/**/*.json --export weekly-report.csv
      
      - store_artifacts:
          path: weekly-report.csv

workflows:
  version: 2
  scheduled-reports:
    triggers:
      - schedule:
          cron: "0 0 * * 1"
          filters:
            branches:
              only: main
    jobs:
      - weekly-report
```

## Azure Pipelines

### Basic Pipeline

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: |
      npm install -g tonl-mcp-bridge
    displayName: 'Install TONL'

  - script: |
      tonl analyze data/**/*.json --format markdown > $(Build.ArtifactStagingDirectory)/analysis.md
      tonl analyze data/**/*.json --format csv > $(Build.ArtifactStagingDirectory)/analysis.csv
    displayName: 'Analyze Token Usage'

  - task: PublishBuildArtifacts@1
    inputs:
      pathToPublish: '$(Build.ArtifactStagingDirectory)'
      artifactName: 'tonl-analysis'
    displayName: 'Publish Analysis'
```

### Pull Request Comments

```yaml
trigger:
  - none

pr:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'

  - script: |
      npm install -g tonl-mcp-bridge
      tonl analyze data/**/*.json --format markdown > analysis.md
    displayName: 'Generate Analysis'

  - task: PowerShell@2
    inputs:
      targetType: 'inline'
      script: |
        $analysis = Get-Content analysis.md -Raw
        $url = "$(System.CollectionUri)$(System.TeamProject)/_apis/git/repositories/$(Build.Repository.Name)/pullRequests/$(System.PullRequest.PullRequestId)/threads?api-version=6.0"
        $body = @{
          comments = @(
            @{
              content = $analysis
              commentType = "text"
            }
          )
        } | ConvertTo-Json -Depth 10
        
        Invoke-RestMethod -Uri $url -Method Post -Body $body -Headers @{
          Authorization = "Bearer $(System.AccessToken)"
          "Content-Type" = "application/json"
        }
    displayName: 'Post PR Comment'
```

## Travis CI

### Basic Configuration

```yaml
language: node_js
node_js:
  - '18'

install:
  - npm install -g tonl-mcp-bridge

script:
  - tonl analyze data/**/*.json --format json > analysis.json
  - tonl analyze data/**/*.json --format markdown > analysis.md

after_success:
  - cat analysis.md
```

## Bitbucket Pipelines

### Basic Pipeline

```yaml
image: node:18

pipelines:
  default:
    - step:
        name: TONL Analysis
        script:
          - npm install -g tonl-mcp-bridge
          - tonl analyze data/**/*.json --format markdown > analysis.md
          - tonl analyze data/**/*.json --format csv > analysis.csv
        artifacts:
          - analysis.md
          - analysis.csv
```

## Best Practices

### Cache Node Modules

Reduce installation time by caching dependencies:

```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Use Specific Versions

Pin TONL version for reproducibility:

```bash
npm install -g tonl-mcp-bridge@1.0.0
```

### Parallel Execution

Analyze multiple file sets in parallel:

```yaml
# GitHub Actions
strategy:
  matrix:
    dataset: [users, products, orders]
steps:
  - run: tonl analyze data/${{ matrix.dataset }}.json --export ${{ matrix.dataset }}-report.csv
```

### Conditional Execution

Only run analysis on relevant changes:

```yaml
# GitHub Actions
on:
  pull_request:
    paths:
      - 'data/**/*.json'
      - 'fixtures/**/*.json'
```

### Error Handling

Capture and report errors gracefully:

```bash
if ! tonl analyze data.json --format json > analysis.json; then
  echo "Analysis failed"
  exit 1
fi
```

## Monitoring and Alerts

### Slack Notifications

Send analysis results to Slack:

```yaml
# GitHub Actions
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'TONL Analysis Complete'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Reports

Configure email notifications with analysis attachments:

```yaml
# GitLab CI
tonl-email-report:
  stage: report
  script:
    - tonl analyze data/*.json --export report.csv
    - |
      echo "Weekly TONL Analysis" | \
      mail -s "Token Analysis Report" \
           -a report.csv \
           team@example.com
```

### Cost Alerts

Set up alerts for cost threshold violations:

```bash
savings=$(tonl analyze data.json --format json | jq '.[0].savingsPercent')

if [ $(echo "$savings < 40" | bc) -eq 1 ]; then
  curl -X POST https://alerts.example.com/webhook \
    -H "Content-Type: application/json" \
    -d "{\"alert\": \"Token savings below threshold\", \"savings\": $savings}"
fi
```

## Troubleshooting

### Command Not Found

Ensure TONL is installed in the correct PATH:

```bash
# Check installation
which tonl

# Install globally
npm install -g tonl-mcp-bridge

# Use npx as fallback
npx tonl-mcp-bridge analyze data.json
```

### Permission Issues

Grant execution permissions if needed:

```bash
chmod +x node_modules/.bin/tonl
```

### Memory Limits

Increase memory for large files:

```bash
NODE_OPTIONS="--max-old-space-size=8192" tonl analyze large-file.json
```

### JSON Parsing

Handle malformed JSON gracefully:

```bash
if tonl analyze data.json --format json 2>&1 | grep -q "Invalid JSON"; then
  echo "JSON validation failed"
  exit 1
fi
```

## Next Steps

- [CLI Reference](/guide/cli-reference) - Complete command documentation
- [Output Formats](/guide/output-formats) - Format specifications
- [ROI Calculator](/guide/roi-calculator) - Cost analysis features
