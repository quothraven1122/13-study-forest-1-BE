import prisma from '../prisma/index.js';
import { getStartAndEndOfWeek } from '../utils/date.js';

export const getStudyDetail = async (req, res) => {
  const { studyId } = req.params;
  const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();

  //스터디 상세 정보 불러오기
  const study = await prisma.study.findUnique({
    where: { id: Number(studyId) },
  });

  //스터디 관련 리액션 정보 불러오기
  let reactions = await prisma.reaction.groupBy({
    where: { studyId: Number(studyId) },
    _count: {
      emoji: true,
    },
    by: ['emoji'],
    orderBy: {
      _count: {
        emoji: 'desc',
      },
    },
  });
  reactions = reactions.reduce((acc, cur) => {
    acc[cur.emoji] = cur._count.emoji;
    return acc;
  }, {});

  //스터디 관련 습관 로그 정보 불러오기
  let habitLogs = await prisma.habit.findMany({
    where: {
      studyId: Number(studyId),
    },
    include: {
      habitLogs: {
        where: {
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      },
    },
  });
  habitLogs = habitLogs.reduce((acc, cur) => {
    acc[cur.name] = cur.habitLogs.map((log) => log.date);
    return acc;
  }, {});

  return res.status(200).json({ ...study, reactions, habits: habitLogs });
};

export const postPwCheck = async (req, res) => {
  const { studyId } = req.params;
  const { password: pwInput } = req.body;

  const pw = await prisma.study.findUnique({
    where: {
      id: Number(studyId),
    },
    select: {
      password: true,
    },
  });

  if (pwInput !== pw.password) {
    return res.status(401).json({
      success: false,
    });
  }

  return res.status(200).json({
    success: true,
  });
};
