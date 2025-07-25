# Patent Cost Calculator API Documentation

## Overview
The Patent Cost Calculator API provides comprehensive patent cost estimation with AI-powered insights across USPTO, EPO, and IPOS jurisdictions. Built with Next.js App Router and real patent office data.

## Base URL
- Development: `http://localhost:3003`
- Production: `https://your-domain.com`

## API Endpoints

### 1. Calculate Basic Patent Costs
**Endpoint:** `POST /api/calculate-costs`

Calculate patent costs with basic breakdown (free tier).

**Request Body:**
```json
{
  "jurisdictions": ["USPTO", "EPO", "IPOS"],
  "entityType": "standard",
  "durationYears": 20,
  "industrySector": "Technology & Software",
  "businessDescription": "AI-powered SaaS platform",
  "claimCount": 15,
  "pageCount": 35
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "totalCost": 45000,
    "jurisdictionTotals": {
      "USPTO": 15000,
      "EPO": 18000,
      "IPOS": 12000
    },
    "currencyByJurisdiction": {
      "USPTO": "USD",
      "EPO": "EUR", 
      "IPOS": "SGD"
    },
    "calculationDate": "2025-01-15T10:30:00Z"
  }
}
```

### 2. Generate AI Insights
**Endpoint:** `POST /api/ai-insights`

Generate AI-powered strategic insights and recommendations.

**Request Body:**
```json
{
  "type": "patent_insights",
  "input": {
    "jurisdictions": ["USPTO", "EPO"],
    "businessDescription": "AI-powered SaaS platform"
  },
  "result": {
    "totalCost": 45000,
    "jurisdictionTotals": {"USPTO": 25000, "EPO": 20000}
  }
}
```

**Response:**
```json
{
  "success": true,
  "insights": [
    {
      "type": "cost_comparison",
      "title": "Jurisdiction Cost Analysis",
      "message": "USPTO offers better value for US market focus",
      "priority": "high",
      "confidenceScore": 0.9,
      "actionable": true
    }
  ]
}
```

### 3. Form Suggestions (AI-Powered)
**Endpoint:** `POST /api/form-suggestions`

Get AI-powered suggestions for form fields based on business description.

**Request Body:**
```json
{
  "businessDescription": "We develop AI-powered healthcare diagnostics tools",
  "ipType": "patent"
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": {
    "industrySector": "Medical Devices",
    "entityType": "small",
    "claimCount": 20,
    "pageCount": 45,
    "suggestedJurisdictions": ["USPTO", "EPO"],
    "reasoning": "Healthcare diagnostics benefit from strong IP protection in major markets"
  }
}
```

### 4. Create Checkout Session
**Endpoint:** `POST /api/create-checkout`

Create a payment session for detailed analysis upgrade ($29).

**Request Body:**
```json
{
  "calculationId": "calc_123456",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "mock_1642342800000_calc_123456",
  "url": "http://localhost:3003/dashboard/payment-demo?session_id=mock_1642342800000_calc_123456",
  "message": "This is a demo - no actual payment will be processed"
}
```

### 5. Get Detailed Analysis (Post-Payment)
**Endpoint:** `POST /api/detailed-costs`

Retrieve detailed cost analysis after payment confirmation.

**Request Body:**
```json
{
  "calculationId": "calc_123456",
  "paymentId": "payment_123456"
}
```

**Response:**
```json
{
  "success": true,
  "detailedResult": {
    "totalCost": 45000,
    "costBreakdown": {
      "USPTO": {
        "preGrant": {"filing": 350, "search": 720},
        "postGrant": {"maintenance_3": 1600},
        "translation": {},
        "agent": {"preparation": 5000}
      }
    },
    "yearByYearCosts": {
      "USPTO": {"1": 6070, "3": 1600, "7": 3600}
    },
    "potentialSavings": {
      "USPTO": [{
        "type": "entity_downgrade", 
        "description": "Small entity discount",
        "potentialSaving": 7500
      }]
    }
  },
  "aiInsights": [...]
}
```

### 6. Stripe Webhook Handler
**Endpoint:** `POST /api/webhook/stripe`

Handle Stripe payment confirmations and trigger detailed analysis.

**Headers Required:**
- `stripe-signature`: Stripe webhook signature

**Handles Events:**
- `checkout.session.completed`
- `payment_intent.payment_failed`
- Subscription events (future)

## Authentication

Currently, the API is open for development. In production, implement:
- API key authentication for sensitive endpoints
- Rate limiting to prevent abuse
- User session validation for personalized features

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Missing or invalid authentication
- `404`: Not Found - Resource doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error

## Data Sources

- **Real Patent Office Data**: USPTO, EPO, IPOS fee schedules
- **Exchange Rates**: Live currency conversion
- **AI Insights**: OpenAI GPT-4 powered analysis
- **Grant Programs**: Government funding opportunities database

## Rate Limits

- **Free Tier**: 10 calculations per hour
- **Paid Tier**: 100 calculations per hour
- **AI Insights**: 20 requests per hour
- **Form Suggestions**: 30 requests per hour

## SDK Examples

### JavaScript/TypeScript
```javascript
const response = await fetch('/api/calculate-costs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jurisdictions: ['USPTO', 'EPO'],
    entityType: 'small',
    durationYears: 15,
    businessDescription: 'Green energy storage solutions'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Total cost:', data.result.totalCost);
}
```

### Python
```python
import requests

response = requests.post('http://localhost:3003/api/calculate-costs', 
  json={
    'jurisdictions': ['USPTO', 'EPO'],
    'entityType': 'small', 
    'durationYears': 15,
    'businessDescription': 'Green energy storage solutions'
  }
)

data = response.json()
if data['success']:
    print(f"Total cost: {data['result']['totalCost']}")
```

## Business Model

- **Basic Analysis**: Free with limited insights
- **Detailed Analysis**: $29 one-time fee includes:
  - Year-by-year cost breakdown
  - Potential savings identification
  - Maintenance strategy recommendations
  - AI-powered strategic insights
  - Grant program matching

## Support

- **Documentation**: `/docs`
- **Status Page**: `/status`
- **Contact**: support@patent-calculator.com
- **GitHub**: https://github.com/your-org/patent-calculator

---

*Last updated: January 2025*
*API Version: 1.0* 