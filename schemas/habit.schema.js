import z from 'zod';
/// 습관(등록, 수정) 유효성 검사
export const habitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '습관은 1글자 이상이어야 합니다')
    .max(20, '습관은 20글자 이하여야 합니다'),
});

