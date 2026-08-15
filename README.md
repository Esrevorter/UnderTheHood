# UnderTheHood — X "Under the Hood" Report Viewer

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/esrevorter/underthehood)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-yellow.svg)](https://buymeacoffee.com/esrevorter)

A **Tampermonkey/Greasemonkey userscript** that transforms X's (formerly Twitter) raw "Under the Hood" JSON export into a beautiful, readable reach analysis report with an elegant floating UI.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [Understanding Your Report](#understanding-your-report)
- [Label Types Explained](#label-types-explained)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Privacy & Security](#privacy--security)
- [Support the Developer](#support-the-developer)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🌟 Overview

X provides users with access to their **"Under the Hood"** data—a JSON export showing which posts and account-level labels may have limited content reach during a given period. However, this raw JSON is difficult to interpret.

**UnderTheHood** parses this data client-side and presents it as:
- ✅ Clear verdict on your account standing
- 📊 Visual statistics with donut charts
- 🏷️ Color-coded label cards with severity indicators
- 💡 Actionable insights explaining what each label means for your reach
- 📋 Copyable summary for sharing or record-keeping

Everything runs **locally in your browser**—no data is sent to any server.

---

## ✨ Features

### 🎨 Beautiful Floating UI
- Modern, dark-themed interface matching X's design language
- Floating action button (FAB) for quick access
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Shadow DOM isolation prevents X's CSS from interfering

### 📊 Comprehensive Analysis
- **Account-Level Assessment**: Instant verdict on whether your account faces penalties
- **Post-Level Breakdown**: See exactly which posts were affected and why
- **Visual Metrics**: Donut chart showing percentage of fully visible posts
- **Severity Indicators**: Color-coded badges (High, Medium, Reach Limited, Info)

### 🔍 Label Recognition
Automatically recognizes and styles these X label types:
| Label | Icon | Category |
|-------|------|----------|
| `FOSNR_VIOLENT_SPEECH` | 🗣️ | Freedom of Speech, Not Reach |
| `NSFW_HIGH_PRECISION` | 🔞 | Adult Content — High Confidence |
| `NSFW_HIGH_RECALL` | 🔞 | Adult Content — Possible |
| `SPAM_HIGH_RECALL` | 🤖 | Possible Spam |
| `SPAM_HIGH_PRECISION` | 🤖 | Spam — High Confidence |
| Unknown labels | 🏷️ | Generic fallback styling |

### 💾 Multiple Input Methods
1. **Drag & Drop**: Simply drop your JSON file onto the upload area
2. **File Browser**: Click to browse and select your file
3. **Paste JSON**: Paste raw JSON directly into a text area
4. **Sample Report**: Load a built-in example to preview the UI

### 🛠️ Additional Utilities
- **Copy Summary**: One-click copy of your report summary to clipboard
- **Raw JSON View**: Expandable section showing normalized source data
- **Error Handling**: Clear error messages for invalid input
- **Keyboard Navigation**: Full keyboard shortcut support

---

## 🚀 Installation

### Prerequisites
You need a userscript manager extension installed in your browser:

| Browser | Extension |
|---------|-----------|
| Chrome, Edge, Brave | [Tampermonkey](https://www.tampermonkey.net/) |
| Firefox | [Greasemonkey](https://www.greasespot.net/) or [Tampermonkey](https://www.tampermonkey.net/) |
| Safari | [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887) |
| Opera | [Tampermonkey](https://www.tampermonkey.net/) |

### Step-by-Step Installation

1. **Install a userscript manager** (if you haven't already)
2. **Download the script**:
   - Click the [raw script link](underthehood.user.js)
   - Or clone this repository
3. **Install in your userscript manager**:
   - Tampermonkey: Click "Create a new script" → paste entire contents → save
   - Or click "Install" if prompted automatically
4. **Verify installation**: Visit X.com and look for the blue floating button (bottom-right)

### Update Instructions
When updates are released:
1. Open your userscript manager dashboard
2. Find "X 'Under the Hood' Report Viewer"
3. Click "Check for updates" or reinstall the new version

---

## 📖 How to Use

### Step 1: Download Your "Under the Hood" Report from X

1. Go to **X.com** and log in
2. Navigate to **Settings and Privacy**
3. Select **Your Account** → **Under the Hood**
4. Choose your desired date range
5. Click **Download JSON**
6. Save the file (typically named `under-the-hood.json`)

### Step 2: Open the Parser

- Click the **blue floating button** (📊 icon) in the bottom-right corner
- Or press **Alt+U** on your keyboard

### Step 3: Load Your Data

Choose one of these methods:

#### Method A: Drag & Drop (Recommended)
Simply drag your downloaded JSON file onto the dashed upload area.

#### Method B: File Browser
1. Click the upload area
2. Browse to your JSON file
3. Select and open

#### Method C: Paste JSON
1. Click **"Paste JSON instead"**
2. Open your JSON file in a text editor
3. Copy all contents (Ctrl+A, Ctrl+C)
4. Paste into the text area
5. Click **"Analyze"**

#### Method D: Sample Report
Click **"Load sample report"** to see a demo with example data.

### Step 4: Review Your Report

The parser will display:
- **Verdict Card**: Overall account status (green/yellow/red)
- **Statistics**: Posts analyzed, posts limited, percentage fully visible
- **Donut Chart**: Visual representation of reach health
- **Post Labels**: Detailed breakdown by label type
- **Account Labels**: Any account-wide penalties
- **Insights**: Plain-language explanations of impact
- **Notes**: Official X disclaimers and links

### Step 5: Take Action

- Click **"Copy summary"** to save your results
- Click **"↺ New"** to analyze another report
- Review the **insights section** for actionable information
- Check **raw JSON** if you need technical details

---

## 🧠 Understanding Your Report

### Verdict Categories

| Icon | Status | Meaning |
|------|--------|---------|
| 🎉 | **All Clear** | No labels applied; perfect standing |
| ✅ | **No Account Penalties** | Account is healthy; only individual posts affected |
| ⚠️ | **Notable Post Limits** | >10% of posts had reduced reach |
| 🚨 | **Account Penalties** | Account-level labels detected—review immediately |

### Statistics Explained

- **Posts Analyzed**: Total posts in the reporting period
- **Posts Limited**: Number of posts with any reach restriction
- **Fully Visible %**: Percentage of posts with no limitations

### Severity Levels

| Level | Background Color | Typical Triggers |
|-------|------------------|------------------|
| **High** | Red | Profile-only visibility, content removal |
| **Medium** | Pink | Content warnings applied |
| **Reach Limited** | Yellow | Hidden from non-follower recommendations |
| **Info** | Purple | Minor labeling with minimal impact |

---

## 🏷️ Label Types Explained

### Freedom of Speech, Not Reach (FOSNR)
- **Icon**: 🗣️
- **Color**: Red (#f4212e)
- **Effect**: Post visible only on author's profile; not shown in recommendations
- **About**: Content flagged for violent speech but not removed entirely

### Adult Content — High Confidence (NSFW_HIGH_PRECISION)
- **Icon**: 🔞
- **Color**: Pink (#f91880)
- **Effect**: Behind content warning; hidden from recommendations to non-followers and underage users
- **About**: Automated systems or user reports identified adult content

### Adult Content — Possible (NSFW_HIGH_RECALL)
- **Icon**: 🔞
- **Color**: Orange (#ff7a00)
- **Effect**: Hidden from recommendations to non-followers and underage users
- **About**: Automated detection suggests possible adult content

### Spam — High Confidence (SPAM_HIGH_PRECISION)
- **Icon**: 🤖
- **Color**: Yellow (#ffd400)
- **Effect**: Hidden from recommendations to non-followers
- **About**: Strong indicators of spam or platform manipulation

### Spam — Possible (SPAM_HIGH_RECALL)
- **Icon**: 🤖
- **Color**: Yellow (#ffd400)
- **Effect**: Hidden from recommendations to non-followers
- **About**: Weak indicators of potential spam

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Alt+U** | Open the parser modal |
| **Esc** | Close the modal |
| *(when modal open)* | All standard form controls work normally |

---

## 🔒 Privacy & Security

### Client-Side Processing
✅ **All processing happens locally in your browser**  
✅ **No data is transmitted to external servers**  
✅ **No API calls or network requests**  
✅ **Your JSON never leaves your device**

### Technical Safeguards
- Uses **Shadow DOM** to isolate the UI from X's page
- **No persistent storage** of your data
- **No tracking** or analytics
- Minimal permissions (`@grant none`)

### What This Script Does NOT Do
❌ Collect or store your data  
❌ Modify X's functionality  
❌ Interfere with X's operations  
❌ Send data to third parties  

---

## ☕ Support the Developer

If you find this tool helpful, consider supporting its development:

### [☕ Buy Me a Coffee](https://buymeacoffee.com/esrevorter)

Your support helps:
- Maintain and improve the script
- Add new features and label types
- Keep the tool free and open-source
- Ensure compatibility with X's changes

[**→ Visit buymeacoffee.com/esrevorter**](https://buymeacoffee.com/esrevorter)

---

## 🛠️ Technical Details

### Script Metadata
```javascript
// @name         X "Under the Hood" Report Viewer
// @version      1.0.0
// @match        https://x.com/*
// @match        https://*.x.com/*
// @match        https://twitter.com/*
// @match        https://*.twitter.com/*
// @run-at       document-idle
// @grant        none
// @noframes
```

### Architecture

**Core Components:**
1. **Label Metadata** (`LABEL_META`): Defines colors, icons, and descriptions for known labels
2. **Normalization Engine**: Cleans and standardizes JSON input (trims whitespace, handles edge cases)
3. **Analysis Module** (`analyze()`): Calculates statistics and prepares data for display
4. **Severity Calculator** (`severityOf()`): Determines impact level from effect descriptions
5. **Verdict Engine** (`verdict()`): Generates overall assessment based on findings
6. **Insights Builder** (`buildInsights()`): Creates plain-language explanations
7. **Renderer**: Generates HTML/CSS for the UI components

**Key Functions:**
- `normalize()`: Recursive object/array cleaner
- `analyze()`: Main analysis orchestrator
- `reportHTML()`: Generates full report markup
- `postLabelCard()` / `accountLabelCard()`: Renders individual label cards
- `donutSVG()`: Creates visual percentage indicator

### Styling Approach
- **CSS Variables**: Easy theming and consistency
- **Shadow DOM**: Complete style isolation
- **Responsive Design**: Mobile-first with media queries
- **Accessibility**: Semantic HTML, proper contrast ratios

### Dependencies
**Zero external dependencies** — pure vanilla JavaScript (~585 lines)

---

## ❓ Troubleshooting

### The floating button doesn't appear
- **Solution**: Refresh the page; ensure Tampermonkey is enabled
- **Check**: Userscript dashboard shows script as "enabled"
- **Verify**: You're on x.com, twitter.com, or their subdomains

### "Invalid JSON" error
- **Cause**: Malformed or incomplete JSON
- **Solution**: Re-download from X; ensure file is complete
- **Alternative**: Try pasting JSON directly instead of file upload

### "Missing postLabels/accountLabels" error
- **Cause**: File isn't an Under the Hood export
- **Solution**: Ensure you downloaded from Settings → Under the Hood
- **Note**: Other X exports (archive, data) have different formats

### Styles look broken
- **Cause**: Rare conflict with browser extensions
- **Solution**: Disable other extensions temporarily; try incognito mode
- **Note**: Shadow DOM should prevent most conflicts

### Report shows 0 posts
- **Cause**: Empty reporting period or X API issue
- **Solution**: Try a different date range; wait and re-download

### Can't copy summary
- **Cause**: Browser clipboard permissions
- **Solution**: Grant clipboard access when prompted; manually select/copy as fallback

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### What This Means
✅ Free to use for personal and commercial purposes  
✅ Free to modify and distribute  
✅ No warranty provided  
✅ Attribution appreciated but not required  

---

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional label type support
- Enhanced visualizations
- Export options (PDF, CSV)
- Multi-language support
- Historical trend analysis

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 Changelog

### Version 1.0.0
- Initial release
- Full JSON parsing and visualization
- Support for all current X label types
- Drag-and-drop, file upload, and paste functionality
- Sample report for demonstration
- Copy summary feature
- Raw JSON viewer
- Keyboard shortcuts
- Responsive mobile design

---

## 🔗 Resources

- [X Algorithm Repository](https://github.com/xai-org/x-algorithm)
- [X Reach Limited Guide](https://help.x.com/rules-and-policies/x-reach-limited)
- [X Enforcement Options](https://help.x.com/rules-and-policies/enforcement-options)
- [Tampermonkey Documentation](https://www.tampermonkey.net/documentation.php)

---

## 📬 Contact

- **Developer**: esrevorter
- **Support**: [Buy Me a Coffee](https://buymeacoffee.com/esrevorter)
- **Repository**: [GitHub](https://github.com/esrevorter/underthehood)

---

<div align="center">

**Made with ❤️ for the X community**

[☕ Support Development](https://buymeacoffee.com/esrevorter) • [📖 View Source](https://github.com/esrevorter/underthehood) • [🐛 Report Issue](https://github.com/esrevorter/underthehood/issues)

</div>
