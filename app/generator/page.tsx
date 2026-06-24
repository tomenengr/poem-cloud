'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PoemCard } from '@/components/PoemCard';
import { generateLocalPoem } from '@/lib/poetryGenerator';
import { useAppStore, getAvailableProvider, hasLLMKey } from '@/lib/store';
import { GeneratedPoem, GeneratorOptions } from '@/lib/types';
import { toast } from 'sonner';

function GeneratorContent() {
  const searchParams = useSearchParams();
  const inspire = searchParams.get('inspire');

  const store = useAppStore();
  const { llmKeys, generatorOptions, setGeneratorOptions, setLastMode } = store;

  const [prompt, setPrompt] = useState(
    inspire ? '月下怀古，像杜甫一样沉郁忧国' : '月夜思乡，像杜甫一样忧国忧民'
  );
  const [poems, setPoems] = useState<GeneratedPoem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasKey = hasLLMKey(llmKeys);
  const currentProvider = getAvailableProvider(llmKeys);

  const modeLabel = hasKey && currentProvider ? `LLM 模式 (${currentProvider})` : '本地规则引擎';

  async function handleGenerate(regenSeed?: number) {
    if (!prompt.trim()) {
      toast.error('请输入提示');
      return;
    }

    setIsGenerating(true);

    try {
      let result: GeneratedPoem;

      if (hasKey && currentProvider) {
        // Call LLM proxy
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: currentProvider,
            apiKey: llmKeys[currentProvider],
            prompt,
            form: generatorOptions.form,
            temperature: generatorOptions.temperature,
            strictPingze: generatorOptions.strictPingze,
          }),
        });

        if (!res.ok) throw new Error('LLM 调用失败');

        const data = await res.json();
        result = {
          ...data,
          id: `llm-${Date.now()}`,
          generatedAt: new Date().toISOString(),
          source: currentProvider,
        } as GeneratedPoem;

        setLastMode(currentProvider);
      } else {
        // Local
        result = generateLocalPoem(prompt, {
          form: generatorOptions.form,
          seed: regenSeed,
          strictPingze: generatorOptions.strictPingze,
        });
        setLastMode('local');
      }

      setPoems((prev) => [result, ...prev].slice(0, 8));
      toast.success(hasKey ? 'LLM 生成成功' : '本地生成完成');
    } catch (e: any) {
      // graceful fallback
      const fallback = generateLocalPoem(prompt, { form: generatorOptions.form, strictPingze: generatorOptions.strictPingze });
      setPoems((prev) => [fallback, ...prev].slice(0, 8));
      toast.error('LLM 失败，已回退本地引擎');
      setLastMode('local');
    } finally {
      setIsGenerating(false);
    }
  }

  function regenerate(poem: GeneratedPoem) {
    // Use same prompt + small variation
    setPrompt(poem.title || prompt);
    handleGenerate(Date.now());
  }

  function updateOption<K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) {
    setGeneratorOptions({ [key]: value });
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-8">
        <div className="uppercase tracking-[2px] text-xs text-[#7c5cff] mb-1">POETRY ENGINE</div>
        <h1 className="text-5xl font-semibold tracking-[-1.5px]">诗词生成器</h1>
        <p className="text-[#8a87a8] mt-2">自然语言提示，瞬间诞生古典诗篇。支持本地 + LLM 两种引擎。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cosmic-card rounded-2xl p-7">
            <Label className="text-xs uppercase tracking-widest text-[#7c5cff]">你的灵感</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：月夜思乡，像杜甫一样忧国忧民"
              className="mt-3 min-h-[118px] text-lg bg-black/30 border-white/10"
            />

            <Button
              size="lg"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="mt-5 w-full h-14 text-base cosmic-btn bg-white text-[#05050a] hover:bg-[#f4d35e] active:bg-white font-medium"
            >
              {isGenerating ? '生成中 · 星云共振中...' : '开始生成'}
            </Button>

            <div className="mt-3 text-[11px] text-center text-[#6c678f]">
              当前：{modeLabel}
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mt-5 text-xs text-[#8a87a8] hover:text-white underline-offset-4"
            >
              {showAdvanced ? '收起高级选项' : '高级选项'}
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-5 text-sm">
                <div>
                  <Label className="mb-2 block">体裁</Label>
                  <Select value={generatorOptions.form} onValueChange={(v) => updateOption('form', v as any)}>
                    <SelectTrigger className="bg-black/30 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="五绝">五绝</SelectItem>
                      <SelectItem value="七律">七律</SelectItem>
                      <SelectItem value="词牌">词牌</SelectItem>
                      <SelectItem value="自由">自由</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>温度（创造性）</Label>
                    <span className="text-[#7c5cff] tabular-nums">{generatorOptions.temperature.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[generatorOptions.temperature]}
                    min={0.2}
                    max={1.1}
                    step={0.05}
                    onValueChange={(vals) => updateOption('temperature', Array.isArray(vals) ? vals[0] : vals)}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Label className="text-sm">严格平仄（提示）</Label>
                  <Switch
                    checked={generatorOptions.strictPingze}
                    onCheckedChange={(v) => updateOption('strictPingze', v)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-[#6c678f] leading-relaxed px-1">
            本地模式使用规则 + 词库采样，效果已足够漂亮。<br />
            填入设置页 API Key 后可获得更高质量、严格格律的诗。
          </div>
        </div>

        {/* Right: Results - Floating cards */}
        <div className="lg:col-span-3 min-h-[520px] relative nebula-bg rounded-2xl p-8 overflow-auto border border-white/10">
          {poems.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-[#6c678f]">
              <div>
                在左侧输入一段灵感，点击生成。<br />
                生成的诗会以漂浮卡片形式出现。
              </div>
            </div>
          )}

          <div className="space-y-5">
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} onRegenerate={() => regenerate(poem)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#6c678f]">加载生成器...</div>}>
      <GeneratorContent />
    </Suspense>
  );
}

