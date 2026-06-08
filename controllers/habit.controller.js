import prisma from '../prisma/index.js';
import { habitIdParamSchema, habitSchema } from '../schemas/habits.schema.js';
import { studyIdParamSchema } from '../schemas/study.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createHabit = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { name } = habitSchema.parse(req.body);

  await prisma.study.findUniqueOrThrow({
    where: {
      id: studyId,
    },
  });

  const habit = await prisma.habit.create({
    data: {
      name: name.trim(),
      studyId: studyId,
    },
    include: {
      habitLogs: true,
    },
  });

  return res.status(201).json(habit);
});

const getHabits = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);

  await prisma.study.findUniqueOrThrow({
    where: {
      id: studyId,
    },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const habits = await prisma.habit.findMany({
    where: {
      studyId: studyId,
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

const updateHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = habitIdParamSchema.parse(req.params);
  const { name } = habitSchema.partial().parse(req.body);

  const trimmedName = name?.trim();

  const habit = await prisma.habit.findUniqueOrThrow({
    where: {
      id: habitId,
    },
    include: {
      habitLogs: true,
    },
  });

  if (habit.studyId !== studyId) {
    return res.status(404).json({
      message: '해당 스터디의 습관을 찾을 수 없습니다.',
    });
  }

  // 이름 수정 요청이면 name만 수정
  if (trimmedName) {
    const updatedHabit = await prisma.habit.update({
      where: {
        id: habitId,
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
      habitId: habitId,
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
        habitId: habitId,
        date: new Date(),
      },
    });
  }

  const updatedHabit = await prisma.habit.findUnique({
    where: {
      id: habitId,
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

const deleteHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = habitIdParamSchema.parse(req.params);

  const habit = await prisma.habit.findUniqueOrThrow({
    where: {
      id: habitId,
    },
  });

  if (habit.studyId !== studyId) {
    return res.status(404).json({
      message: '해당 스터디의 습관을 찾을 수 없습니다.',
    });
  }

  await prisma.habit.delete({
    where: {
      id: habitId,
    },
  });

  return res.status(204).send();
});

export default { createHabit, getHabits, updateHabit, deleteHabit };
