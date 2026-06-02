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

  const habits = await prisma.habit.findMany({
    where: {
      studyId: studyIdNum,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return res.status(200).json(habits);
});

export const updateHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = req.params;
  const { name, isDone } = req.body;

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
  });

  if (habit.studyId !== studyIdNum) {
    return res.status(404).json({
      message: '해당 스터디의 습관을 찾을 수 없습니다.',
    });
  }

  const updatedHabit = await prisma.habit.update({
    where: {
      id: habitIdNum,
    },
    data: {
      name: trimmedName || habit.name,
      isDone: typeof isDone === 'boolean' ? isDone : habit.isDone,
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
