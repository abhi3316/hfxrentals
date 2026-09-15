# Hosting HfxRentals on AWS

This guide provides three flexible methods to deploy the **HfxRentals** frontend to AWS. Because the app is built with Vite + React, it generates a fast static single-page application (`dist/`) that can be hosted on AWS for pennies per month with zero server maintenance.

---

## Method 1: AWS Amplify (Recommended - Fastest & Easiest)

AWS Amplify connects directly to your GitHub/GitLab repository and automatically builds and deploys every time you push code.

### Steps:
1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial HfxRentals commit"
   # Add your remote and push
   git remote add origin https://github.com/your-username/hfxrentals.git
   git push -u origin main
   ```
2. Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify).
3. Click **"New App"** > **"Host web app"**.
4. Select **GitHub** and authorize AWS to access your repository.
5. Select the `hfxrentals` repository and `main` branch.
6. Amplify will automatically detect the included `amplify.yml` configuration:
   * Build command: `npm run build`
   * Base directory: `dist`
7. Click **"Save and Deploy"**.
8. Within 2 minutes, you will have an SSL-secured live URL (e.g. `https://main.d12345.amplifyapp.com`). You can connect a custom domain (e.g., `hfxrentals.ca`) with one click in Domain Management.

---

## Method 2: AWS S3 + CloudFront (Lowest Cost: ~$0.50/month)

This is the industry-standard architecture for ultra-high performance and minimum cost.

### Prerequisites:
* AWS CLI installed and configured (`aws configure`).

### Steps:
1. **Create an S3 Bucket**:
   ```bash
   aws s3 mb s3://hfxrentals-web-app --region ca-central-1
   ```
2. **Make the deploy script executable and run it**:
   ```bash
   chmod +x deploy-aws-s3.sh
   ./deploy-aws-s3.sh hfxrentals-web-app
   ```
3. **Connect CloudFront (CDN + Free HTTPS)**:
   * In the AWS Console, open **CloudFront** and click **Create Distribution**.
   * Origin domain: Select your `hfxrentals-web-app.s3.amazonaws.com` bucket.
   * Enable **Origin Access Control (OAC)** so the bucket remains private and only accessible via CloudFront.
   * Under **Default Root Object**, type `index.html`.
   * Under **Error Pages**, configure custom error responses:
     * HTTP Error Code: `403` and `404`
     * Response page path: `/index.html`
     * HTTP Response Code: `200` (required for Single Page Application routing).
4. Run subsequent updates anytime with:
   ```bash
   ./deploy-aws-s3.sh hfxrentals-web-app <your-cloudfront-distribution-id>
   ```

---

## Method 3: Local Testing & Development

Before deploying to AWS, test and verify everything on your machine:

```bash
# Install dependencies
npm install

# Start development server with instant Hot Module Replacement (HMR)
npm run dev

# Or test the production static bundle locally
npm run build
npm run preview
```
Visit `http://localhost:5173` in your browser.
