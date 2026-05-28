import prisma from '../prisma/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createEmoji = asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const { emoji } = req.body;

  const study = await prisma.study.findUniqueOrThrow({
    where: { id: Number(studyId) },
  });

  const reaction = await prisma.reaction.create({
    data: {
      emoji,
      studyId: Number(studyId),
    },
  });

  return res.status(201).json({
    id: reaction.id,
    emoji: reaction.emoji,
    studyId: reaction.studyId,
  });
});
