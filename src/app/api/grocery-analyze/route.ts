import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import type { GroceryItem, PriceComparisonResult } from '@/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  let items: GroceryItem[], zipCode: string

  try {
    const body = await req.json()
    items = body.items
    zipCode = body.zipCode
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })
  }
  if (!zipCode || zipCode.length !== 5) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 })
  }

  const itemsList = items
    .map((i) => `- ${i.qty}${i.unit ? ' ' + i.unit : ''} ${i.name}`)
    .join('\n')

  const prompt = `You are a grocery price comparison engine for the US. A user near ZIP code ${zipCode} wants to compare grocery prices.

Their shopping list:
${itemsList}

Generate realistic, accurate price data for these items at these 4 stores: Walmart, Target, Kroger, Aldi.

Use your knowledge of:
- Each store's typical pricing strategy (Aldi = cheapest private label, Walmart = EDLP, Target = slightly premium, Kroger = mid-range with frequent sales)
- Regional price variations for ZIP ${zipCode}
- Current US grocery price levels (2025-2026)
- Unit price normalization
- Which items each store typically stocks

Return ONLY valid JSON in this exact structure with no extra text:

{
  "items": [
    {
      "name": "item name",
      "qty": 1,
      "unit": "lb",
      "cheapest_store": "Aldi",
      "prices": [
        {
          "store": "Walmart",
          "price": 3.98,
          "unit_price": 3.98,
          "unit": "lb",
          "in_stock": "in_stock",
          "is_estimated": true
        },
        {
          "store": "Target",
          "price": 4.49,
          "unit_price": 4.49,
          "unit": "lb",
          "in_stock": "likely",
          "is_estimated": true
        },
        {
          "store": "Kroger",
          "price": 3.79,
          "unit_price": 3.79,
          "unit": "lb",
          "in_stock": "in_stock",
          "is_estimated": true
        },
        {
          "store": "Aldi",
          "price": 2.99,
          "unit_price": 2.99,
          "unit": "lb",
          "in_stock": "in_stock",
          "is_estimated": true
        }
      ],
      "substitution": {
        "name": "Store brand chicken breast",
        "store": "Aldi",
        "price": 2.49,
        "savings": 0.50,
        "reason": "Aldi's Kirkwood brand is equivalent quality at a lower price"
      }
    }
  ],
  "store_totals": [
    { "store": "Walmart", "total": 45.23, "savings": 8.12, "savings_pct": 15.2 },
    { "store": "Target", "total": 51.89, "savings": 1.46, "savings_pct": 2.7 },
    { "store": "Kroger", "total": 47.15, "savings": 6.20, "savings_pct": 11.6 },
    { "store": "Aldi", "total": 38.45, "savings": 14.90, "savings_pct": 27.9 }
  ],
  "best_single_store": { "store": "Aldi", "total": 38.45, "savings": 14.90, "savings_pct": 27.9 },
  "split_strategy": {
    "stores": ["Aldi", "Kroger"],
    "total": 36.20,
    "savings": 17.15,
    "savings_pct": 32.1,
    "items_per_store": {
      "Aldi": ["item1", "item2"],
      "Kroger": ["item3"]
    }
  },
  "baseline_total": 53.35,
  "coupons": [
    {
      "store": "Kroger",
      "description": "Digital coupon: $1 off any chicken purchase over $5",
      "savings": 1.00,
      "expires": "2026-04-30",
      "source": "Kroger Digital Coupons"
    }
  ]
}

Rules:
- Include ALL 4 stores for every item
- Make prices realistic for 2025-2026 US grocery markets
- baseline_total = average of all store totals
- savings = baseline_total - store_total for each store
- The split_strategy should genuinely save more than the best single store when feasible
- Only include substitutions for items where a meaningful cheaper alternative exists
- Mark all prices as is_estimated: true since these are AI estimates
- Include 1-3 realistic coupons if applicable
- Omit the substitution field entirely if no good swap exists
- Return ONLY the JSON object, no markdown, no explanation`

  try {
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    // Extract JSON from response (handle any extra text)
    const raw = textContent.text.trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse AI response as JSON')

    const parsed: PriceComparisonResult = JSON.parse(jsonMatch[0])

    // Basic validation
    if (!parsed.items || !parsed.store_totals || !parsed.best_single_store) {
      throw new Error('Incomplete AI response structure')
    }

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    console.error('grocery-analyze error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
