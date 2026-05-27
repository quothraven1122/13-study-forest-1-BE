// 오늘의 집중 페이지의 point PATCH API
import prisma from '../prisma/index.js';

// GET - name이랑 point 가져오기
export const getStudyFocus = async (req, res) => {
  const { studyId } = req.params;

  if (isNaN(Number(studyId))) {
    return res.status(400).json({ message: '유효하지 않은 studyId입니다.' });
  }

  try {
    const study = await prisma.study.findUnique({
      where: { id: Number(studyId) },
      select: {
        name: true,
        point: true,
      },
    });

    if (!study) {
      return res.status(404).json({ message: '스터디를 찾을 수 없습니다.' });
    }

    return res.status(200).json(study);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// PATCH - 포인트 수정
export const patchStudyPoint = async (req, res) => {
  const { studyId } = req.params;
  const { points } = req.body;

  if (isNaN(Number(studyId))) {
    return res.status(400).json({ message: '유효하지 않은 studyId입니다.' });
  }

  if (points === undefined || points === null) {
    return res.status(400).json({ message: 'points 값이 필요합니다.' });
  }

  if (typeof points !== 'number' || !Number.isInteger(points)) {
    return res.status(400).json({ message: 'points는 정수여야 합니다.' });
  }

  try {
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
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ message: '스터디를 찾을 수 없습니다.' });
    }
    console.error(e);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
