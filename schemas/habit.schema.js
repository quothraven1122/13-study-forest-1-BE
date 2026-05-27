import z from 'zod';

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, '습관은 1글자 이상이어야 합니다')
    .max(20, '습관은 20글자 이하여야 합니다'),
});
