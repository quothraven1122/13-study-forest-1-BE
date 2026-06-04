import prisma from '../prisma/index.js';
import { createReactionSchema } from '../schemas/reaction.schema.js';
import {
  checkPasswordSchema,
  createStudySchema,
  getAllStudyQuerySchema,
  patchPointSchema,
  studyIdParamSchema,
  updateStudySchema,
} from '../schemas/study.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStartAndEndOfWeek } from '../utils/date.js';
import { InvalidPasswordError } from '../utils/error.js';

// ─── 전체 스터디 조회 ───
export const getAllStudy = asyncHandler(async (req, res) => {
  const {
    search,
    sort = 'recent',
    page = 1,
  } = getAllStudyQuerySchema.parse(req.query); // Query 스트링 유효성 검사

  // pagination
  const take = 6;
  const skip = (page - 1) * take;

  // 검색 조건
  const keyword = search?.trim();
  const where = keyword
    ? {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { nickname: { contains: keyword, mode: 'insensitive' } },
        ],
      }
    : {};

  // 정렬 조건
  const orderBy = {
    highPoint: { point: 'desc' },
    lowPoint: { point: 'asc' },
    recent: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
  }[sort] || { createdAt: 'desc' };

  // 데이터 조회
  const studies = await prisma.study.findMany({ where, orderBy, skip, take });

  // 리엑션 카운트
  const studyIds = studies.map((study) => study.id);
  const reactions = await prisma.reaction.findMany({
    where: { studyId: { in: studyIds } },
  });

  const reactionMap = reactions.reduce((acc, cur) => {
    if (!acc[cur.studyId]) acc[cur.studyId] = {};
    acc[cur.studyId][cur.emoji] = (acc[cur.studyId][cur.emoji] || 0) + 1;
    return acc;
  }, {});

  // 상위 3개 리엑션 선택
  const top3ReactionMap = Object.fromEntries(
    Object.entries(reactionMap).map(([studyId, emojis]) => [
      studyId,
      Object.fromEntries(
        Object.entries(emojis)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
      ),
    ])
  );

  // 전체스터디 카운트
  const totalCount = await prisma.study.count({ where });

  // 날짜 계산 + 결과 값
  const result = studies.map((study) => {
    const diff = new Date() - new Date(study.createdAt);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return {
      id: study.id,
      name: study.name,
      nickname: study.nickname,
      description: study.description,
      point: study.point,
      background: study.background,
      days,
      reaction: top3ReactionMap[String(study.id)] || {},
    };
  });

  // 응답
  return res.status(200).json({
    success: true,
    data: result,
    pagination: {
      currentPage: page,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      hasNextPage: skip + take < totalCount,
    },
  });
});

// ─── 스터디 상세 조회 ───
export const getStudyDetail = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params); // zod studyId 검사
  const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();

  //스터디 상세 정보 불러오기
  const study = await prisma.study.findUniqueOrThrow({
    where: { id: studyId },
  });

  //스터디 관련 리액션 정보 불러오기
  let reactions = await prisma.reaction.groupBy({
    where: { studyId: studyId },
    _count: { emoji: true },
    by: ['emoji'],
    orderBy: { _count: { emoji: 'desc' } },
  });
  const reactions = reactionData.reduce((acc, cur) => {
    acc[cur.emoji] = cur._count.emoji;
    return acc;
  }, {});

  //스터디 관련 습관 로그 정보 불러오기
  let habitLogs = await prisma.habit.findMany({
    where: { studyId: studyId },
    include: {
      habitLogs: {
        where: { date: { gte: startOfWeek, lte: endOfWeek } },
      },
    },
  });
  const habitLogs = habitLogData.reduce((acc, cur) => {
    acc[cur.id] = {
      name: cur.name,
      values: cur.habitLogs.map((log) => log.date),
    };
    return acc;
  }, {});

  return res.status(200).json({ ...study, reactions, habits: habitLogs });
});

// ─── 비밀번호 확인 ───
export const postPwCheck = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { password: pwInput } = checkPasswordSchema.parse(req.body);

  const pw = await prisma.study.findUniqueOrThrow({
    where: { id: studyId },
    select: { password: true },
  });

  if (pwInput !== pw.password) throw new InvalidPasswordError();

  return res.status(200).json({ success: true });
});

// ─── 스터디 생성 ───
export const createStudy = asyncHandler(async (req, res) => {
  const { name, description, password, nickname, background } =
    createStudySchema.parse(req.body);

  const newStudy = await prisma.study.create({
    data: { name, description, password, nickname, background },
  });

  res.status(201).json({ ...newStudy });
});

// ─── 스터디 수정 ───
export const updateStudy = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { name, description, nickname, background } = updateStudySchema.parse(
    req.body
  );

  await prisma.study.update({
    where: { id: studyId },
    data: { name, description, nickname, background },
  });

  res.status(200).json({ success: true, id: studyId });
});

// ─── 스터디 삭제 ───
export const deleteStudy = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { password } = checkPasswordSchema.parse(req.body);

  const study = await prisma.study.findUniqueOrThrow({
    where: { id: studyId },
  });

  if (study.password !== password) throw new InvalidPasswordError();

  await prisma.study.delete({
    where: { id: studyId },
  });

  return res
    .status(200)
    .json({ success: true, message: '스터디가 삭제되었습니다.' });
});

// ─── 반응하기 ───
export const createEmoji = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { emoji } = createReactionSchema.parse(req.body);

  const reaction = await prisma.reaction.create({
    data: { emoji, studyId: studyId },
  });

  return res.status(201).json({
    id: reaction.id,
    emoji: reaction.emoji,
    studyId: reaction.studyId,
  });
});

// ─── 오늘의 집중 조회 ───
export const getStudyFocus = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);

  const study = await prisma.study.findUniqueOrThrow({
    where: { id: studyId },
    select: {
      name: true,
      nickname: true,
      point: true,
    },
  });

  return res.status(200).json(study);
});

// ─── 포인트 수정 ───
export const patchStudyPoint = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { points } = patchPointSchema.parse(req.body);

  const study = await prisma.study.update({
    where: { id: studyId },
    data: {
      point: {
        increment: points,
      },
    },
    select: {
      point: true,
    },
  });

  return res.status(200).json(study);
});

export default {
  getAllStudy,
  getStudyDetail,
  postPwCheck,
  createStudy,
  updateStudy,
  deleteStudy,
  createEmoji,
  getStudyFocus,
  patchStudyPoint,
};
