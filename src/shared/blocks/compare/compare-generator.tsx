'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Download, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import {
  CompareTask,
  CompareGenerateResponse,
  CompareQueryResponse,
  COMPARE_MODELS,
} from '@/shared/types/compare';

import { ComparisonGrid } from './comparison-grid';
import { DemoGrid } from './demo-grid';

const POLL_INTERVAL = 5000; // 5 seconds
const POLL_TIMEOUT = 180000; // 3 minutes

// Example prompts to inspire users
const EXAMPLE_PROMPTS = [
  'Professional headshot, studio lighting, confident businesswoman',
  'Minimalist product photo, perfume bottle, white background',
  'Modern tech startup logo, geometric shapes, blue gradient',
  'Cozy coffee shop interior, warm lighting, rainy day outside',
  'Cute cartoon cat in a space helmet, kawaii style',
  'Cyberpunk cityscape at night, neon lights, flying cars',
];

export function CompareGenerator() {
  const { user, setIsShowSignModal } = useAppContext();

  // Input state
  const [prompt, setPrompt] = useState('');

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<CompareTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Selection state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // History for continuation
  const [history, setHistory] = useState<
    { prompt: string; selectedTaskId: string; imageUrl?: string; modelLabel?: string; modelStyle?: string }[]
  >([]);

  // Iteration mode - when user selects a direction and continues
  const [iterationModel, setIterationModel] = useState<{
    model: string;
    label: string;
    style: string;
  } | null>(null);

  // Calculate cost - single model cost when iterating, total when comparing
  const iterationCost = iterationModel
    ? COMPARE_MODELS.find((m) => m.model === iterationModel.model)?.cost || 3
    : null;
  const totalCost = iterationModel
    ? iterationCost!
    : COMPARE_MODELS.reduce((sum, m) => sum + m.cost, 0);

  // Check if all tasks are complete
  const allComplete =
    tasks.length > 0 &&
    tasks.every((t) => t.status === 'success' || t.status === 'failed');

  // Check if user can continue (must select a successful result)
  const canContinue =
    selectedTaskId !== null &&
    tasks.find((t) => t.id === selectedTaskId)?.status === 'success';

  // Poll for task status
  const pollTasks = useCallback(async () => {
    if (!sessionId) return;

    try {
      const resp = await fetch('/api/ai/compare-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data: CompareQueryResponse = await resp.json();

      if (data.code === 0 && data.data) {
        setTasks(data.data.tasks);

        if (data.data.allComplete) {
          setIsGenerating(false);
        }
      }
    } catch (e) {
      console.error('Poll failed:', e);
    }
  }, [sessionId]);

  // Start polling when generating
  useEffect(() => {
    if (!isGenerating || !sessionId) return;

    // Initial poll
    pollTasks();

    // Set up interval
    const interval = setInterval(pollTasks, POLL_INTERVAL);

    // Set up timeout
    const timeout = setTimeout(() => {
      setIsGenerating(false);
      toast.error('Generation timed out. Please try again.');
    }, POLL_TIMEOUT);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isGenerating, sessionId, pollTasks]);

  // Handle generate
  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setSelectedTaskId(null);
    setTasks([]);

    try {
      // If in iteration mode, use the iterate API with single model
      const endpoint = iterationModel ? '/api/ai/iterate' : '/api/ai/compare';
      const body = iterationModel
        ? { prompt: prompt.trim(), model: iterationModel.model }
        : { prompt: prompt.trim() };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data: CompareGenerateResponse = await resp.json();

      if (data.code !== 0) {
        throw new Error(data.message || 'Generation failed');
      }

      setSessionId(data.data.sessionId);
      setTasks(data.data.tasks);
    } catch (e: any) {
      setIsGenerating(false);
      toast.error(e.message || 'Failed to start generation');
    }
  };

  // Handle continue with selection
  const handleContinue = () => {
    if (!canContinue) return;

    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    if (!selectedTask) return;

    // Save to history
    setHistory((prev) => [
      ...prev,
      {
        prompt,
        selectedTaskId,
        imageUrl: selectedTask.imageUrl,
        modelLabel: selectedTask.modelLabel,
        modelStyle: selectedTask.modelStyle,
      },
    ]);

    // Enter iteration mode with the selected model
    setIterationModel({
      model: selectedTask.model,
      label: selectedTask.modelLabel,
      style: selectedTask.modelStyle,
    });

    // Reset for next iteration
    setPrompt('');
    setSessionId(null);
    setTasks([]);
    setSelectedTaskId(null);

    toast.success(`Now iterating with ${selectedTask.modelLabel}`);
  };

  // Handle exit iteration mode (start new comparison)
  const handleNewComparison = () => {
    setIterationModel(null);
    setPrompt('');
    setSessionId(null);
    setTasks([]);
    setSelectedTaskId(null);
    setHistory([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Iteration mode indicator */}
      {iterationModel && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Iterating with</span>
            <Badge variant="secondary">{iterationModel.label}</Badge>
            <Badge variant="outline">{iterationModel.style}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewComparison}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3" />
            New Comparison
          </Button>
        </div>
      )}

      {/* Prompt input */}
      <div className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={iterationModel
            ? `Refine your image with ${iterationModel.label}...`
            : "Describe the image you want to create..."
          }
          className="min-h-[100px] text-base resize-none"
          disabled={isGenerating}
          maxLength={2000}
        />

        {/* Example prompts - only show when not in iteration mode and no prompt entered */}
        {!iterationModel && !prompt && tasks.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                  disabled={isGenerating}
                >
                  {example.length > 40 ? example.slice(0, 40) + '...' : example}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {prompt.length}/2000 characters
          </span>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Cost: {totalCost} credit{totalCost > 1 ? 's' : ''}
            </span>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating
                ? 'Generating...'
                : iterationModel
                  ? 'Generate'
                  : 'Compare & Generate'
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Demo grid - shown when no tasks yet */}
      {tasks.length === 0 && !isGenerating && !iterationModel && (
        <DemoGrid />
      )}

      {/* Comparison grid */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <ComparisonGrid
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelect={setSelectedTaskId}
            isLoading={isGenerating}
          />

          {/* Selection prompt - only in compare mode (multiple tasks) */}
          {!iterationModel && allComplete && !selectedTaskId && (
            <p className="text-center text-amber-600 dark:text-amber-400 text-sm">
              Please select a direction to continue
            </p>
          )}

          {/* Continue button - only in compare mode */}
          {!iterationModel && canContinue && (
            <div className="flex justify-center">
              <Button onClick={handleContinue} className="gap-2">
                Continue with this direction
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Iteration mode: save result and show message when complete */}
          {iterationModel && allComplete && tasks[0]?.status === 'success' && (
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Enter a new prompt above to keep iterating, or start a new comparison
              </p>
              {/* Save to history button */}
              {tasks[0]?.imageUrl && !history.some(h => h.imageUrl === tasks[0].imageUrl) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setHistory((prev) => [
                      ...prev,
                      {
                        prompt,
                        selectedTaskId: tasks[0].id,
                        imageUrl: tasks[0].imageUrl,
                        modelLabel: tasks[0].modelLabel,
                        modelStyle: tasks[0].modelStyle,
                      },
                    ]);
                    toast.success('Saved to history');
                  }}
                >
                  Save to History
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* History (previous selections) */}
      {history.length > 0 && (
        <div className="border-t pt-6 mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Session History ({history.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-28 space-y-1 group"
              >
                {item.imageUrl && (
                  <div className="relative">
                    <img
                      src={item.imageUrl}
                      alt={`Selection ${index + 1}`}
                      className="w-28 h-28 object-cover rounded-md"
                    />
                    {/* Download button on hover */}
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 bg-background/80"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = item.imageUrl!;
                          link.download = `history-${index + 1}-${Date.now()}.png`;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {item.modelLabel && (
                  <Badge variant="secondary" className="text-[10px] truncate max-w-full">
                    {item.modelLabel}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground truncate" title={item.prompt}>
                  {item.prompt.length > 25 ? item.prompt.slice(0, 25) + '...' : item.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
