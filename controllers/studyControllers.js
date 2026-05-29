import prisma from '../prisma/index.js';
import { getStartAndEndOfWeek } from '../utils/date.js';

// ─── 전체 스터디 조회 ───
export const getAllStudy = async (req, res) => {
  try {
    const { search, sort = 'recent', page = 1 } = req.query;

    const take = 6;
    const skip = (Number(page) - 1) * take;

    const keyword = search?.trim();
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { nickname: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const orderBy = {
      highPoint: { point: 'desc' },
      lowPoint: { point: 'asc' },
      recent: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
    }[sort] || { createdAt: 'desc' };

    const studies = await prisma.study.findMany({ where, orderBy, skip, take });

    const studyIds = studies.map((study) => study.id);
    const reactions = await prisma.reaction.findMany({
      where: { studyId: { in: studyIds } },
    });

    const reactionMap = reactions.reduce((acc, cur) => {
      if (!acc[cur.studyId]) acc[cur.studyId] = {};
      acc[cur.studyId][cur.emoji] = (acc[cur.studyId][cur.emoji] || 0) + 1;
      return acc;
    }, {});

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

    const totalCount = await prisma.study.count({ where });

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
export const getStudyDetail = async (req, res) => {
  const { studyId } = req.params;
  const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();

  const study = await prisma.study.findUnique({
    where: { id: Number(studyId) },
  });

  let reactions = await prisma.reaction.groupBy({
    where: { studyId: Number(studyId) },
    _count: { emoji: true },
    by: ['emoji'],
    orderBy: { _count: { emoji: 'desc' } },
  });
  reactions = reactions.reduce((acc, cur) => {
    acc[cur.emoji] = cur._count.emoji;
    return acc;
  }, {});

  let habitLogs = await prisma.habit.findMany({
    where: { studyId: Number(studyId) },
    include: {
      habitLogs: {
        where: { date: { gte: startOfWeek, lte: endOfWeek } },
      },
    },
  });
  habitLogs = habitLogs.reduce((acc, cur) => {
    acc[cur.name] = cur.habitLogs.map((log) => log.date);
    return acc;
  }, {});

  return res.status(200).json({ ...study, reactions, habits: habitLogs });
};

// ─── 비밀번호 확인 ───
export const postPwCheck = async (req, res) => {
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
export const createStudy = async (req, res) => {
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

// ─── 스터디 삭제 ───
export const deleteStudy = async (req, res) => {
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
export const createEmoji = async (req, res) => {
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

// ─── 습관 추가 ───
export const createHabit = async (req, res) => {
  try {
    const { studyId } = req.params;
    const { name } = req.body;

    const studyIdNum = Number(studyId);
    const trimmedName = name?.trim();

    if (Number.isNaN(studyIdNum)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    if (!trimmedName) {
      return res.status(400).json({ message: '습관 이름이 필요합니다.' });
    }

    const study = await prisma.study.findUnique({
      where: { id: studyIdNum },
    });

    if (!study) {
      return res
        .status(404)
        .json({ success: false, message: '존재하지 않는 스터디입니다.' });
    }

    const habit = await prisma.habit.create({
      data: { name: trimmedName, studyId: studyIdNum },
    });

    return res.status(201).json({
      id: habit.id,
      name: habit.name,
      studyId: habit.studyId,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
};

// ─── 습관 수정 ───
export const updateHabit = async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;
    const { name } = req.body;

    const studyIdNum = Number(studyId);
    const habitIdNum = Number(habitId);
    const trimmedName = name?.trim();

    if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    if (!trimmedName) {
      return res
        .status(400)
        .json({ message: '수정할 습관 이름이 필요합니다.' });
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitIdNum },
    });

    if (!habit || habit.studyId !== studyIdNum) {
      return res
        .status(404)
        .json({ message: '해당 스터디의 습관을 찾을 수 없습니다.' });
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitIdNum },
      data: { name: trimmedName },
    });

    return res.status(200).json(updatedHabit);
  } catch (error) {
    next(error);
  }
};

// ─── 습관 삭제 ───
export const deleteHabit = async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;

    const studyIdNum = Number(studyId);
    const habitIdNum = Number(habitId);

    if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitIdNum },
    });

    if (!habit || habit.studyId !== studyIdNum) {
      return res
        .status(404)
        .json({ message: '해당 스터디의 습관을 찾을 수 없습니다.' });
    }

    await prisma.habit.delete({
      where: { id: habitIdNum },
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ─── 습관 목록 조회 ───
export const getHabits = async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const studyIdNum = Number(studyId);

    if (Number.isNaN(studyIdNum)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    const study = await prisma.study.findUnique({
      where: { id: studyIdNum },
    });

    if (!study) {
      return res.status(404).json({ message: '존재하지 않는 스터디입니다.' });
    }

    const habits = await prisma.habit.findMany({
      where: { studyId: studyIdNum },
      orderBy: { id: 'asc' },
    });

    return res.status(200).json(habits);
  } catch (error) {
    next(error);
  }
};
