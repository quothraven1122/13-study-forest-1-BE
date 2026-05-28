// 오늘의 집중 페이지의 point PATCH API
import prisma from '../prisma/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET - nickname이랑 point 가져오기
export const getStudyFocus = asyncHandler(async (req, res) => {
  const { studyId } = req.params;

  const study = await prisma.study.findUniqueOrThrow({
    where: { id: Number(studyId) },
    select: {
      nickname: true,
      point: true,
    },
  });

  return res.status(200).json(study);
});

// PATCH - 포인트 수정
export const patchStudyPoint = asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const { points } = req.body;

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
});
