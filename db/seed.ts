import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

const platforms = ["reddit", "linkedin", "twitter", "github", "producthunt", "hackernews", "quora"] as const;
const intentTypes = ["buying_intent", "research_intent", "comparison", "complaint", "recommendation", "job_seeking", "general"] as const;
const sentiments = ["positive", "negative", "neutral", "frustrated", "excited", "curious", "urgent", "buying_ready"] as const;
const statuses = ["new", "qualified", "contacted", "responded", "converted", "archived"] as const;

const demoLeads = [
  {
    platform: "reddit", authorName: "Sarah Chen", authorUsername: "sarahc_tech",
    title: "Looking for a better CRM for our SaaS startup",
    content: "We've been using HubSpot but it's getting too expensive as we scale. Anyone have recommendations for a CRM that's built for B2B SaaS? Need something with good API integrations and automation. Budget is around $500/mo for 20 seats.",
    url: "https://reddit.com/r/startups/comments/abc123",
    intentType: "buying_intent", intentScore: 92, sentiment: "urgent", sentimentScore: 0.8,
    aiExplanation: "High buying intent detected: explicit budget mentioned, specific team size, searching for alternative to existing solution. Time-sensitive language indicates active decision-making process.",
    companyName: "DataFlow", companyIndustry: "SaaS", companySize: "20-50", companyLocation: "San Francisco, CA",
    jobTitle: "VP of Operations", email: "sarah@dataflow.io",
  },
  {
    platform: "linkedin", authorName: "Marcus Johnson", authorUsername: "marcus-johnson-sales",
    title: "Struggling with outbound sales at scale",
    content: "Our SDR team is spending 70% of their time on manual prospecting. We're looking for AI-powered sales intelligence tools that can help identify high-intent prospects automatically. What are teams using in 2025?",
    url: "https://linkedin.com/posts/marcus-johnson-sales-123",
    intentType: "buying_intent", intentScore: 85, sentiment: "frustrated", sentimentScore: -0.3,
    aiExplanation: "Strong buying intent: Clear pain point with quantified time waste, actively seeking AI solution, asking for peer recommendations. Frustration indicates urgency to solve.",
    companyName: "ScaleUp Inc", companyIndustry: "Technology", companySize: "200-500", companyLocation: "New York, NY",
    jobTitle: "Head of Sales", email: "marcus@scaleup.io",
  },
  {
    platform: "twitter", authorName: "Elena Rodriguez", authorUsername: "elena_growth",
    title: "",
    content: "Just spent 3 hours manually researching prospects on LinkedIn. There HAS to be a better way. Anyone using AI tools for lead research? What's working for you? #sales #prospecting #AI",
    url: "https://twitter.com/elena_growth/status/123456",
    intentType: "buying_intent", intentScore: 88, sentiment: "frustrated", sentimentScore: -0.5,
    aiExplanation: "High intent: Explicit time waste complaint, direct ask for tool recommendations, hashtag use shows active search. Emotional language ('HAS to be') signals strong motivation.",
    companyName: "GrowthLabs", companyIndustry: "Marketing", companySize: "10-50", companyLocation: "Austin, TX",
    jobTitle: "Growth Lead", email: "elena@growthlabs.co",
  },
  {
    platform: "reddit", authorName: "David Park", authorUsername: "davidp_dev",
    title: "Alternative to ZoomInfo for startup sales?",
    content: "ZoomInfo is great but way too pricey for our stage. Looking for alternatives that offer contact enrichment and intent data. Budget conscious but willing to pay for quality. What do you recommend?",
    url: "https://reddit.com/r/sales/comments/def456",
    intentType: "comparison", intentScore: 78, sentiment: "curious", sentimentScore: 0.4,
    aiExplanation: "Comparison intent with buying signals: Named competitor, acknowledged value but cited price concern, open to alternatives, budget-conscious but not free-only seeker.",
    companyName: "BuildFast", companyIndustry: "Software", companySize: "5-20", companyLocation: "Seattle, WA",
    jobTitle: "Founder & CEO", email: "david@buildfast.dev",
  },
  {
    platform: "github", authorName: "Alex Kim", authorUsername: "alexkim_ml",
    title: "",
    content: "Our ML pipeline needs better monitoring. Currently using a mix of custom scripts and Grafana. Looking for a unified observability solution that handles model drift, data quality, and performance metrics. Open source preferred but evaluating commercial options too.",
    url: "https://github.com/alexkim_ml/ml-pipeline/issues/42",
    intentType: "research_intent", intentScore: 65, sentiment: "curious", sentimentScore: 0.3,
    aiExplanation: "Research intent: Detailed technical requirements, evaluating both OSS and commercial, specific use case identified. Not yet in buying mode but gathering information actively.",
    companyName: "MLWorks", companyIndustry: "AI/ML", companySize: "50-200", companyLocation: "Boston, MA",
    jobTitle: "ML Engineer", email: "alex@mlworks.ai",
  },
  {
    platform: "producthunt", authorName: "Priya Sharma", authorUsername: "priya_s",
    title: "What's the best tool for competitor monitoring in 2025?",
    content: "Trying to keep track of what our competitors are doing across social media, product launches, and pricing changes. Currently doing this manually and it's exhausting. What tools are you using?",
    url: "https://producthunt.com/discussions/competitor-monitoring-2025",
    intentType: "buying_intent", intentScore: 82, sentiment: "frustrated", sentimentScore: -0.4,
    aiExplanation: "Buying intent: Clear pain point (manual work described as 'exhausting'), specific use case, asking for recommendations on a product-focused platform. High likelihood of conversion.",
    companyName: "CompeteIQ", companyIndustry: "Analytics", companySize: "20-50", companyLocation: "London, UK",
    jobTitle: "Product Manager", email: "priya@competeiq.com",
  },
  {
    platform: "hackernews", authorName: "James Wilson", authorUsername: "jwilson",
    title: "Ask HN: How do you find early customers for B2B tools?",
    content: "We've built a developer tool that speeds up API testing by 10x. Launched on HN last week, got great feedback, but struggling to find actual paying customers. How do you go from 'this is cool' to 'here's my credit card'?",
    url: "https://news.ycombinator.com/item?id=12345678",
    intentType: "research_intent", intentScore: 58, sentiment: "curious", sentimentScore: 0.2,
    aiExplanation: "Research intent with future buying potential: Seeking go-to-market advice, has product but needs distribution. May need sales intelligence tools in near future. Good nurture candidate.",
    companyName: "APIFast", companyIndustry: "Developer Tools", companySize: "2-10", companyLocation: "Remote",
    jobTitle: "Co-founder", email: "james@apifast.io",
  },
  {
    platform: "quora", authorName: "Lisa Thompson", authorUsername: "lisa-thompson-5",
    title: "What are the best sales intelligence platforms for small businesses?",
    content: "I run a 15-person consulting firm and we need to improve our prospecting. Currently using LinkedIn Sales Navigator but want something with better intent data and automation. Budget is $300-500/month. Any recommendations?",
    url: "https://quora.com/What-are-the-best-sales-intelligence-platforms",
    intentType: "buying_intent", intentScore: 90, sentiment: "curious", sentimentScore: 0.6,
    aiExplanation: "Very high buying intent: Specific budget range, team size, named current tool and its shortcomings, explicit ask for alternatives. Decision-maker with clear authority and budget.",
    companyName: "Thompson Consulting", companyIndustry: "Consulting", companySize: "10-50", companyLocation: "Chicago, IL",
    jobTitle: "Managing Partner", email: "lisa@thompsonconsulting.com",
  },
  {
    platform: "reddit", authorName: "Ryan O'Brien", authorUsername: "ryanob_tech",
    title: "Anyone else tired of cold outreach with 0.5% reply rates?",
    content: "Our cold email campaigns are dying. Reply rates dropped from 3% to 0.5% in the last year. We're doing everything 'right' — personalized first lines, short emails, clear CTAs. What strategies are working for you in 2025? Is warm outreach the answer?",
    url: "https://reddit.com/r/sales/comments/ghi789",
    intentType: "buying_intent", intentScore: 86, sentiment: "frustrated", sentimentScore: -0.7,
    aiExplanation: "High buying intent: Quantified pain (0.5% reply rate), tried multiple solutions, asking for alternative approaches. Frustration level is very high, indicating readiness to switch strategies/tools.",
    companyName: "OutboundPro", companyIndustry: "Sales", companySize: "50-200", companyLocation: "Denver, CO",
    jobTitle: "Sales Director", email: "ryan@outboundpro.io",
  },
  {
    platform: "linkedin", authorName: "Nina Patel", authorUsername: "nina-patel-revops",
    title: "The future of revenue operations is intent-based",
    content: "After implementing intent-based prospecting, our pipeline quality improved by 3x. Instead of casting wide nets, we focus on accounts showing active buying signals. The key is combining first-party data with third-party intent signals. Happy to share our playbook.",
    url: "https://linkedin.com/posts/nina-patel-revops-456",
    intentType: "recommendation", intentScore: 45, sentiment: "excited", sentimentScore: 0.9,
    aiExplanation: "Recommendation intent: Sharing success story, thought leadership content. Not actively buying but validating the approach. Good for social proof and potentially interested in complementary tools.",
    companyName: "RevOpsHQ", companyIndustry: "Revenue Operations", companySize: "200-500", companyLocation: "Toronto, Canada",
    jobTitle: "VP Revenue Operations", email: "nina@revopshq.com",
  },
  {
    platform: "twitter", authorName: "Tom Bradley", authorUsername: "tomb_saas",
    title: "",
    content: "Just had a demo with @SalesIntelTool and was blown away. The intent scoring is incredibly accurate — identified 3 accounts we'd been sleeping on. If you're in B2B sales, you need to check this out.",
    url: "https://twitter.com/tomb_saas/status/789012",
    intentType: "recommendation", intentScore: 35, sentiment: "excited", sentimentScore: 0.85,
    aiExplanation: "Recommendation/thought sharing: Already using a tool, sharing positive experience. Not a buyer but influencer. Monitor for churn signals or expansion opportunities.",
    companyName: "CloudFirst", companyIndustry: "Cloud Infrastructure", companySize: "500-1000", companyLocation: "San Jose, CA",
    jobTitle: "Enterprise AE", email: "tom@cloudfirst.io",
  },
  {
    platform: "reddit", authorName: "Amy Foster", authorUsername: "amyf_marketing",
    title: "How to track competitor mentions across social media?",
    content: "Our marketing team needs to monitor when competitors are mentioned on Reddit, Twitter, and LinkedIn. We want to understand sentiment, identify trends, and find opportunities to engage. What tools or workflows do you use?",
    url: "https://reddit.com/r/marketing/comments/jkl012",
    intentType: "buying_intent", intentScore: 75, sentiment: "curious", sentimentScore: 0.5,
    aiExplanation: "Buying intent: Clear use case, multiple platforms specified, team-level need. Asking for both tools and workflows indicates active evaluation phase.",
    companyName: "BrandMetric", companyIndustry: "Marketing", companySize: "50-200", companyLocation: "Miami, FL",
    jobTitle: "Marketing Director", email: "amy@brandmetric.co",
  },
];

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed plans
  const existingPlans = await db.select().from(schema.plans);
  if (existingPlans.length === 0) {
    await db.insert(schema.plans).values([
      { name: "starter", priceMonthly: 4900, priceYearly: 47004, leadLimit: 1000, platformLimit: 3, seatLimit: 2, features: JSON.stringify(["reddit_scanning", "x_scanning", "linkedin_scanning", "daily_leads", "email_alerts", "2_campaigns"]) },
      { name: "growth", priceMonthly: 14900, priceYearly: 143040, leadLimit: 5000, platformLimit: 8, seatLimit: 5, features: JSON.stringify(["all_platforms", "realtime_alerts", "competitor_tracking", "slack_alerts", "crm_sync", "ai_outreach", "unlimited_campaigns"]) },
      { name: "scale", priceMonthly: 39900, priceYearly: 383040, leadLimit: 999999, platformLimit: 8, seatLimit: 15, features: JSON.stringify(["all_growth_features", "api_access", "dedicated_support", "custom_integrations", "sso", "audit_logs"]) },
    ]);
    console.log("Plans seeded");
  }

  // Seed default org if not exists
  const existingOrgs = await db.select().from(schema.organizations);
  let orgId: number;
  if (existingOrgs.length === 0) {
    const [org] = await db.insert(schema.organizations).values({
      name: "Demo Organization",
      slug: "demo-org",
      industry: "Technology",
      employeeSize: "20-50",
      country: "United States",
      planId: 2,
    }).$returningId();
    orgId = org.id;

    await db.insert(schema.subscriptions).values({
      organizationId: orgId,
      planId: 2,
      status: "trialing",
      interval: "monthly",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    console.log("Organization seeded");
  } else {
    orgId = existingOrgs[0].id;
  }

  // Seed sources
  const existingSources = await db.select().from(schema.sources).where(eq(schema.sources.organizationId, orgId));
  if (existingSources.length === 0) {
    await db.insert(schema.sources).values([
      { organizationId: orgId, name: "CRM Alternatives", platform: "reddit", type: "keyword", config: JSON.stringify({ keywords: ["CRM alternative", "looking for CRM", "HubSpot alternative"] }) },
      { organizationId: orgId, name: "Sales Intelligence", platform: "linkedin", type: "keyword", config: JSON.stringify({ keywords: ["sales intelligence", "lead generation", "prospecting tools"] }) },
      { organizationId: orgId, name: "HubSpot", platform: "twitter", type: "competitor", config: JSON.stringify({ accounts: ["@HubSpot"] }) },
      { organizationId: orgId, name: "r/startups", platform: "reddit", type: "subreddit", config: JSON.stringify({ subreddit: "startups" }) },
    ]);
    console.log("Sources seeded");
  }

  // Seed leads
  const existingLeads = await db.select().from(schema.leads).where(eq(schema.leads.organizationId, orgId));
  if (existingLeads.length === 0) {
    for (const lead of demoLeads) {
      await db.insert(schema.leads).values({
        organizationId: orgId,
        platform: lead.platform,
        authorName: lead.authorName,
        authorUsername: lead.authorUsername,
        title: lead.title,
        content: lead.content,
        url: lead.url,
        intentType: lead.intentType as "buying_intent" | "research_intent" | "comparison" | "complaint" | "recommendation" | "job_seeking" | "general",
        intentScore: lead.intentScore,
        sentiment: lead.sentiment as "positive" | "negative" | "neutral" | "frustrated" | "excited" | "curious" | "urgent" | "buying_ready",
        sentimentScore: lead.sentimentScore,
        aiExplanation: lead.aiExplanation,
        companyName: lead.companyName,
        companyIndustry: lead.companyIndustry,
        companySize: lead.companySize,
        companyLocation: lead.companyLocation,
        jobTitle: lead.jobTitle,
        email: lead.email,
        isEnriched: true,
        discoveredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }
    console.log(`${demoLeads.length} leads seeded`);
  }

  // Seed activities
  const existingActivities = await db.select().from(schema.activities).where(eq(schema.activities.organizationId, orgId));
  if (existingActivities.length === 0) {
    const activityTypes = ["lead_discovered", "intent_scored", "enrichment_complete"] as const;
    const descriptions = [
      "Lead discovered from Reddit monitoring",
      "AI intent analysis complete — high buying intent detected",
      "Lead enrichment complete — company and contact data added",
      "Lead discovered from LinkedIn keyword monitoring",
      "Sentiment analysis complete — urgent sentiment detected",
    ];
    for (let i = 0; i < 15; i++) {
      await db.insert(schema.activities).values({
        organizationId: orgId,
        leadId: Math.floor(Math.random() * demoLeads.length) + 1,
        type: activityTypes[i % 3],
        description: descriptions[i % 5],
        createdAt: new Date(Date.now() - i * 3600000),
      });
    }
    console.log("Activities seeded");
  }

  // Seed notifications
  const existingNotifications = await db.select().from(schema.notifications).where(eq(schema.notifications.organizationId, orgId));
  if (existingNotifications.length === 0) {
    await db.insert(schema.notifications).values([
      { organizationId: orgId, type: "hot_lead", title: "Hot lead detected: High buying intent from DataFlow", message: "Sarah Chen posted about looking for a CRM alternative with a $500/mo budget" },
      { organizationId: orgId, type: "competitor_mention", title: "Competitor mention: HubSpot pricing discussion", message: "Multiple posts discussing HubSpot pricing concerns detected" },
      { organizationId: orgId, type: "intent_spike", title: "Intent spike: 5 high-intent leads in last hour", message: "Unusual activity detected — 5 leads with intent score >80 discovered" },
    ]);
    console.log("Notifications seeded");
  }

  // Seed ICP profile
  const existingIcp = await db.select().from(schema.icpProfiles).where(eq(schema.icpProfiles.organizationId, orgId));
  if (existingIcp.length === 0) {
    await db.insert(schema.icpProfiles).values({
      organizationId: orgId,
      industries: JSON.stringify(["SaaS", "Technology", "B2B Software"]),
      companySizes: JSON.stringify(["10-50", "50-200", "200-1000"]),
      countries: JSON.stringify(["United States", "Canada", "United Kingdom"]),
      revenueRange: "$1M - $100M",
      technologies: JSON.stringify(["Salesforce", "HubSpot", "Slack", "Zoom"]),
      departments: JSON.stringify(["Sales", "Marketing", "Revenue Operations"]),
      jobTitles: JSON.stringify(["VP Sales", "Head of Growth", "Sales Director", "CMO"]),
      buyingKeywords: JSON.stringify(["looking for", "alternative to", "recommendation", "best tool for"]),
      negativeKeywords: JSON.stringify(["free", "open source only", "hobby project"]),
      painPoints: JSON.stringify(["Manual prospecting", "Low reply rates", "Poor lead quality", "Time-consuming research"]),
    });
    console.log("ICP profile seeded");
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
