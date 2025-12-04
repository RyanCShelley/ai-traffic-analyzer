# AI Traffic Attribution Analyzer

Analyze AI bot pollution in your Google Analytics data. Identify fake traffic from ChatGPT, AI scrapers, and data crawlers that are inflating your "direct" traffic numbers.

![Dashboard Preview](https://via.placeholder.com/800x400?text=AI+Traffic+Analyzer+Dashboard)

## Features

- **Upload Your Data**: Import CSV exports from BigQuery or Dark Visitors
- **Visual Analysis**: Interactive charts showing bot vs human traffic
- **Channel Breakdown**: See pollution levels across Direct, Organic, Referral
- **Engagement Proof**: Compare engagement times (bots: 0.5s vs humans: 46s)
- **Export Reports**: Download analysis as CSV or JSON
- **Dark Mode**: Easy on the eyes, great for screen recording

## Quick Start

### Option 1: Deploy to Vercel (Easiest)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" and select your repository
4. Click "Deploy" - Vercel auto-detects Vite and configures everything
5. Your app will be live at `your-project.vercel.app`

### Option 2: Deploy to Netlify

1. Push this folder to a GitHub repository
2. Go to [netlify.com](https://netlify.com) and sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Build settings are auto-detected (build command: `npm run build`, publish: `dist`)
6. Click "Deploy site"

### Option 3: Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Format

### BigQuery Traffic Data (CSV)

Export your BigQuery results with these columns:

```csv
channel,traffic_quality,sessions,avg_pages,avg_engagement_sec,conversions,pct_of_channel
Direct,Likely Bot/AI,2141,1,0.5,0,68.8
Direct,Likely Human,516,2.14,46.3,0,16.6
```

**Required columns:**
- `channel` - Channel grouping (Direct, Organic, Referral, etc.)
- `traffic_quality` - Classification (Likely Bot/AI, Likely Human, Uncertain)
- `sessions` - Session count

**Optional columns:**
- `avg_pages` - Average pages per session
- `avg_engagement_sec` - Average engagement in seconds
- `conversions` - Conversion count
- `pct_of_channel` - Percentage of channel (auto-calculated if missing)

### Dark Visitors Agent Data (CSV)

```csv
name,visits,type
ChatGPT-User,1500,AI Assistant
meta-externalagent,4700,AI
Googlebot,4600,Search
```

## BigQuery Query

Use this query to generate the traffic data:

```sql
-- See looker_studio_data_source.sql for the full query
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

## License

MIT - Use freely for your own analytics

## Credits

Built by [SMA Marketing](https://smamarketing.net)
