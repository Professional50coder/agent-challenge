// Knowledge base with compliance regulations and guidelines
export const complianceKnowledgeBase = [
  {
    id: "kyc-us",
    title: "KYC Requirements - United States",
    content: `Know Your Customer (KYC) requirements in the US are governed by FinCEN and the Bank Secrecy Act.
    
Key requirements:
- Customer identification program (CIP) required
- Verify identity with government-issued ID
- Collect name, DOB, address, SSN
- Beneficial ownership information for entities
- Risk-based approach to customer due diligence
- Documentation retention for 5+ years
- Enhanced due diligence for high-risk customers
- Ongoing monitoring of customer activity`,
    category: "KYC",
    jurisdiction: "US",
    tags: ["kyc", "identification", "us-regulation"],
  },
  {
    id: "aml-us",
    title: "AML Compliance - United States",
    content: `Anti-Money Laundering (AML) requirements under the Bank Secrecy Act and USA PATRIOT Act.
    
Key requirements:
- Suspicious Activity Report (SAR) filing for transactions over $5,000
- Currency Transaction Report (CTR) for cash transactions over $10,000
- Transaction monitoring and analysis
- Staff training on AML procedures
- Independent audit of AML compliance
- Designation of AML compliance officer
- Written AML policies and procedures
- Customer risk categorization`,
    category: "AML",
    jurisdiction: "US",
    tags: ["aml", "money-laundering", "us-regulation"],
  },
  {
    id: "kyc-eu",
    title: "KYC Requirements - European Union",
    content: `EU KYC requirements under the 5th Anti-Money Laundering Directive (AMLD5).
    
Key requirements:
- Customer due diligence (CDD) mandatory
- Beneficial ownership register access
- Enhanced due diligence for high-risk jurisdictions
- Politically exposed persons (PEP) screening
- GDPR compliance for data handling
- Documentation retention for 5 years
- Risk-based approach implementation
- Ongoing transaction monitoring`,
    category: "KYC",
    jurisdiction: "EU",
    tags: ["kyc", "eu-regulation", "gdpr"],
  },
  {
    id: "crypto-licensing",
    title: "Crypto Business Licensing",
    content: `Licensing requirements for cryptocurrency businesses vary by jurisdiction.
    
Key considerations:
- Money transmitter licenses in US states
- Crypto asset service provider (CASP) registration in EU
- Regulatory sandbox programs
- Application requirements and fees
- Compliance officer designation
- Capital requirements
- Insurance requirements
- Regular reporting obligations`,
    category: "Licensing",
    jurisdiction: "Multiple",
    tags: ["licensing", "regulatory", "business-setup"],
  },
  {
    id: "staking-lending",
    title: "Staking and Lending Compliance",
    content: `Regulatory considerations for crypto staking and lending services.
    
Key requirements:
- Securities law compliance if applicable
- Consumer protection disclosures
- Risk warnings for yield products
- Custody and segregation of customer assets
- Insurance coverage
- Audit requirements
- Operational resilience standards
- Fraud prevention measures`,
    category: "Services",
    jurisdiction: "Multiple",
    tags: ["staking", "lending", "services"],
  },
  {
    id: "sanctions-screening",
    title: "Sanctions and Screening Requirements",
    content: `Compliance with international sanctions programs and screening requirements.
    
Key requirements:
- OFAC sanctions list screening
- UN sanctions compliance
- EU sanctions list screening
- Ongoing transaction monitoring
- Automated screening tools
- False positive management
- Blocked transaction procedures
- Reporting of violations`,
    category: "Sanctions",
    jurisdiction: "Multiple",
    tags: ["sanctions", "screening", "compliance"],
  },
]

// Simple vector similarity calculation (in production, use proper embeddings)
function calculateSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const textWords = text.toLowerCase().split(/\s+/)

  let matches = 0
  for (const word of queryWords) {
    if (textWords.some((w) => w.includes(word) || word.includes(w))) {
      matches++
    }
  }

  return matches / Math.max(queryWords.length, 1)
}

export function searchKnowledgeBase(query: string, limit = 3) {
  const results = complianceKnowledgeBase
    .map((doc) => ({
      ...doc,
      score: calculateSimilarity(query, `${doc.title} ${doc.content} ${doc.tags.join(" ")}`),
    }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return results
}

export function getKnowledgeBaseContext(query: string): string {
  const results = searchKnowledgeBase(query, 3)

  if (results.length === 0) {
    return ""
  }

  return (
    "Relevant compliance information:\n\n" +
    results
      .map((doc) => `[${doc.category} - ${doc.jurisdiction}] ${doc.title}\n${doc.content.substring(0, 300)}...`)
      .join("\n\n")
  )
}
