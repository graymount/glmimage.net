import { respData, respErr } from '@/shared/lib/resp';
import {
  findAITasksBySessionId,
  updateAITaskById,
  UpdateAITask,
} from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { CompareTask, COMPARE_MODELS } from '@/shared/types/compare';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return respErr('invalid params');
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    // Find all tasks in this session
    const tasks = await findAITasksBySessionId(sessionId);
    if (!tasks || tasks.length === 0) {
      return respErr('session not found');
    }

    // Verify ownership
    if (tasks.some((t) => t.userId !== user.id)) {
      return respErr('no permission');
    }

    const aiService = await getAIService();
    const falProvider = aiService.getProvider('fal');
    if (!falProvider) {
      return respErr('fal provider not configured');
    }

    // Query status for each task
    const compareTasks: CompareTask[] = [];
    let allComplete = true;

    for (const task of tasks) {
      // Find model config
      const modelConfig = COMPARE_MODELS.find((m) => m.model === task.model);

      // If task is already complete, use cached result
      if (task.status === 'success' || task.status === 'failed') {
        let imageUrl: string | undefined;

        if (task.status === 'success' && task.taskInfo) {
          try {
            const taskInfo = JSON.parse(task.taskInfo);
            imageUrl = taskInfo.images?.[0]?.imageUrl;
          } catch {
            // ignore parse error
          }
        }

        compareTasks.push({
          id: task.id,
          model: task.model,
          modelLabel: modelConfig?.label || task.model,
          modelStyle: modelConfig?.style || '',
          provider: task.provider,
          status: task.status as CompareTask['status'],
          imageUrl,
          error: task.status === 'failed' ? 'Generation failed' : undefined,
        });
        continue;
      }

      // Query provider for pending/processing tasks
      if (!task.taskId) {
        compareTasks.push({
          id: task.id,
          model: task.model,
          modelLabel: modelConfig?.label || task.model,
          modelStyle: modelConfig?.style || '',
          provider: task.provider,
          status: 'failed',
          error: 'No task ID',
        });
        continue;
      }

      allComplete = false;

      try {
        const result = await falProvider.query?.({
          taskId: task.taskId,
          mediaType: task.mediaType,
          model: task.model,
        });

        if (result?.taskStatus) {
          // Update task in database
          const updateData: UpdateAITask = {
            status: result.taskStatus,
            taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
            taskResult: result.taskResult
              ? JSON.stringify(result.taskResult)
              : null,
            creditId: task.creditId,
          };

          if (updateData.status !== task.status) {
            await updateAITaskById(task.id, updateData);
          }

          let imageUrl: string | undefined;
          if (
            result.taskStatus === 'success' &&
            result.taskInfo?.images?.[0]?.imageUrl
          ) {
            imageUrl = result.taskInfo.images[0].imageUrl;
            allComplete = allComplete; // keep checking others
          }

          if (result.taskStatus === 'success' || result.taskStatus === 'failed') {
            // This one is complete, check if all are complete
          } else {
            allComplete = false;
          }

          compareTasks.push({
            id: task.id,
            model: task.model,
            modelLabel: modelConfig?.label || task.model,
            modelStyle: modelConfig?.style || '',
            provider: task.provider,
            status: result.taskStatus as CompareTask['status'],
            imageUrl,
            error:
              result.taskStatus === 'failed'
                ? result.taskInfo?.errorMessage || 'Generation failed'
                : undefined,
          });
        } else {
          allComplete = false;
          compareTasks.push({
            id: task.id,
            model: task.model,
            modelLabel: modelConfig?.label || task.model,
            modelStyle: modelConfig?.style || '',
            provider: task.provider,
            status: task.status as CompareTask['status'],
          });
        }
      } catch (e: any) {
        allComplete = false;
        compareTasks.push({
          id: task.id,
          model: task.model,
          modelLabel: modelConfig?.label || task.model,
          modelStyle: modelConfig?.style || '',
          provider: task.provider,
          status: 'pending',
          error: e.message,
        });
      }
    }

    // Re-check allComplete
    allComplete = compareTasks.every(
      (t) => t.status === 'success' || t.status === 'failed'
    );

    return respData({
      sessionId,
      allComplete,
      tasks: compareTasks,
    });
  } catch (e: any) {
    console.log('compare query failed', e);
    return respErr(e.message);
  }
}
