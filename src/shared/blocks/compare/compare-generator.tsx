'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app-context';
import {
  CompareTask,
  CompareGenerateResponse,
  CompareQueryResponse,
  COMPARE_MODELS,
} from '@/shared/types/compare';

import { ComparisonGrid } from './comparison-grid';

const POLL_INTERVAL = 5000; // 5 seconds
const POLL_TIMEOUT = 180000; // 3 minutes

export function CompareGenerator() {
  const { user, setSigninOpen } = useAppContext();

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
    { prompt: string; selectedTaskId: string; imageUrl?: string }[]
  >([]);

  // Calculate total cost
  const totalCost = COMPARE_MODELS.reduce((sum, m) => sum + m.cost, 0);

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
      setSigninOpen(true);
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
      const resp = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
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
      },
    ]);

    // Reset for next iteration
    setPrompt('');
    setSessionId(null);
    setTasks([]);
    setSelectedTaskId(null);

    toast.success(`Selected: ${selectedTask.modelLabel} (${selectedTask.modelStyle})`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Prompt input */}
      <div className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="min-h-[100px] text-base resize-none"
          disabled={isGenerating}
          maxLength={2000}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {prompt.length}/2000 characters
          </span>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Cost: {totalCost} credits
            </span>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Compare & Generate'}
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison grid */}
      {tasks.length > 0 && (
        <div className="space-y-4">
          <ComparisonGrid
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelect={setSelectedTaskId}
            isLoading={isGenerating}
          />

          {/* Selection prompt */}
          {allComplete && !selectedTaskId && (
            <p className="text-center text-amber-600 dark:text-amber-400 text-sm">
              Please select a direction to continue
            </p>
          )}

          {/* Continue button */}
          {canContinue && (
            <div className="flex justify-center">
              <Button onClick={handleContinue} className="gap-2">
                Continue with this direction
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* History (previous selections) */}
      {history.length > 0 && (
        <div className="border-t pt-6 mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Previous selections
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-24 space-y-1"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={`Selection ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {item.prompt.slice(0, 30)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
