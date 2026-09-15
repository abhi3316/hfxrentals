#!/bin/bash
# ==============================================================================
# HfxRentals - AWS S3 & CloudFront Deployment Script
# ==============================================================================
# Usage:
#   chmod +x deploy-aws-s3.sh
#   ./deploy-aws-s3.sh <your-s3-bucket-name> [optional-cloudfront-distribution-id]
# ==============================================================================

set -e

BUCKET_NAME=$1
CLOUDFRONT_ID=$2

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: Please provide your S3 bucket name."
  echo "Usage: ./deploy-aws-s3.sh <bucket-name> [cloudfront-distribution-id]"
  exit 1
fi

echo "🚀 Step 1: Building production bundle (Vite)..."
npm run build

echo "📦 Step 2: Syncing static assets with cache headers to s3://$BUCKET_NAME..."
# Static assets with hashes can be cached forever
aws s3 sync dist/ "s3://$BUCKET_NAME" \
  --delete \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

# index.html should never be cached so users always get the latest release
aws s3 cp dist/index.html "s3://$BUCKET_NAME/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

echo "✅ S3 sync complete!"

if [ -n "$CLOUDFRONT_ID" ]; then
  echo "🔄 Step 3: Invalidating CloudFront cache for distribution $CLOUDFRONT_ID..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_ID" \
    --paths "/*"
  echo "✅ CloudFront invalidation created!"
fi

echo "🎉 Deployment successfully finished!"
