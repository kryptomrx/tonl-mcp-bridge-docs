# Keyboard Shortcuts

Efficiently navigate the TONL Visual Dashboard with keyboard shortcuts.

## Overview

The Visual Dashboard (v1.0.0) includes keyboard shortcuts for common actions like quitting, exporting data, and taking screenshots. All shortcuts are displayed in the dashboard footer for easy reference.

## Available Shortcuts

### Core Actions

**Quit Dashboard**
```
q or ESC
```
Exit the visual dashboard and return to terminal.

**Export to CSV**
```
e
```
Export current analysis to CSV format in the current directory.

**Take Screenshot**
```
s
```
Capture the current dashboard state as a text file.

### Example Usage

```bash
# Start dashboard
tonl analyze data.json --visual

# Press 'q' to quit
# Press 'e' to export
# Press 's' to screenshot
```

## Footer Display

The shortcuts are shown at the bottom of every dashboard:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 q: Quit  │  e: Export CSV  │  s: Screenshot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Clean, minimal design keeps focus on the data.

## Detailed Actions

### Quit (q / ESC)

**Purpose:** Clean exit from dashboard

**Behavior:**
- Stops MCP health monitoring
- Closes dashboard rendering
- Returns to shell prompt
- Exit code 0 (success)

**Example:**
```bash
tonl analyze data.json --visual
# ... review dashboard ...
# Press 'q' to exit
```

### Export CSV (e)

**Purpose:** Save analysis data to CSV file

**Behavior:**
- Generates timestamped filename
- Includes all metrics (tokens, costs, savings)
- Saves to current directory
- Shows confirmation message

**Output Filename:**
```
tonl-analysis-2025-12-03-193045.csv
```

**CSV Format:**
```csv
Filename,Original Tokens,Compressed Tokens,Saved Tokens,Savings %,Cost Before,Cost After,Savings,Model
data.json,477,255,222,46.5%,$1.19,$0.64,$0.55,gpt-4o
```

**Example:**
```bash
tonl analyze data.json --visual
# Press 'e' to export
# File saved: tonl-analysis-2025-12-03-193045.csv
```

### Screenshot (s)

**Purpose:** Capture dashboard state as text file

**Behavior:**
- Saves terminal output to .txt file
- Preserves colors (ANSI codes)
- Timestamped filename
- Useful for reports/sharing

**Output Filename:**
```
tonl-screenshot-2025-12-03-193045.txt
```

**Example:**
```bash
tonl analyze data.json --visual
# Press 's' to screenshot
# Saved: tonl-screenshot-2025-12-03-193045.txt
```

## Use Cases

### Quick Analysis
```bash
tonl analyze data.json --visual
# Review metrics
# Press 'q' when done
```

Fast feedback loop for development.

### Generate Report
```bash
tonl analyze client-data.json --visual
# Press 's' for screenshot
# Press 'e' for CSV
# Press 'q' to exit
```

Create multiple output formats for stakeholder review.

### Batch Documentation
```bash
for file in *.json; do
  tonl analyze "$file" --visual
  # Press 's' for each screenshot
  # Press 'e' for each CSV
  # Press 'q' to continue loop
done
```

Document analysis of multiple files.

### Live Presentations
```bash
tonl analyze demo-data.json --visual
# Show to audience
# Press 'e' to share data
# Press 'q' when presentation ends
```

Interactive demos with instant export capability.

## Best Practices

**Use 'q' for Clean Exit**

Always use 'q' or ESC instead of Ctrl+C:
```bash
# Good
tonl analyze data.json --visual
# Press 'q'

# Avoid (leaves terminal in weird state)
tonl analyze data.json --visual
# Press Ctrl+C
```

**Export Before Quitting**

Save valuable analysis before exiting:
```bash
tonl analyze data.json --visual
# Press 'e' first
# Then press 'q'
```

**Screenshot for Async Sharing**

Capture dashboard for colleagues who couldn't attend:
```bash
tonl analyze sprint-data.json --visual
# Press 's' to save screenshot
# Share .txt file via email/Slack
```

## Technical Details

### Implementation

Keyboard handling uses Ink's `useInput` hook:

```typescript
useInput((input, key) => {
  if (input === 'q' || key.escape) {
    process.exit(0);
  }
  
  if (input === 'e') {
    exportToCSV(data);
  }
  
  if (input === 's') {
    takeScreenshot();
  }
});
```

### Non-blocking Input

Shortcuts don't block:
- MCP health checks continue
- UI updates remain smooth
- Animations keep running

### Terminal Compatibility

Works on:
- macOS Terminal
- iTerm2
- Linux terminals
- Windows Terminal
- VS Code integrated terminal

## Limitations

**No Mouse Support**

Dashboard is keyboard-only:
- No clickable buttons
- No hover effects
- No scrolling

Use keyboard shortcuts exclusively.

**Single Key Press**

Shortcuts are single-key (not chords):
- No Ctrl+S (just 's')
- No Alt+Q (just 'q')
- No Shift+E (just 'e')

Simpler = faster.

**Case Sensitive**

Use lowercase keys:
```bash
# Correct
Press: q

# Incorrect  
Press: Q
```

## Troubleshooting

### Shortcuts Not Working

**Check terminal focus:**
- Click terminal window
- Ensure no text is selected

**Verify terminal mode:**
- Some terminals require "application mode"
- Check terminal preferences

**Try alternative quit:**
```bash
# If 'q' doesn't work, try ESC
Press: ESC
```

### Export Not Saving

**Check permissions:**
```bash
# Verify write access
touch test.csv
rm test.csv
```

**Check disk space:**
```bash
df -h .
```

**Verify current directory:**
```bash
pwd
ls -la
```

### Screenshot Has Weird Characters

**Check terminal encoding:**
```bash
echo $LANG
# Should show UTF-8
```

**Disable colors if needed:**
```bash
NO_COLOR=1 tonl analyze data.json --visual
```

## Future Enhancements

Planned improvements:
- Copy to clipboard (c)
- Open in browser (o)
- Refresh data (r)
- Help screen (h/?)
- Navigation arrows

## See Also

- [Visual Dashboard](/guide/visual-dashboard) - Dashboard overview
- [CLI Reference](/guide/cli-reference) - All commands
- [Output Formats](/guide/output-formats) - Export options
- [ROI Calculator](/guide/roi-calculator) - Analysis features
