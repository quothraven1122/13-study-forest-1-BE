import z from 'zod';

/// 스터디 생성 유효성 검사
export const createStudySchema = z.object({
  name: z
    .string({ required_error: '스터디 이름은 1글자 이상이어야 합니다' })
    .trim()
    .min(1, '스터디 이름은 1글자 이상이어야 합니다')
    .max(20, '스터디 이름은 20글자 이하여야 합니다'),
  description: z
    .string({ required_error: '소개는 1글자 이상이어야 합니다' })
    .trim()
    .min(1, '소개는 1글자 이상이어야 합니다')
    .max(100, '소개 100글자 이하여야 합니다'),
  password: z
    .string({ required_error: '비밀번호는 6글자 이상이어야 합니다' })
    .min(6, '비밀번호는 6글자 이상이어야 합니다'),
  nickname: z
    .string({ required_error: '닉네임은 1글자 이상이어야 합니다' })
    .trim()
    .min(1, '닉네임은 1글자 이상이어야 합니다')
    .max(20, '닉네임은 20글자 이하여야 합니다'),
  background: z
    .string({ required_error: '배경을 선택해주세요' })
    .min(1, '배경을 선택해주세요'),
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
    background: z 
    .string()
    .min(1, '배경을 선택해주세요')
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
  studyId: z.coerce.number().int(),
});

/// 비밀번호 확인 유효성 검사
export const checkPasswordSchema = z.object({
  password: z
    .string({ required_error: '비밀번호는 빈 칸일 수 없습니다' })
    .min(1, '비밀번호는 빈 칸일 수 없습니다'),
});

/// 포인트 수정 유효성 검사
export const patchPointSchema = z.object({
  points: z
    .number({ required_error: 'points 값이 필요합니다.' })
    .int('points는 정수여야 합니다.'),
});
