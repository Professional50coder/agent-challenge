# Crypto Compliance Agent

A sophisticated AI-powered compliance monitoring and assessment tool for cryptocurrency projects and digital assets. This application helps organizations maintain regulatory compliance, assess risks, and generate detailed compliance reports.

## 🚀 Features

- **Compliance Dashboard**
  - Real-time compliance scoring
  - Risk assessment matrix
  - Detailed findings and recommendations
  - Asset monitoring and tracking
  - Regulatory requirement mapping

- **AI-Powered Analysis**
  - Automated compliance checks
  - Integration with Google's Generative AI
  - Smart content analysis and recommendations
  - Multi-stage assessment process

- **Interactive UI Components**
  - Modern, responsive interface
  - Dynamic progress tracking
  - Interactive compliance questionnaires
  - Detailed finding matrices
  - Enhanced content rendering

## 🛠️ Tech Stack

- **Frontend Framework**
  - Next.js 13+
  - React 18
  - TypeScript

- **UI Components**
  - Radix UI primitives
  - Custom themed components
  - Responsive layouts
  - Dark/Light mode support

- **AI Integration**
  - Google Generative AI
  - Custom AI agents for compliance analysis
  - Multi-stage processing pipeline

- **Development Tools**
  - ESLint for code quality
  - Docker for containerization
  - Next.js API routes
  - Environment-based configuration

## 🚦 Getting Started

1. **Prerequisites**
   ```bash
   - Node.js 16+
   - Docker and Docker Compose (for containerized deployment)
   - Google AI API key (for AI features)
   ```

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/Professional50coder/agent-challenge.git
   cd crypto-compliance-agent

   # Install dependencies
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your API keys and configuration
   ```

4. **Development**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm run start
   # or
   pnpm build
   pnpm start
   ```

## 🐳 Docker Deployment

Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions and configuration options.

## 🔧 Configuration

The application can be configured through environment variables:

- `GOOGLE_AI_API_KEY`: Google AI API key for AI features
- `NEXT_PUBLIC_API_URL`: API endpoint for backend services
- Additional configuration options in `.env.example`

## 📚 Project Structure

```
crypto-compliance-agent/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Base UI components
│   └── ...             # Feature-specific components
├── lib/                # Utility functions and services
├── public/             # Static assets
└── styles/             # Global styles and themes
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./api-docs.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 🤖 AI Features

The Crypto Compliance Agent leverages advanced AI capabilities to:
- Analyze compliance requirements
- Generate risk assessments
- Provide actionable recommendations
- Monitor regulatory changes
- Generate compliance reports

## 📋 Requirements

- Node.js 16.0 or later
- Modern web browser with JavaScript enabled
- Docker (for containerized deployment)
- Minimum 2GB RAM for development
- Storage space for dependencies and builds
