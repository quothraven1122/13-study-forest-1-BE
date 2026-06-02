import prisma from '../prisma/index.js';

export const createHabit = async (req, res) => {
  try {
    const { studyId } = req.params;
    const { name } = req.body;

    const studyIdNum = Number(studyId);
    const trimmedName = name?.trim();

    if (Number.isNaN(studyIdNum)) {
      return res.status(400).json({
        message: '잘못된 요청입니다.',
      });
    }

    if (!trimmedName) {
      return res.status(400).json({
        message: '습관 이름이 필요합니다.',
      });
    }

    const study = await prisma.study.findUnique({
      where: {
        id: studyIdNum,
      },
    });

    if (!study) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 스터디입니다.',
      });
    }

    const habit = await prisma.habit.create({
      data: {
        name: trimmedName,
        studyId: studyIdNum,
      },
    });

    return res.status(201).json({
      id: habit.id,
      name: habit.name,
      isDone: habit.isDone,
      studyId: habit.studyId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};

export const getHabits = async (req, res) => {
  try {
    const { studyId } = req.params;

    const studyIdNum = Number(studyId);

    if (Number.isNaN(studyIdNum)) {
      return res.status(400).json({
        message: '잘못된 요청입니다.',
      });
    }

    const study = await prisma.study.findUnique({
      where: {
        id: studyIdNum,
      },
    });

    if (!study) {
      return res.status(404).json({
        message: '존재하지 않는 스터디입니다.',
      });
      
    }
    

    const habits = await prisma.habit.findMany({
      where: {
        studyId: studyIdNum,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return res.status(200).json(habits);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { studyId, habitId } = req.params;
    const { name, isDone } = req.body;

    const studyIdNum = Number(studyId);
    const habitIdNum = Number(habitId);
    const trimmedName = name?.trim();

    if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
      return res.status(400).json({
        message: '잘못된 요청입니다.',
      });
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
        isDone,
      },
    });

    return res.status(200).json(updatedHabit);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const { studyId, habitId } = req.params;

    const studyIdNum = Number(studyId);
    const habitIdNum = Number(habitId);

    if (Number.isNaN(studyIdNum) || Number.isNaN(habitIdNum)) {
      return res.status(400).json({
        message: '잘못된 요청입니다.',
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

    await prisma.habit.delete({
      where: {
        id: habitIdNum,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: '서버 내부 오류가 발생했습니다.',
    });
  }
};
