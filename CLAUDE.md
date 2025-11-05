# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a French Tech entrepreneurial project audit application built with React + Vite + TypeScript. The app collects detailed information from entrepreneurs through a multi-step form and provides personalized recommendations based on their project stage and needs.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with SWC plugin for fast compilation
- **UI Library**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with custom configuration
- **External Integration**: n8n webhook for financial aid processing

## Common Commands

```bash
# Development
npm run dev          # Start dev server on port 8080

# Building
npm run build        # Production build
npm run build:dev    # Development build with source maps

# Quality
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Application Architecture

### Routing Structure

The app uses React Router with the following main routes:

- `/` - Landing page with welcome screen (Index.tsx → Welcome.tsx)
- `/audit` - Multi-step audit form (Audit.tsx → AuditForm.tsx)
- `/results` - Results page that conditionally renders based on project stage
  - Early stage (idea/mvp/prototype) → ResultsEarlyStage.tsx
  - Advanced stage (market/scaling) → ResultsAdvancedStage.tsx
- `/results/second-form` - Additional information collection (SecondFormDetails.tsx)
- `/results/submitted` - Final results after second form (ResultsSecondFormSubmitted.tsx)
- `/recommandations/:projectId` - Dynamic route for project-specific recommendations

All pages use AppLayout.tsx wrapper component for consistent layout.

### Form Flow & Conditional Logic

The AuditForm component (src/components/AuditForm.tsx) implements a complex multi-step form with conditional visibility:

1. **Seven potential steps**: general → motivations → budget → legal → product → finance → contact
2. **Budget step is conditionally shown**: Only displays if user selects "accompagnement" or "formation" in frenchTechMotivations
3. **Dynamic field visibility**: Fields appear/hide based on parent selections (e.g., company creation date only shows if company is created)
4. **Step-by-step validation**: Each step validates independently before allowing progression
5. **Project ID generation**: Uses crypto.randomUUID() on submission for tracking

### Data Flow

1. **Form Submission**:
   - Form data → Supabase `form-responses` table (with project_id)
   - Simultaneously sends projectId + aidesFinancieres to n8n webhook (https://n8n.srv906204.hstgr.cloud/webhook/formulaire-french-tech)
   - Navigates to appropriate results page with projectId in URL query params

2. **Results Routing Logic**:
   - Stage determines initial results page: ["idea", "mvp", "prototype"] → Early, ["market", "scaling"] → Advanced
   - Users can optionally fill second form for more detailed recommendations
   - Second form submission uses `startStepId` prop to resume from specific step

### Supabase Configuration

- **Client Setup**: src/lib/supabaseClient.ts
- **Environment Variables**:
  - `VITE_SUPABASE_PROJECT_ID` - Used to construct URL
  - `VITE_SUPABASE_ANON_KEY` - Anonymous access key
- **Migrations**: Located in supabase/migrations/ (apply via Supabase Dashboard SQL Editor or CLI)
- **Table**: `form-responses` stores all audit form data with JSONB fields for array data

### UI Components

- All UI components from shadcn/ui are in src/components/ui/
- Custom components: AuditForm, ProgressBar, PDFGenerator, SecondFormDetails, Welcome
- Path alias `@/` maps to `src/` directory (configured in vite.config.ts)

## Important Implementation Details

### Form Schema Architecture

The AuditForm uses separate Zod schemas for each step (generalSchema, motivationsSchema, etc.) that are combined into a single formSchema. This allows:
- Step-by-step validation using safeParseAsync
- Partial validation of current step only
- Type-safe form data with TypeScript inference

### Webhook Integration

The application integrates with n8n webhooks for two scenarios:

1. **Form Submission Webhook** (AuditForm.tsx)
   - URL: `https://n8n.srv906204.hstgr.cloud/webhook/formulaire-french-tech`
   - Triggered: After successful form submission to Supabase
   - Payload: `{ projectId, aidesFinancieres }`
   - Purpose: Process financial aid information
   - Fire-and-forget: Errors logged but don't block form submission

2. **Contact Request Webhook** (ContactRequestButton.tsx)
   - URL: `https://n8n.srv906204.hstgr.cloud/webhook/formulaire-1-french-tech-recontact`
   - Triggered: When user clicks "Je souhaite être recontacté" on results page
   - Payload: `{ projectId }`
   - Purpose: Notify team of contact request
   - Fire-and-forget: Errors logged but don't affect user experience (DB update is the primary action)

### PDF Generation

PDFGenerator component uses jspdf and html2canvas for client-side PDF generation of results. It's used on results pages to allow users to download their audit report.

## Environment Setup

Required environment variables in `.env`:
```
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<supabase-project-id>
```

## Deployment

Originally built for Lovable platform but can be deployed anywhere that supports Vite apps. The project includes:
- Lovable-specific: lovable-tagger plugin (only active in development mode)
- Build output: dist/ directory
- Static assets: public/ directory

## Database Migrations

To add database changes:
1. Create new SQL file in supabase/migrations/
2. Apply via Supabase Dashboard SQL Editor or run `supabase db push` if CLI is configured
3. Update README.md in migrations directory

## Form Field Mapping

When modifying the form, note that form field names map to specific database columns with transformations:
- Arrays (frenchTechMotivations, etc.) → JSON.stringify() → JSONB columns
- Dates (creationDate) → null if empty string
- Numbers (userCount, amountRaised) → parseInt() or null

## LocalStorage Auto-Save

The audit form automatically saves progress to localStorage:
- **Storage Keys**:
  - `frenchTechAuditForm` - Stores all form data
  - `frenchTechAuditFormStep` - Stores current step index
- **Auto-save**: Form data is saved automatically on every change using React Hook Form's watch API
- **Auto-load**: When the form component mounts, it loads saved data and resumes at the last step
- **Clear on submit**: LocalStorage is cleared automatically after successful form submission
- **Reset button**: Users can manually clear localStorage and restart the form using the "Recommencer le formulaire" button (only visible when there's saved progress)
