import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getRemainingCredits } from '@/shared/models/credit';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { COMPARE_MODELS, CompareTask } from '@/shared/types/compare';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('prompt is required');
    }

    // Get current user
    const user = await getUserInfo();
    if (!user) {
      throw new Error('no auth, please sign in');
    }

    // Calculate total cost
    const totalCost = COMPARE_MODELS.reduce((sum, m) => sum + m.cost, 0);

    // Check credits
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < totalCost) {
      throw new Error('insufficient credits');
    }

    // Get AI service
    const aiService = await getAIService();

    // Generate session ID to group all tasks
    const sessionId = getUuid();

    // Fire all model requests concurrently
    const results = await Promise.allSettled(
      COMPARE_MODELS.map(async (m) => {
        const provider = aiService.getProvider(m.provider);
        if (!provider) {
          throw new Error(`${m.provider} provider not configured`);
        }
        const result = await provider.generate({
          params: {
            mediaType: AIMediaType.IMAGE,
            model: m.model,
            prompt: prompt.trim(),
          },
        });
        return { ...m, result };
      })
    );

    // Create AI tasks for each model
    const tasks: CompareTask[] = [];

    for (let i = 0; i < results.length; i++) {
      const modelConfig = COMPARE_MODELS[i];
      const result = results[i];

      const taskId = getUuid();
      let providerTaskId = '';
      let status: CompareTask['status'] = 'pending';
      let error: string | undefined;

      if (result.status === 'fulfilled' && result.value.result?.taskId) {
        providerTaskId = result.value.result.taskId;
        status = result.value.result.taskStatus as CompareTask['status'];
      } else {
        status = 'failed';
        error = result.status === 'rejected' ? result.reason?.message : 'Generation failed';
      }

      // Create AI task record
      const newAITask: NewAITask = {
        id: taskId,
        userId: user.id,
        mediaType: AIMediaType.IMAGE,
        provider: modelConfig.provider,
        model: modelConfig.model,
        prompt: prompt.trim(),
        scene: 'text-to-image',
        options: null,
        status,
        costCredits: modelConfig.cost,
        taskId: providerTaskId,
        taskInfo: null,
        taskResult: null,
        sessionId,
      };

      await createAITask(newAITask);

      tasks.push({
        id: taskId,
        model: modelConfig.model,
        modelLabel: modelConfig.label,
        modelStyle: modelConfig.style,
        provider: modelConfig.provider,
        status,
        error,
      });
    }

    return respData({
      sessionId,
      tasks,
      totalCost,
    });
  } catch (e: any) {
    console.log('compare generate failed', e);
    return respErr(e.message);
  }
}
