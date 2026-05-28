import prisma from '../prisma/index.js';

export const updateHabit = async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;
    const { name } = req.body;

    const studyIdNum = Number(studyId);
    const habitIdNum = Number(habitId);
    const trimmedName = name?.trim();

    if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    if (!trimmedName) {
      return res.status(400).json({
        message: '수정할 습관 이름이 필요합니다.',
      });
    }

    const habit = await prisma.habit.findUnique({
      where: {
        id: habitIdNum,
      },
    });

    if (!habit || habit.studyId !== studyIdNum) {
      return res.status(404).json({
        message: '해당 스터디의 습관을 찾을 수 없습니다.',
      });
    }

    const updatedHabit = await prisma.habit.update({
      where: {
        id: habitIdNum,
      },
      data: {
        name: trimmedName,
      },
    });

    return res.status(200).json(updatedHabit);
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;

    const studyIdNum = Number(studyId);
    const habitIdNum = Number(habitId);

    if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    const habit = await prisma.habit.findUnique({
      where: {
        id: habitIdNum,
      },
    });

    if (!habit || habit.studyId !== studyIdNum) {
      return res.status(404).json({
        message: '해당 스터디의 습관을 찾을 수 없습니다.',
      });
    }

    await prisma.habit.delete({
      where: {
        id: habitIdNum,
      },
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
