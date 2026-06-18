// api/get-upload-url.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const ALLOWED_BUCKETS = new Set(['product-images', 'banner-images', 'category-images']);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bucket, path, contentType } = req.body ?? {};
  if (!bucket || !path || !contentType) return res.status(400).json({ error: 'Missing bucket, path, or contentType' });
  if (!ALLOWED_BUCKETS.has(bucket)) return res.status(400).json({ error: 'Invalid bucket' });

  // Verify the request comes from a logged-in admin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!verifyRes.ok) return res.status(401).json({ error: 'Invalid or expired session' });

  const cleanPath = String(path).replace(/^\//, '');
  const key = `${bucket}/${cleanPath}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
  const publicUrl = `https://cdn.wingandweft.com/${key}`;

  return res.status(200).json({ uploadUrl, publicUrl });
}