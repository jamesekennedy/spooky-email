# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install    # Install dependencies
npm run dev    # Start development server on http://localhost:3000
npm run build  # Build for production
npm run preview # Preview production build
```

## Environment Setup

Set `GEMINI_API_KEY` in `.env.local` for the Gemini API integration.

## Architecture Overview

SpookyEmail is a React 19 + TypeScript application that generates personalized email sequences using Google Gemini AI. It runs entirely in the browser with Vite as the build tool.

### Application Flow (5-Step Wizard)

The app follows a linear wizard flow defined in `types.ts` (`AppStep` enum):

1. **Upload** - User uploads a CSV file with contact data
2. **Template** - User writes an email template with `{{Variable}}` placeholders
3. **Mapping** - Map template variables to CSV column headers
4. **Preview** - Generate a test email for one contact to verify quality
5. **Generate** - Batch generate emails for all contacts, auto-downloads CSV results

### Key Files

- `App.tsx` - Main component managing wizard state, authentication (API key stored in localStorage), and step navigation
- `components/Steps.tsx` - All 5 wizard step components in a single file
- `services/geminiService.ts` - Gemini API integration using `@google/genai`, generates email sequences with structured JSON output
- `utils/csvHelper.ts` - CSV parsing (custom implementation, no external deps) and result CSV generation/download
- `types.ts` - TypeScript interfaces for contacts, emails, mapping state, and app config

### State Management

All state lives in `App.tsx` and is passed down as props. Key state includes:
- `csvHeaders`/`csvData` - Parsed CSV data
- `template` - Email template with `{{Variable}}` syntax
- `mapping` - Maps template variables to CSV headers

### Styling

Uses Tailwind CSS with a dark slate/orange color scheme. No separate CSS files.
