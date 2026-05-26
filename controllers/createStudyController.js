import prisma from '../prisma/index.js';

export const createStudy = async (req, res) => {
  try {
    const { name, description, password, nickname, background } = req.body;

    if (!name || !description || !password || !nickname || !background) {
      return res
        .status(400)
        .json({ message: '필수 가입 요구사항 입력 데이터 누락' });
    }

    const newStudy = await prisma.study.create({
      data: { name, description, password, nickname, background },
    });

    res.status(201).json({
      ...newStudy,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
