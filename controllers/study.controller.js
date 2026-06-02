import prisma from '../prisma/index.js';
import { getStartAndEndOfWeek } from '../utils/date.js';

// ─── 전체 스터디 조회 ───
const getAllStudy = async (req, res) => {
  try {
    const { search, sort = 'recent', page = 1 } = req.query;

    // pagination
    const take = 6;
    const skip = (Number(page) - 1) * take;

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
        currentPage: Number(page),
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        hasNextPage: skip + take < totalCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '서버 에러' });
  }
};

// ─── 스터디 상세 조회 ───
const getStudyDetail = async (req, res) => {
  const { studyId } = req.params;
  const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();

  //스터디 상세 정보 불러오기
  const study = await prisma.study.findUnique({
    where: { id: Number(studyId) },
  });

  //스터디 관련 리액션 정보 불러오기
  const reactionData = await prisma.reaction.groupBy({
    where: { studyId: Number(studyId) },
    _count: { emoji: true },
    by: ['emoji'],
    orderBy: { _count: { emoji: 'desc' } },
  });
  const reactions = reactionData.reduce((acc, cur) => {
    acc[cur.emoji] = cur._count.emoji;
    return acc;
  }, {});

  //스터디 관련 습관 로그 정보 불러오기
  const habitLogData = await prisma.habit.findMany({
    where: { studyId: Number(studyId) },
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
};

// ─── 비밀번호 확인 ───
const postPwCheck = async (req, res) => {
  const { studyId } = req.params;
  const { password: pwInput } = req.body;

  const pw = await prisma.study.findUnique({
    where: { id: Number(studyId) },
    select: { password: true },
  });

  if (pwInput !== pw.password) {
    return res.status(401).json({ success: false });
  }

  return res.status(200).json({ success: true });
};

// ─── 스터디 생성 ───
const createStudy = async (req, res) => {
  try {
    const { name, description, password, nickname, background } = req.body;

    if (!name || !description || !password || !nickname || !background) {
      return res
        .status(400)
        .json({ message: '필수 가입 요구사항 입력 데이터 누락' });
    }

    const newStudy = await prisma.study.create({
      data: { name, description, password, nickname, background },
    });

    res.status(201).json({ ...newStudy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── 스터디 수정 ───
const updateStudy = async (req, res) => {
  const { studyId } = req.params;
  const { name, description, nickname, background } = req.body;

  const study = await prisma.study.update({
    where: { id: Number(studyId) },
    data: { name, description, nickname, background },
  });

  res.status(200).json({ success: true, id: Number(studyId) });
};

// ─── 스터디 삭제 ───
const deleteStudy = async (req, res) => {
  const { studyId } = req.params;
  const { password } = req.body;

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
    });

    if (!study) {
      return res
        .status(404)
        .json({ success: false, message: '존재하지 않는 스터디입니다.' });
    }

    if (study.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    await prisma.study.delete({
      where: { id: Number(studyId) },
    });

    return res
      .status(200)
      .json({ success: true, message: '스터디가 삭제되었습니다.' });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
};

// ─── 반응하기 ───
const createEmoji = async (req, res) => {
  const { studyId } = req.params;
  const { emoji } = req.body;

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
    });

    if (!study) {
      return res
        .status(404)
        .json({ success: false, message: '존재하지 않는 스터디입니다.' });
    }

    const reaction = await prisma.reaction.create({
      data: { emoji, studyId: Number(studyId) },
    });

    return res.status(201).json({
      id: reaction.id,
      emoji: reaction.emoji,
      studyId: reaction.studyId,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
};

// ─── 오늘의 집중 조회 ───
const getStudyFocus = async (req, res) => {
  const { studyId } = req.params;

  if (isNaN(Number(studyId))) {
    return res.status(400).json({ message: '유효하지 않은 studyId입니다.' });
  }

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
      select: {
        name: true,
        nickname: true,
        point: true,
      },
    });

    if (!study) {
      return res.status(404).json({ message: '스터디를 찾을 수 없습니다.' });
    }

    return res.status(200).json(study);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// ─── 포인트 수정 ───
const patchStudyPoint = async (req, res) => {
  const { studyId } = req.params;
  const { points } = req.body;

  if (isNaN(Number(studyId))) {
    return res.status(400).json({ message: '유효하지 않은 studyId입니다.' });
  }

  if (points === undefined || points === null) {
    return res.status(400).json({ message: 'points 값이 필요합니다.' });
  }

  if (typeof points !== 'number' || !Number.isInteger(points)) {
    return res.status(400).json({ message: 'points는 정수여야 합니다.' });
  }

  try {
    const study = await prisma.study.update({
      where: { id: Number(studyId) },
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
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: '스터디를 찾을 수 없습니다.' });
    }
    console.error(e);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

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
