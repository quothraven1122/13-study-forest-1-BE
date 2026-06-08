import z from 'zod';
/// reaction 추가 유효성 검사(이모지 1개만 가능)
export const createReactionSchema = z.object({
  emoji: z
    .string()
    .emoji({ message: '올바른 이모지를 입력해주세요' })
    .refine((value) => [...value].length === 1, '이모지는 1개만 작성해주세요'),
});
