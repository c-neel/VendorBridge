import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const aiRouter = Router();
aiRouter.use(authenticate);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return generateMockResponse(prompt);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API failed, using mock response');
      return generateMockResponse(prompt);
    }

    const data = await response.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateMockResponse(prompt);
  } catch (error) {
    console.warn('Gemini API error, using mock response:', error);
    return generateMockResponse(prompt);
  }
}

function generateMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('recommend') || lower.includes('vendor')) {
    return `## AI Vendor Recommendation\n\nBased on analysis of historical performance, pricing competitiveness, and delivery reliability:\n\n**Recommended: TechNova Solutions Pvt Ltd**\n- Trust Score: 92/100\n- On-Time Delivery: 95%\n- Price Competitiveness: 88/100\n\n**Reasoning:** TechNova consistently delivers on time with high quality. Their pricing is competitive for the IT hardware category, and they maintain strong after-sales support.\n\n**Confidence Level:** 89%`;
  }

  if (lower.includes('risk') || lower.includes('alert')) {
    return `## Procurement Risk Analysis\n\n### Active Risks Detected:\n\n1. **🔴 Vendor Concentration** — 70% of IT software procurement goes through 2 vendors. Diversification recommended.\n\n2. **🟡 Delivery Delays** — FurnishPro Ltd showing 20% delay rate in last quarter.\n\n3. **🟡 Price Anomaly** — DigitalEdge Marketing quoted 35% above market rate.\n\n### Recommendations:\n- Onboard 2-3 new IT software vendors\n- Issue performance notice to FurnishPro\n- Request revised quotation from DigitalEdge`;
  }

  if (lower.includes('approval') || lower.includes('pending')) {
    return `## Approval Summary\n\n### Pending Items:\n- **PR-2024-0005**: Marketing Event Booth Materials — ₹1,80,000 (awaiting Senior Manager)\n- **PR-2024-0006**: Server Room AC Maintenance — ₹60,000 (awaiting Senior Manager)\n\n### Recent Approvals:\n- PR-2024-0007: AWS Reserved Instances — ₹45,00,000 ✅ Approved by Director\n- PR-2024-0002: Office Stationery — ₹35,000 ✅ Approved by Manager\n\n### KPIs:\n- Average approval time: 8.2 hours\n- Approval rate: 82%`;
  }

  if (lower.includes('rfq') || lower.includes('generate')) {
    return `## Generated RFQ\n\n**Title:** Supply of Developer Laptops\n\n**Description:** Request for quotation for high-performance business laptops for software development team.\n\n**Specifications:**\n- Processor: Intel i7 13th Gen or equivalent\n- RAM: 16GB DDR5\n- Storage: 512GB NVMe SSD\n- Display: 15.6" FHD IPS\n- OS: Windows 11 Pro\n- Warranty: Minimum 3 years on-site\n\n**Suggested Vendors:**\n1. TechNova Solutions (Trust Score: 92)\n2. CloudMinds Technologies (Trust Score: 88)\n\n**Estimated Budget:** ₹85,000 per unit`;
  }

  if (lower.includes('spend') || lower.includes('analytics')) {
    return `## Spend Analytics Summary\n\n### Q4 2024 Highlights:\n- **Total Procurement Spend:** ₹42.3 Lakhs\n- **IT Spending:** ₹28.5L (↑18% from Q3)\n- **Top Vendor:** TechNova Solutions — ₹19.4L\n- **Average PO Value:** ₹6.5L\n\n### Insights:\n- IT department accounts for 67% of total spend\n- Procurement cycle time reduced by 25% compared to Q3\n- 3 vendors account for 80% of total procurement value\n\n### Recommendations:\n- Consider bulk purchasing agreements for IT hardware\n- Diversify vendor base for office supplies category`;
  }

  return `## VendorBridge AI Assistant\n\nI can help you with:\n\n1. **Vendor Recommendations** — "Which vendor should I choose for IT hardware?"\n2. **Risk Analysis** — "Show me risky vendors"\n3. **Approval Status** — "What approvals are pending?"\n4. **RFQ Generation** — "Create an RFQ for 20 laptops"\n5. **Spend Analytics** — "Show procurement spend summary"\n6. **Performance Insights** — "How is our procurement health?"\n\nFeel free to ask any procurement-related question!`;
}

