import z, { emoji } from 'zod';

const createReactionSchema = z.object({
  emoji: z
    .string()
    .min(1, '이모지는 1개만 작성해주세요')
    .max(1, '이모지는 1개만 작성해주세요'),
});
