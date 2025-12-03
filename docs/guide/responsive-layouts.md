# Responsive Layouts

The TONL Visual Dashboard automatically adapts to your terminal size for optimal viewing on any screen.

## Overview

The Visual Dashboard (v1.0.0) includes intelligent responsive layouts that detect terminal width and adjust the interface accordingly. This ensures professional presentation on everything from large 4K monitors to small MacBook Air screens.

## Layout Modes

### Full Mode (≥100 columns)

**Activates when:** Terminal width is 100 columns or wider

**Features:**
- Two-column layout
- Full metric cards
- Detailed progress bars (40 chars)
- Complete recommendation text
- All keyboard shortcuts visible

**Example Output:**
```
  ╔╦╗ ╔═╗ ╔╗╔ ╦  
   ║  ║ ║ ║║║ ║  
   ╩  ╚═╝ ╝╚╝ ╩═╝
 ROI Analyzer                   MCP: 🟢 Online (45ms)    v1.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 📊 Token Usage Analysis                💰 Cost Impact
 data.json                              gpt-4o pricing
 
 JSON    ████████████████████  477      $1.19 per 1K queries
 TONL    ██████████░░░░░░░░░░  255      $0.64 per 1K queries
         ✓ 46.5% reduction               💎 $0.55 savings
                                         
 Recommendation: STRONG ADOPT            Annual: $202.57/year
                                         @ 1K requests/day

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 q: Quit  │  e: Export CSV  │  s: Screenshot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Compact Mode (<100 columns)

**Activates when:** Terminal width is less than 100 columns

**Features:**
- Single-column layout
- Essential metrics only
- Shorter progress bars (30 chars)
- Abbreviated labels
- Optimized for small screens

**Example Output:**
```
  ╔╦╗ ╔═╗ ╔╗╔ ╦  
   ║  ║ ║ ║║║ ║  
   ╩  ╚═╝ ╝╚╝ ╩═╝
 ROI Analyzer          MCP: 🟢 45ms    v1.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 📊 Tokens
 data.json
 
 JSON  ███████████████  477
 TONL  ████████░░░░░░░  255 (-46.5%)
 
 💰 Costs (gpt-4o)
 Before: $1.19/1K
 After:  $0.64/1K
 Save:   $0.55/1K
 
 📈 Annual: $202.57
 
 ✓ STRONG ADOPT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 q: Quit  │  e: Export  │  s: Screen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Automatic Detection

The dashboard automatically detects terminal width:

```typescript
const { columns } = process.stdout;
const isCompact = columns < 100;
```

**No configuration needed!** Just run the command:

```bash
tonl analyze data.json --visual
```

## Terminal Size Examples

### Large Desktop (140 cols)
```bash
# Full mode with plenty of space
tonl analyze data.json --visual
```

Perfect for presentations and detailed analysis.

### Standard Laptop (120 cols)
```bash
# Full mode, comfortable viewing
tonl analyze data.json --visual
```

Default experience for most developers.

### MacBook Air 13" (80 cols)
```bash
# Compact mode, optimized layout
tonl analyze data.json --visual
```

Still fully functional with reduced width.

### Vertical Split (60 cols)
```bash
# Compact mode, essential info only
tonl analyze data.json --visual
```

Works even in split-screen setups.

## Responsive Elements

### Progress Bars

**Full Mode:** 40 characters wide
```
████████████████████████████████████████  477 tokens
```

**Compact Mode:** 30 characters wide
```
██████████████████████████████  477
```

### Metric Cards

**Full Mode:** Detailed cards with icons
```
 📊 Token Usage Analysis
 data.json
 
 JSON    ████████████████████  477 tokens
 TONL    ██████████░░░░░░░░░░  255 tokens
         ✓ 46.5% reduction
```

**Compact Mode:** Condensed format
```
 📊 Tokens
 JSON  ███████████████  477
 TONL  ████████░░░░░░░  255 (-46.5%)
```

### Cost Table

**Full Mode:** Full table with headers
```
 💰 Cost Analysis (GPT-4o)
                     Per 1K         Per 1M
 ──────────────────────────────────────────────────
 JSON                $1.19          $1,192.50
 TONL                $0.64          $637.50
 ──────────────────────────────────────────────────
 💎 NET SAVINGS      $0.55          $555.00
```

