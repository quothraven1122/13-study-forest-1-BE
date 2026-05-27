import prisma from '../prisma/index.js';
///  DB에서 id 조회해서 없으면 error 던지는 함수
export const validateStudyExists = async (studyId) => {
  const study = await prisma.study.findUnique({
    where: {
      id: studyId,
    },
    select: {
      id: true,
    },
  });
  if (!study) {
    throw new Error('스터디가 존재하지 않습니다');
  }
  return study;
};
