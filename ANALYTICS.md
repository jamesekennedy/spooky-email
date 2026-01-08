# Analytics Documentation

SpookyEmail uses [PostHog](https://posthog.com) for product analytics to track user behavior and funnel progression.

## Setup

Analytics requires the `VITE_POSTHOG_KEY` environment variable to be set. In production, this is configured as a GitHub repository secret.

For local development, create a `.env.local` file:
```
VITE_POSTHOG_KEY=phc_your_key_here
```

## Events

### Step Navigation

| Event | Description | Properties |
|-------|-------------|------------|
| `step_viewed` | Fired when user navigates to a step | `step_number`, `step_name` |

### Upload Step (Step 1)

| Event | Description | Properties |
|-------|-------------|------------|
| `csv_uploaded` | User uploads a CSV file | `row_count`, `column_count` |
| `sample_data_used` | User clicks "Try with Sample Data" | - |

### Template Step (Step 2)

| Event | Description | Properties |
|-------|-------------|------------|
| `template_edited` | User modifies the email template | - |
| `variable_inserted` | User clicks a variable chip to insert | `variable_name` |

### Preview Step (Step 3)

| Event | Description | Properties |
|-------|-------------|------------|
| `preview_generated` | Preview email successfully generated | `email_count` |
| `preview_failed` | Preview generation failed | `error` |

### Generate Step (Step 4)

#### Payment Funnel

| Event | Description | Properties |
|-------|-------------|------------|
| `payment_option_viewed` | User sees the payment options | - |
| `free_option_selected` | User focuses on API key input | - |
| `paid_option_selected` | User focuses on credit card input | - |
| `payment_submitted` | User clicks "Pay & Generate" | `amount`, `email_count` |
| `payment_completed` | Payment processing completes | `amount`, `email_count` |

#### Generation

| Event | Description | Properties |
|-------|-------------|------------|
| `generation_started` | Batch generation begins | `contact_count`, `emails_per_contact`, `total_emails`, `is_paid` |
| `generation_completed` | All emails generated | `success_count`, `error_count`, `duration_ms` |

## Funnels to Track in PostHog

### Main Conversion Funnel
1. `step_viewed` (step_number = 1)
2. `step_viewed` (step_number = 2)
3. `step_viewed` (step_number = 3)
4. `step_viewed` (step_number = 4)
5. `generation_completed`

### Payment Conversion Funnel
1. `payment_option_viewed`
2. `paid_option_selected`
3. `payment_submitted`
4. `payment_completed`
5. `generation_started` (is_paid = true)

### Free Tier Funnel
1. `payment_option_viewed`
2. `free_option_selected`
3. `generation_started` (is_paid = false)

## Key Metrics

- **Activation Rate**: Users who complete preview / Users who upload CSV
- **Payment Conversion**: Users who pay / Users who reach Generate step
- **Generation Success Rate**: success_count / (success_count + error_count)
- **Average Generation Time**: Mean of `duration_ms` from `generation_completed`

## Development

In development mode (`npm run dev`), all analytics events are logged to the browser console with the prefix `[Analytics]` for debugging purposes.

## Files

- `services/analytics.ts` - Analytics service with all tracking functions
- `App.tsx` - Initializes PostHog and tracks step navigation
- `components/Steps.tsx` - Tracks all user interactions within steps
