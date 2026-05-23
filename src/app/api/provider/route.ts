export const dynamic = 'force-dynamic';

export async function GET() {
  const type = process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'mock';
  return Response.json({ type });
}
