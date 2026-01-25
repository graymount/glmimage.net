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
    const { prompt, model } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('prompt is required');
    }

    if (!model || typeof model !== 'string') {
      throw new Error('model is required');
    }

    // Find model config
    const modelConfig = COMPARE_MODELS.find((m) => m.model === model);
    if (!modelConfig) {
      throw new Error('invalid model');
    }

    // Get current user
    const user = await getUserInfo();
    if (!user) {
      throw new Error('no auth, please sign in');
    }

    // Check credits
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < modelConfig.cost) {
      throw new Error('insufficient credits');
    }

    // Get AI service
    const aiService = await getAIService();
    const provider = aiService.getProvider(modelConfig.provider);
    if (!provider) {
      throw new Error(`${modelConfig.provider} provider not configured`);
    }

    // Generate session ID
    const sessionId = getUuid();
    const taskId = getUuid();

    // Generate with single model
    let providerTaskId = '';
    let status: CompareTask['status'] = 'pending';
    let error: string | undefined;

    try {
      const result = await provider.generate({
        params: {
          mediaType: AIMediaType.IMAGE,
          model: modelConfig.model,
          prompt: prompt.trim(),
        },
      });

      if (result?.taskId) {
        providerTaskId = result.taskId;
        status = result.taskStatus as CompareTask['status'];
      } else {
        status = 'failed';
        error = 'Generation failed';
      }
    } catch (e: any) {
      status = 'failed';
      error = e.message || 'Generation failed';
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

    const task: CompareTask = {
      id: taskId,
      model: modelConfig.model,
      modelLabel: modelConfig.label,
      modelStyle: modelConfig.style,
      provider: modelConfig.provider,
      status,
      error,
    };

    return respData({
      sessionId,
      tasks: [task],
      totalCost: modelConfig.cost,
    });
  } catch (e: any) {
    console.log('iterate generate failed', e);
    return respErr(e.message);
  }
}
