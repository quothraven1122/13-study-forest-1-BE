import prisma from '../prisma/index.js';
import { habitIdParamSchema, habitSchema } from '../schemas/habits.schema.js';
import { studyIdParamSchema } from '../schemas/study.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
//--- 습관 생성 ---
export const createHabit = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);
  const { name } = habitSchema.parse(req.body);

  const habit = await prisma.habit.create({
    data: {
      name: name,
      studyId: studyId,
    },
  });

  return res.status(201).json({
    id: habit.id,
    name: habit.name,
    studyId: habit.studyId,
  });
});
// --- 습관 목록 조회 ---
export const getHabits = asyncHandler(async (req, res) => {
  const { studyId } = studyIdParamSchema.parse(req.params);

  await prisma.study.findUniqueOrThrow({
    where: {
      id: studyId,
    },
  });

  const habits = await prisma.habit.findMany({
    where: {
      studyId: studyId,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return res.status(200).json(habits);
});

export const updateHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = studyIdParamSchema
    .merge(habitIdParamSchema)
    .parse(req.params);
  const { name } = habitSchema.parse(req.body);

  const habit = await prisma.habit.findUniqueOrThrow({
    where: {
      id: habitId,
    },
  });

  //zod 유효성 검사 적용시 아래의 studyIdNum => studyId
  if (habit.studyId !== studyId) {
    return res.status(404).json({
      message: '해당 스터디의 습관을 찾을 수 없습니다.',
    });
  }

  const updatedHabit = await prisma.habit.update({
    where: {
      id: habitId,
    },
    data: {
      name: name,
    },
  });

  return res.status(200).json(updatedHabit);
});

export const deleteHabit = asyncHandler(async (req, res) => {
  const { studyId, habitId } = studyIdParamSchema
    .merge(habitIdParamSchema)
    .parse(req.params);

  const habit = await prisma.habit.findUniqueOrThrow({
    where: {
      id: habitId,
    },
  });

  //위의 주석처리와 마찬가지
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
