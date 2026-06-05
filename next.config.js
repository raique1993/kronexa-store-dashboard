/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://tcjynyfusqkqtdohnyzq.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_gNJhc4WCS9MnnmDAL2T6Vg_AQ71_Vid',
    NEXT_PUBLIC_TENANT_ID: 'b2c3d4e5-0001-0000-0000-000000000001',
  }
}
module.exports = nextConfig
