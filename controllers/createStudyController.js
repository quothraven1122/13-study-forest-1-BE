import prisma from '../prisma/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createStudy = asyncHandler(async (req, res) => {
  const { name, description, password, nickname, background } = req.body;

  const newStudy = await prisma.study.create({
    data: { name, description, password, nickname, background },
    omit: { password: true },
  });

  res.status(201).json({
    ...newStudy,
  });
});
