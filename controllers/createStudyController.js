import prisma from '../prisma/index.js';

export const createStudy = async (req, res) => {
  try {
    const { name, description, password, nickname, background } = req.body;

    const newStudy = await prisma.study.create({
      data: { name, description, password, nickname, background },
    });

    res.status(201).json({
      ...newStudy,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};
