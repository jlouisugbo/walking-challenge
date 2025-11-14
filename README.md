# 🏃 Step Challenge Tracker

A modern, feature-rich web application for managing a 30-day step challenge competition. Built for the "End the Semester Well!" challenge running from November 10 - December 10, 2025.

![Step Challenge Tracker](https://img.shields.io/badge/React-18+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📊 Dashboard
- Real-time challenge overview with countdown timer
- Prize pool display ($40, $25, $15 + team bonus)
- Top 3 leaderboard with medals and prizes
- Challenge statistics (total steps, averages, milestones)
- Milestone progress tracker (150k, 225k, 300k)
- Team standings (after Heat Week)

### 🏆 Full Leaderboard
- Complete participant rankings with search and filter
- Sort by rank, name, steps, progress, or team
- Filter by team or milestone achievements
- Visual progress bars and milestone indicators
- Raffle ticket counts
- Prize indicators for top 3

### 👥 Team Rankings
- Team comparison charts
- Individual member contributions
- Team statistics (total steps, averages)
- Member breakdowns
- Leading team highlight

### 🔥 Heat Week
- Special first week competition view
- Top 5 captain selection tracker
- Timeline of Heat Week progress
- Captain badges and highlights

### ⚙️ Admin Panel

#### Quick Sync Tab
- **Paste Pacer leaderboard** directly from the app
- Intelligent parsing of name, steps, rank format
- Preview changes before applying
- Automatic participant creation
- Step update tracking (old → new with diff)

#### Manual Entry Tab
- Add new participants
- Update step counts manually
- Quick increment buttons (+1k, +5k, +10k)
- Edit and delete participants
- Real-time updates

#### Team Assignment Tab
- Assign participants to teams
- Support for up to 5 default teams
- Easy dropdown selection
- Bulk team management

#### Settings Tab
- Configure challenge dates
- Set goal steps (default: 300,000)
- Customize prize amounts
- Adjust milestones

#### Data Management Tab
- Export data as JSON backup
- Import data from backup
- Reset challenge (with confirmation)
- Download backup files

## 🎯 Challenge Structure

### Week 1: Heat Week (Nov 10-17)
- Individual competition
- Top 5 become team captains
- Intense personal competition

### Weeks 2-4: Team Competition
- Teams of 3 members
- Combined step totals
- Team bonus prize for winners

### Milestones & Raffle System
- **150,000 steps** → 1 raffle ticket ⭐
- **225,000 steps** → 2 raffle tickets total ⭐⭐
- **300,000 steps** → 3 raffle tickets total ⭐⭐⭐

### Prize Structure
- 🥇 1st Place: $40
- 🥈 2nd Place: $25
- 🥉 3rd Place: $15
- 🏆 Team Bonus: $50 (split among winning team)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd walking-challenge

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📱 Usage Guide

### Initial Setup

1. **Navigate to Admin Panel**
   - Click "Admin" in the bottom navigation (mobile) or top navigation (desktop)

2. **Add Participants**
   - Use "Quick Sync" tab to paste Pacer leaderboard
   - Or use "Manual Entry" to add one by one

3. **Assign Teams** (after Heat Week)
   - Go to "Team Assignment" tab
   - Select team for each participant

### Daily Updates

1. **Copy leaderboard from Pacer app**
   - Open Pacer leaderboard
   - Copy all participant data

2. **Paste in Admin → Quick Sync**
   - Paste the text
   - Click "Parse & Preview"
   - Review changes
   - Click "Confirm & Apply Updates"

3. **Done!**
   - All pages update automatically
   - Rankings recalculate
   - Milestones check
   - Raffle tickets update

### Pacer Format Example

The app parses this format:
```
Nadia
57,449
1
Joel
55,709
2
...
```

Each participant needs 3 lines:
1. Name
2. Steps (with or without commas)
3. Rank number

## 🎨 Design Features

- **Dark Mode** - Professional dark theme optimized for extended viewing
- **Glassmorphism** - Modern frosted glass card effects
- **Responsive** - Mobile-first design with tablet and desktop layouts
- **Animations** - Smooth transitions, counter animations, pulse effects
- **Sports Betting Aesthetic** - Inspired by PrizePicks and DraftKings
- **Gradient Accents** - Electric blue (#00d4ff) primary accent
- **Medal Gradients** - Gold, silver, bronze gradient effects

## 🗂️ Project Structure

```
src/
├── components/
│   ├── common/          # Layout, Navigation
│   └── ui/              # Reusable UI components
├── contexts/            # React Context (state management)
├── pages/               # Main page components
├── types/               # TypeScript type definitions
├── utils/               # Utilities (calculations, storage, parser)
└── index.css            # Tailwind CSS + custom styles
```

## 💾 Data Storage

- **LocalStorage** - All data stored in browser
- **No backend required** - Fully client-side
- **Auto-save** - Changes persist automatically
- **Export/Import** - Download backups as JSON
- **Safe** - Confirmation dialogs for destructive actions

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Recharts** - Chart visualization (prepared)

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Vite and deploy

Or use CLI:
```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Other Platforms

Build the project and upload the `dist/` folder to any static hosting:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- Cloudflare Pages

## 🔧 Configuration

Edit `src/types/index.ts` to change default settings:

```typescript
export const DEFAULT_CONFIG: ChallengeConfig = {
  startDate: '2025-11-10',
  endDate: '2025-12-10',
  goalSteps: 300000,
  milestones: [150000, 225000, 300000],
  prizes: {
    first: 40,
    second: 25,
    third: 15,
    teamBonus: 50,
  },
  teamSize: 3,
  heatWeekEnabled: true,
  teamCompetitionEnabled: true,
};
```

## 📊 Features Breakdown

### Automatic Calculations
- ✅ Ranking by steps (handles ties)
- ✅ Milestone detection
- ✅ Raffle ticket counting
- ✅ Progress percentages
- ✅ Team totals and averages
- ✅ Team rankings
- ✅ Prize assignments
- ✅ Days remaining/elapsed
- ✅ Heat Week detection

### UI Components
- ✅ ProgressBar with color coding
- ✅ MilestoneIndicator with stars
- ✅ StatsCard with animations
- ✅ ParticipantCard with ranks
- ✅ TeamBadge with colors
- ✅ CountdownTimer with real-time updates

### Data Management
- ✅ LocalStorage persistence
- ✅ Export to JSON
- ✅ Import from JSON
- ✅ Backup downloads
- ✅ Data validation
- ✅ Error handling

## 🐛 Troubleshooting

### Data Not Persisting
- Check if localStorage is enabled in your browser
- Check browser privacy settings
- Try a different browser

### Paste Import Not Working
- Ensure format matches: Name, Steps, Rank (3 lines per participant)
- Remove any extra spaces or characters
- Try the "Manual Entry" tab instead

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Sample Data

Pre-populated sample data is available in `src/utils/sampleData.ts` for testing:
- 14 participants
- Varying step counts
- Team assignments
- Sample Pacer text format

## 🤝 Contributing

This project was created for a specific challenge but can be adapted for other competitions:
- Running challenges
- Reading challenges
- Workout challenges
- Any metric-based competition

## 📄 License

MIT License - Feel free to use and modify for your own challenges!

## 🎉 Acknowledgments

Built for the "End the Semester Well!" step challenge (Nov 10 - Dec 10, 2025) with 14+ participants.

Special thanks to all participants:
Nadia, Joel, Shreya, Anjali, Grace, Ataallah, Cynné, Anelé, Kemet, Gbemi, and more!

---

**Made with ❤️ for the walking community**

Need help? Open an issue or reach out to the challenge organizer!
