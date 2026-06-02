import prisma from '../prisma/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createHabit = asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const { name } = req.body;

  const studyIdNum = Number(studyId);
  const trimmedName = name?.trim();

  if (Number.isNaN(studyIdNum)) {
    return res.status(400).json({
      message: '잘못된 요청입니다.',
    });
  }

  if (!trimmedName) {
    return res.status(400).json({
      message: '습관 이름이 필요합니다.',
    });
  }

  await prisma.study.findUniqueOrThrow({
    where: {
      id: studyIdNum,
    },
  });

  const habit = await prisma.habit.create({
    data: {
      name: trimmedName,
      studyId: studyIdNum,
    },
    include: {
      habitLogs: true,
    },
  });

  return res.status(201).json(habit);
});

export const getHabits = asyncHandler(async (req, res) => {
  const { studyId } = req.params;

  const studyIdNum = Number(studyId);

  if (Number.isNaN(studyIdNum)) {
    return res.status(400).json({
      message: '잘못된 요청입니다.',
    });
  }

  await prisma.study.findUniqueOrThrow({
    where: {
      id: studyIdNum,
    },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const habits = await prisma.habit.findMany({
    where: {
      studyId: studyIdNum,
    },
    include: {
      habitLogs: {
        where: {
          date: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return res.status(200).json(habits);
});

export const updateHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = req.params;
  const { name } = req.body;

  const studyIdNum = Number(studyId);
  const habitIdNum = Number(habitId);
  const trimmedName = name?.trim();

  if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
    return res.status(400).json({
      message: '잘못된 요청입니다.',
    });
  }

  const habit = await prisma.habit.findUniqueOrThrow({
    where: {
      id: habitIdNum,
    },
    include: {
      habitLogs: true,
    },
  });

  if (habit.studyId !== studyIdNum) {
    return res.status(404).json({
      message: '해당 스터디의 습관을 찾을 수 없습니다.',
    });
  }

  // 이름 수정 요청이면 name만 수정
  if (trimmedName) {
    const updatedHabit = await prisma.habit.update({
      where: {
        id: habitIdNum,
      },
      data: {
        name: trimmedName,
      },
      include: {
        habitLogs: true,
      },
    });

    return res.status(200).json(updatedHabit);
  }

  // 오늘 날짜 시작/끝
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  // 오늘 완료 기록이 있는지 확인
  const todayLog = await prisma.habitLog.findFirst({
    where: {
      habitId: habitIdNum,
      date: {
        gte: todayStart,
        lt: tomorrowStart,
      },
    },
  });

  // 오늘 기록이 있으면 삭제 = 미완료
  if (todayLog) {
    await prisma.habitLog.delete({
      where: {
        id: todayLog.id,
      },
    });
  } else {
    // 오늘 기록이 없으면 생성 = 완료
    await prisma.habitLog.create({
      data: {
        habitId: habitIdNum,
        date: new Date(),
      },
    });
  }

  const updatedHabit = await prisma.habit.findUnique({
    where: {
      id: habitIdNum,
    },
    include: {
      habitLogs: {
        where: {
          date: {
            gte: todayStart,
            lt: tomorrowStart,
          },
        },
      },
    },
  });

  return res.status(200).json(updatedHabit);
});

export const deleteHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = req.params;

  const studyIdNum = Number(studyId);
  const habitIdNum = Number(habitId);

  if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
    return res.status(400).json({
      message: '잘못된 요청입니다.',
    });
  }

  const habit = await prisma.habit.findUniqueOrThrow({
    where: {
      id: habitIdNum,
    },
  });

  if (habit.studyId !== studyIdNum) {
    return res.status(404).json({
      message: '해당 스터디의 습관을 찾을 수 없습니다.',
    });
  }

  await prisma.habit.delete({
    where: {
      id: habitIdNum,
    },
  });

  return res.status(204).send();
});
