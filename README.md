# New York State Tax Allocation Tool

A web application that helps New York State taxpayers understand exactly where their tax dollars go by providing detailed breakdowns of state budget allocations based on their individual tax contributions.

## About

This tool allows users to:
- Calculate their NY State tax liability from income information
- Enter their actual tax amount directly 
- See a detailed breakdown of how their tax dollars are allocated across state programs
- Understand the impact of their contribution to education, healthcare, infrastructure, and other vital services

## Features

### Tax Calculation
- 🧮 **Complete NY State Tax Calculator** - All 5 filing statuses with accurate 2025 tax brackets
- 💰 **Flexible Input Methods** - Calculate from income or enter tax amount directly
- 📊 **Real-time Calculations** - Instant allocation breakdowns as you type

### Budget Allocations
- 🏫 **Education & School Aid** - See your contribution to K-12 schools, special education, and school construction
- 🏥 **Healthcare & Medicaid** - Understand your support for hospitals, nursing homes, and mental health services
- 🚧 **Infrastructure** - Track funding for highways, bridges, MTA, and transportation networks
- 🛡️ **Public Safety** - View contributions to state police, courts, and emergency services

### Data & Analytics
- 📈 **Usage Tracking** - Anonymous analytics stored in Cloudflare D1 database
- 🔍 **Data Sources** - Based on official NY State FY 2026 budget documents
- 📋 **Tax Expenditures** - See how your taxes fund credits and exemptions for other New Yorkers

### Technical Features
- 🚀 **Fast Global Deployment** - Built on Cloudflare Workers
- 📱 **Responsive Design** - Works perfectly on all devices
- ♿ **Accessible** - High contrast text and screen reader friendly
- 🔒 **Privacy-First** - No personal data stored, only anonymous usage statistics

## Supported Filing Statuses

- **Single** - Standard individual filers
- **Married Filing Jointly** - Married couples filing together  
- **Married Filing Separately** - Married couples filing separate returns
- **Head of Household** - Single parents and qualifying households
- **Qualifying Widow(er)** - Recently widowed taxpayers with dependent children

## Tax Types Supported

- **Personal Income Tax** - Individual NY State income tax with complete allocation breakdown
- **Corporate Tax** - Business tax allocations focused on economic development programs
- **Sales Tax** - Consumer tax contributions including local government aid

## Database Schema

The application stores anonymous usage data in Cloudflare D1:

```sql
tax_calculations (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  income REAL,
  filing_status TEXT,
  tax_type TEXT,
  calculated_tax REAL,
  tax_amount_entered REAL,
  calculation_method TEXT,
  allocations TEXT, -- JSON
  created_at DATETIME,
  user_agent TEXT
)
```

## Development

### Prerequisites

- Node.js 18+
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-york-state-tax-allocation
```

2. Install dependencies:
```bash
npm install
```

3. Set up Cloudflare D1 database:
```bash
npx wrangler d1 migrations apply tax-allocation-db --local
npx wrangler d1 migrations apply tax-allocation-db --remote
```

### Local Development

Start the development server:
```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Database Management

Query local database:
```bash
npx wrangler d1 execute tax-allocation-db --command "SELECT COUNT(*) FROM tax_calculations"
```

Query remote database:
```bash
npx wrangler d1 execute tax-allocation-db --remote --command "SELECT COUNT(*) FROM tax_calculations"
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

### Environment Configuration

The application uses these Cloudflare bindings:
- `TAX_DB` - D1 database for analytics
- `TAX_DATA` - KV namespace for caching (optional)

## Data Sources

This tool uses official data from:
- NY State FY 2026 Enacted Budget
- OpenBudget.NY.Gov
- NY State Department of Taxation and Finance
- NY State Tax Expenditure Report FY 2026

## Contributing

This project provides transparency into New York State government spending. Contributions that improve accuracy, accessibility, or user experience are welcome.

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling  
- ESLint + Prettier for code formatting
- React Router 7 for routing

## License

MIT License - Built to serve New York State taxpayers

---

Made with ❤️ by Cody Hall
