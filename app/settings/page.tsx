'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { llmKeys, setLLMKeys, generatorOptions, setGeneratorOptions, clearAllData } = useAppStore();
  const [localKeys, setLocalKeys] = useState(llmKeys);

  function saveKeys() {
    setLLMKeys(localKeys);
    toast.success('API Keys 已保存到本地');
  }

  function clear() {
    if (!confirm('确定清空所有本地数据（收藏、密钥）？')) return;
    clearAllData();
    setLocalKeys({});
    toast('已清除本地数据');
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-5xl font-semibold tracking-tight mb-9">设置</h1>

      <section className="space-y-8">
        <div>
          <h3 className="font-semibold mb-4">LLM API 密钥（仅保存在你的浏览器）</h3>

          <div className="space-y-4">
            {(['grok', 'claude', 'openai'] as const).map((prov) => (
              <div key={prov}>
                <Label className="text-xs uppercase text-[#7c5cff]">{prov.toUpperCase()} API Key</Label>
                <Input
                  type="password"
                  value={localKeys[prov] || ''}
                  onChange={(e) => setLocalKeys({ ...localKeys, [prov]: e.target.value })}
                  placeholder={`输入 ${prov} key`}
                  className="font-mono mt-1"
                />
              </div>
            ))}
          </div>

          <Button onClick={saveKeys} className="mt-4 cosmic-btn">保存密钥</Button>
          <p className="text-xs text-[#6c678f] mt-2">密钥不会上传，只用于浏览器直接调用代理接口。</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">默认生成参数</h3>
          <div className="text-sm">当前体裁：{generatorOptions.form} · 温度 {generatorOptions.temperature}</div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="font-semibold mb-3 text-red-400">危险操作</h3>
          <Button variant="destructive" onClick={clear}>清除所有本地数据</Button>
        </div>

        <div className="text-xs text-[#6c678f] pt-8 leading-relaxed">
          数据来源：mock 数据（李白、杜甫、苏轼等）。真实数据可通过 scripts/generate-data.ts 从 chinese-poetry 仓库生成。<br />
          主题固定为暗黑宇宙风。
        </div>
      </section>
    </div>
  );
}