**Compact Mode:** Simple list
```
 💰 Costs (gpt-4o)
 Before: $1.19/1K
 After:  $0.64/1K
 Save:   $0.55/1K
```

### Keyboard Shortcuts

**Full Mode:** Full labels
```
 q: Quit  │  e: Export CSV  │  s: Screenshot
```

**Compact Mode:** Abbreviated
```
 q: Quit  │  e: Export  │  s: Screen
```

## Use Cases

### Presentations on Projector

Use full mode for maximum impact:
```bash
# Maximize terminal for presentations
tonl analyze demo-data.json --visual
```

Large text and detailed layout perfect for audiences.

### Laptop Development

Standard view for daily work:
```bash
# Normal terminal size
tonl analyze data.json --visual
```

Comfortable viewing during development.

### Split Screen Coding

Compact mode works alongside code:
```bash
# Terminal split with editor
tonl analyze data.json --visual
```

Essential info without taking full screen.

### Remote SSH Sessions

Works on any terminal size:
```bash
ssh server
tonl analyze remote-data.json --visual
```

Adapts to remote terminal dimensions.

## Manual Override

### Force Full Mode

Use wider terminal manually:
```bash
# Resize terminal to 120+ columns
tonl analyze data.json --visual
```

### Force Compact Mode

Use narrower terminal manually:
```bash
# Resize terminal to 80 columns
tonl analyze data.json --visual
```

### Check Terminal Size

```bash
# View current dimensions
tput cols  # Width
tput lines # Height
```

## Best Practices

**Maximize for Presentations**

Before demos, maximize terminal:
```bash
# macOS: Cmd+Shift+Enter
# Linux: F11
# Windows: Alt+Enter
tonl analyze data.json --visual
```

**Use Split View for Development**

Keep dashboard visible while coding:
```bash
# Left pane: code editor (70 cols)
# Right pane: dashboard (50 cols)
tonl analyze data.json --visual
```

**Test on Target Display**

If presenting remotely, test on similar resolution:
```bash
# Simulate client screen size
resize -s 40 100  # 40 rows, 100 cols
tonl analyze data.json --visual
```

**Consider Audience View**

For screen sharing, use full mode:
- Larger text is easier to read
- More detail visible
- Professional appearance

## Technical Details

### Detection Logic

```typescript
const terminalWidth = process.stdout.columns;
const useCompactMode = terminalWidth < 100;

if (useCompactMode) {
  return <CompactLayout {...props} />;
} else {
  return <FullLayout {...props} />;
}
```

### Breakpoints

| Width | Mode | Layout |
|-------|------|--------|
| 140+ | Full | Spacious, ideal |
| 100-139 | Full | Standard |
| 80-99 | Compact | Optimized |
| 60-79 | Compact | Minimal |
| <60 | Compact | Very tight |

### Performance

Layout switching is instant:
- No re-rendering delay
- Smooth transitions
- No flickering

## Troubleshooting

### Layout Looks Wrong

**Check terminal size:**
```bash
echo "Width: $(tput cols), Height: $(tput lines)"
```

**Resize terminal:**
```bash
# macOS/Linux
resize -s 40 120

# Windows
mode con: cols=120 lines=40
```

### Text Wrapping Incorrectly

**Increase terminal width:**
```bash
# Make terminal wider
# Or use compact mode naturally
```

**Check font size:**
- Larger fonts = fewer columns
- Reduce font size for more space

### Progress Bars Misaligned

**Verify Unicode support:**
```bash
echo "█░▓▒"
# Should show solid/empty blocks
```

**Update terminal:**
- Use modern terminal emulator
- Enable UTF-8 encoding

## Future Enhancements

Planned improvements:
- Three breakpoints (small/medium/large)
- Custom width thresholds
- Orientation detection
- Dynamic font sizing
- Mobile terminal support

## See Also

- [Visual Dashboard](/guide/visual-dashboard) - Dashboard overview
- [Keyboard Shortcuts](/guide/keyboard-shortcuts) - Navigation
- [CLI Reference](/guide/cli-reference) - All commands
- [Installation](/guide/installation) - Setup guide
