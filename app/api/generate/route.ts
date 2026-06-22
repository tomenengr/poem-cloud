import { NextRequest, NextResponse } from 'next/server';
import { LLMProvider } from '@/lib/types';

interface GenerateRequest {
  provider: LLMProvider;
  apiKey: string;
  prompt: string;
  form?: string;
  temperature?: number;
  strictPingze?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, prompt, form = '七律', temperature = 0.75, strictPingze = false }: GenerateRequest = await req.json();

    if (!apiKey || !prompt) {
      return NextResponse.json({ error: 'Missing key or prompt' }, { status: 400 });
    }

    let baseURL = '';
    let model = '';
    let headers: Record<string, string> = {};
    let body: any = {};

    const strictNote = strictPingze ? ' 必须严格遵守平仄格律，注意对仗与押韵。' : '';
    const systemPrompt = `你是一位精通中国古典诗词的大师。你必须用严格的古典风格写作五绝、七律或词。
只输出 JSON，格式如下：
{"title": "诗题", "content": ["第一句", "第二句", ...], "form": "${form}"}
禁止出现任何现代汉语、解释或多余内容。${strictNote}`;

    if (provider === 'grok') {
      baseURL = 'https://api.x.ai/v1';
      model = 'grok-3';
      headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
      body = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt}\n请严格用${form}体裁创作。` },
        ],
        temperature,
        max_tokens: 420,
      };
    } else if (provider === 'openai') {
      baseURL = 'https://api.openai.com/v1';
      model = 'gpt-4o';
      headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
      body = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt}\n体裁：${form}` },
        ],
        temperature,
        max_tokens: 420,
      };
    } else if (provider === 'claude') {
      // Anthropic
      baseURL = 'https://api.anthropic.com/v1';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      };
      body = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 420,
        temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `${prompt}\n请用${form}创作。` },
        ],
      };
    } else {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    const endpoint = provider === 'claude' ? '/messages' : '/chat/completions';
    const res = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('LLM error', text);
      return NextResponse.json({ error: 'LLM 调用失败', detail: text }, { status: 502 });
    }

    const data = await res.json();

    let poemJson: any;

    if (provider === 'claude') {
      const txt = data.content?.[0]?.text || '';
      poemJson = safeParseJSON(txt);
    } else {
      const txt = data.choices?.[0]?.message?.content || '';
      poemJson = safeParseJSON(txt);
    }

    if (!poemJson || !poemJson.title || !poemJson.content) {
      // Try to rescue raw text
      poemJson = {
        title: '即兴',
        content: (data.choices?.[0]?.message?.content || '').split('\n').filter(Boolean).slice(0, 8),
        form,
      };
    }

    return NextResponse.json({
      title: poemJson.title,
      content: Array.isArray(poemJson.content) ? poemJson.content : [poemJson.content],
      form: poemJson.form || form,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

function safeParseJSON(text: string) {
  try {
    // Try direct JSON
    return JSON.parse(text);
  } catch {
    // Try extract JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}
