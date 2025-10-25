# Crypto Compliance Agent - Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- OpenAI API key
- (Optional) SSL certificates for HTTPS

## Local Development with Docker

### 1. Build and Run with Docker Compose

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd crypto-compliance-agent

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# Add your OPENAI_API_KEY

# Build and start services
docker-compose up --build
\`\`\`

The application will be available at `http://localhost:3000`

### 2. Manual Docker Build

\`\`\`bash
# Build the image
docker build -t crypto-compliance-agent:latest .

# Run the container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key_here \
  -e COMPLIANCE_API_KEY=your_api_key \
  crypto-compliance-agent:latest
\`\`\`

## Production Deployment

### 1. Environment Variables

Set the following environment variables in your deployment:

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `COMPLIANCE_API_KEY` - API key for compliance endpoints
- `NEXT_PUBLIC_API_URL` - Public API URL
- `NODE_ENV` - Set to `production`

### 2. Docker Compose Production Setup

\`\`\`bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f compliance-agent

# Stop services
docker-compose down
\`\`\`

### 3. Kubernetes Deployment (Optional)

Create a `k8s-deployment.yaml`:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: compliance-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: compliance-agent
  template:
    metadata:
      labels:
        app: compliance-agent
    spec:
      containers:
      - name: compliance-agent
        image: crypto-compliance-agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: compliance-secrets
              key: openai-api-key
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
\`\`\`

Deploy with:
\`\`\`bash
kubectl apply -f k8s-deployment.yaml
\`\`\`

### 4. SSL/TLS Configuration

For HTTPS support:

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `./ssl/` directory
3. Uncomment HTTPS section in `nginx.conf`
4. Update `server_name` in nginx.conf
5. Restart services: `docker-compose restart nginx`

### 5. Monitoring and Logs

\`\`\`bash
# View application logs
docker-compose logs -f compliance-agent

# View nginx logs
docker-compose logs -f nginx

# Check container health
docker-compose ps

# View resource usage
docker stats
\`\`\`

### 6. Scaling

For horizontal scaling with Docker Compose:

\`\`\`bash
# Scale the compliance-agent service
docker-compose up -d --scale compliance-agent=3
\`\`\`

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Use strong, unique API keys
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Configured in nginx.conf
5. **Non-root User**: Container runs as non-root user
6. **Health Checks**: Configured for automatic restart on failure
7. **Network Isolation**: Services communicate through Docker network

## Troubleshooting

### Container won't start
\`\`\`bash
docker-compose logs compliance-agent
\`\`\`

### Port already in use
\`\`\`bash
# Change port in docker-compose.yml or kill existing process
lsof -i :3000
kill -9 <PID>
\`\`\`

### Out of memory
Increase memory limits in docker-compose.yml or Kubernetes resources

### API key errors
Verify `OPENAI_API_KEY` is set correctly in environment variables

## Performance Optimization

- Container uses multi-stage build for smaller image size
- Gzip compression enabled in nginx
- Static assets cached for 30 days
- Connection pooling configured
- Rate limiting prevents abuse

## Backup and Recovery

\`\`\`bash
# Backup application data
docker-compose exec compliance-agent tar czf /tmp/backup.tar.gz /app

# Restore from backup
docker cp <container-id>:/tmp/backup.tar.gz .
\`\`\`

## Support

For issues or questions, refer to the main README.md or open an issue in the repository.
