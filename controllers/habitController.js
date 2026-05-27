import prisma from '../prisma/index.js';

export const createHabit = async (req, res) => {
  const { studyId } = req.params;
  const { name } = req.body;

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
    });

    if (!study) {
      return res
        .status(404)
        .json({ success: false, message: '존재하지 않는 스터디입니다.' });
    }

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
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
};
