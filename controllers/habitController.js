import prisma from '../prisma/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createHabit = asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const { name } = req.body;

  const study = await prisma.study.findUniqueOrThrow({
    where: { id: Number(studyId) },
  });

  const habit = await prisma.habit.create({
    data: {
      name,
      studyId: Number(studyId),
    },
  });

  return res.status(201).json({
    id: habit.id,
    name: habit.name,
    studyId: habit.studyId,
  });
});
