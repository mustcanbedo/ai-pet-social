export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'DEEPSEEK_API_KEY not configured' },
      { status: 503 },
    );
  }

  try {
    const { messages, systemPrompt, temperature = 0.8, maxTokens = 300 } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const fullMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: fullMessages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return Response.json(
        { error: `DeepSeek API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json({ error: 'Empty response from DeepSeek' }, { status: 502 });
    }

    return Response.json({ content });
  } catch (err) {
    console.error('/api/chat error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
