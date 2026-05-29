import prisma from '../prisma/index.js';

export const deleteStudy = async (req, res) => {
  const { studyId } = req.params;
  const { password } = req.body;

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
    });

    if (!study) {
      return res
        .status(404)
        .json({ success: false, message: '존재하지 않는 스터디입니다.' });
    }

    if (study.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    await prisma.study.delete({
      where: { id: Number(studyId) },
    });

    return res
      .status(200)
      .json({ success: true, message: '스터디가 삭제되었습니다.' });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
};
