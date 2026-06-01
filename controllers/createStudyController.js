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

export const updateStudy = async (req, res) => {
  const { studyId } = req.params;
  const { name, description, nickname, background } = req.body;

  const study = await prisma.study.update({
    where: { id: Number(studyId) },
    data: { name, description, nickname, background },
  });

  res.status(200).json({ success: true, id: Number(studyId) });
};