// POST /api/ai/chat
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Enrich prompt with context
    const contextInfo = context ? `\nCurrent context: ${JSON.stringify(context)}` : '';
    const prompt = `You are VendorBridge AI, an intelligent procurement assistant. You help with vendor management, procurement decisions, spend analytics, and risk detection. Respond in a professional but friendly manner using markdown formatting.\n\nUser question: ${message}${contextInfo}\n\nProvide a helpful, data-driven response.`;

    const response = await callGemini(prompt);
    res.json({ response, model: GEMINI_API_KEY ? 'gemini' : 'mock' });
  } catch (error: any) {
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// POST /api/ai/recommend-vendor
aiRouter.post('/recommend-vendor', async (req, res) => {
  try {
    const { rfqId } = req.body;

    const quotations = await prisma.quotation.findMany({
      where: { rfqId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: { vendor: { include: { score: true } } },
    });

    if (quotations.length === 0) {
      return res.json({ recommendation: null, message: 'No quotations found for comparison.' });
    }

    // Calculate composite score
    const scored = quotations.map((q) => {
      const vs = q.vendor.score;
      const priceScore = 100 - (Number(q.grandTotal) / Math.max(...quotations.map(x => Number(x.grandTotal)))) * 100;
      const deliveryScore = 100 - (q.deliveryDays / Math.max(...quotations.map(x => x.deliveryDays))) * 100;
      const trustScore = vs ? Number(vs.trustScore) : 50;
      const qualityScore = vs ? Number(vs.qualityScore) : 50;

      const compositeScore = (priceScore * 0.3) + (deliveryScore * 0.2) + (trustScore * 0.3) + (qualityScore * 0.2);

      return { ...q, compositeScore, priceScore, deliveryScore, trustScore };
    });

    scored.sort((a, b) => b.compositeScore - a.compositeScore);
    const recommended = scored[0];

    // Update AI fields
    for (const s of scored) {
      await prisma.quotation.update({
        where: { id: s.id },
        data: {
          aiScore: Math.round(s.compositeScore * 100) / 100,
          isAiRecommended: s.id === recommended.id,
          aiReasoning: s.id === recommended.id
            ? `Best overall score (${s.compositeScore.toFixed(1)}). Strong balance of competitive pricing, fast delivery, and high vendor trust.`
            : `Score: ${s.compositeScore.toFixed(1)}. ${s.compositeScore < 70 ? 'Below threshold for recommendation.' : 'Good alternative option.'}`,
        },
      });
    }

    res.json({
      recommended: {
        vendorName: recommended.vendor.companyName,
        vendorCode: recommended.vendor.vendorCode,
        quotationNumber: recommended.quotationNumber,
        grandTotal: recommended.grandTotal,
        deliveryDays: recommended.deliveryDays,
        compositeScore: recommended.compositeScore,
        trustScore: recommended.trustScore,
      },
      allScores: scored.map(s => ({
        vendorName: s.vendor.companyName,
        quotationNumber: s.quotationNumber,
        grandTotal: s.grandTotal,
        deliveryDays: s.deliveryDays,
        compositeScore: s.compositeScore,
      })),
    });
  } catch (error: any) {
    console.error('AI recommend error:', error);
    res.status(500).json({ error: 'AI recommendation failed' });
  }
});

// POST /api/ai/generate-rfq
aiRouter.post('/generate-rfq', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const prompt = `Based on this requirement: "${description}", generate a structured RFQ (Request for Quotation) with the following JSON fields: title, description, quantity, unitOfMeasure, estimatedBudget, priority (LOW/MEDIUM/HIGH/URGENT), specifications. Return ONLY valid JSON, no markdown.`;

    const response = await callGemini(prompt);

    // Try to parse as JSON, fallback to mock
    try {
      const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      res.json(parsed);
    } catch {
      // Mock structured response
      res.json({
        title: `Supply of ${description.substring(0, 50)}`,
        description: description,
        quantity: 1,
        unitOfMeasure: 'pcs',
        estimatedBudget: 100000,
        priority: 'MEDIUM',
        specifications: 'As per requirements discussed. Please provide detailed specifications with your quotation.',
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'RFQ generation failed' });
  }
});

// GET /api/ai/approval-summary/:prId
aiRouter.get('/approval-summary/:prId', async (req, res) => {
  try {
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id: req.params.prId },
      include: {
        department: true,
        requestedBy: { include: { user: { select: { firstName: true, lastName: true } } } },
        rfqs: { include: { quotations: { include: { vendor: { include: { score: true } } } } } },
      },
    });

    if (!pr) return res.status(404).json({ error: 'PR not found' });

    const summary = {
      prNumber: pr.prNumber,
      title: pr.title,
      budget: pr.estimatedBudget,
      department: pr.department.name,
      requestedBy: `${pr.requestedBy.user.firstName} ${pr.requestedBy.user.lastName}`,
      priority: pr.priority,
      aiInsight: `This ${pr.priority.toLowerCase()} priority request from ${pr.department.name} for "${pr.title}" has an estimated budget of ₹${Number(pr.estimatedBudget).toLocaleString()}. ${pr.justification || 'No business justification provided.'}`,
      riskLevel: Number(pr.estimatedBudget) > 1000000 ? 'HIGH' : Number(pr.estimatedBudget) > 100000 ? 'MEDIUM' : 'LOW',
      recommendation: Number(pr.estimatedBudget) > 500000
        ? 'High-value request. Recommend detailed vendor evaluation and competitive bidding.'
        : 'Standard procurement. Proceed with normal approval workflow.',
    };

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate approval summary' });
  }
});
