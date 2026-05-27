import z from 'zod';

/// 스터디 생성 유효성 검사
export const createStudySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '스터디 이름은 1글자 이상이어야 합니다')
    .max(20, '스터디 이름은 20글자 이하여야 합니다'),
  description: z
    .string()
    .trim()
    .min(1, '소개는 1글자 이상이어야 합니다')
    .max(100, '소개 100글자 이하여야 합니다'),
  password: z.string().min(6, '비밀번호는 6글자 이상이어야 합니다'),
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임은 1글자 이상이어야 합니다')
    .max(20, '닉네임은 20글자 이하여야 합니다'),
});

/// 스터디 수정 유효성 검사
export const updateStudySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '스터디 이름은 1글자 이상이어야 합니다')
    .max(20, '스터디 이름은 20글자 이하여야 합니다')
    .optional(),
  description: z
    .string()
    .trim()
    .min(1, '소개는 1글자 이상이어야 합니다')
    .max(100, '소개 100글자 이하여야 합니다')
    .optional(),
  nickname: z
    .string()
    .trim()
    .min(1, '닉네임은 1글자 이상이어야 합니다')
    .max(20, '닉네임은 20글자 이하여야 합니다')
    .optional(),
});

/// Query 유효성 검사
export const getAllStudyQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  sort: z.enum(['recent', 'oldest', 'lowPoint', 'highPoint']).optional(),
});

/// studyId 유효성 검사
export const studyIdParamSchema = z.object({
  studyId: z.coerce.number().int().positive(),
});
