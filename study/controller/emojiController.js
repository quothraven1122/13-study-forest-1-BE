import prisma from '../../prisma/index.js';

export const createEmoji = async (req, res) => {
  const { studyId } = req.params;
  const { emoji } = req.body;

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
    });

    if (!study) {
      return res.status(404).json({ success: false, message: '존재하지 않는 스터디입니다.' });
    }

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
  } catch (e) {
    return res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
};
