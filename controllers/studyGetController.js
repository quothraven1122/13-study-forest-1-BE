import prisma from '../prisma/index.js';

export const getAllStudy = async (req, res) => {
  try {
    const { search, sort = 'recent', page = 1 } = req.query;

    // pagination
    const take = 6;
    const skip = (Number(page) - 1) * take;

    // 검색 조건
    const keyword = search?.trim();
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { nickname: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    // 정렬 조건
    const orderBy = {
      highPoint: { point: 'desc' },
      lowPoint: { point: 'asc' },
      recent: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
    }[sort] || { createdAt: 'desc' };

    // 데이터 조회
    const studies = await prisma.study.findMany({
      where,
      orderBy,
      skip,
      take,
    });
    // 리엑션 카운트
    const studyIds = studies.map((study) => study.id);
    const reactions = await prisma.reaction.findMany({
      where: {
        studyId: {
          in: studyIds,
        },
      },
    });

    const reactionMap = reactions.reduce((acc, cur) => {
      if (!acc[cur.studyId]) acc[cur.studyId] = {};
      acc[cur.studyId][cur.emoji] = (acc[cur.studyId][cur.emoji] || 0) + 1;
      return acc;
    }, {});
    // 상위 3개 리엑션 선택
    const top3ReactionMap = Object.fromEntries(
      Object.entries(reactionMap).map(([studyId, emojis]) => {
        return [
          studyId,
          Object.fromEntries(
            Object.entries(emojis)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
          ),
        ];
      })
    );

    // 전체스터디 카운트
    const totalCount = await prisma.study.count({ where });
    // 날짜 계산 + 결과 값
    const result = studies.map((study) => {
      const diff = new Date() - new Date(study.createdAt);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: study.id,
        name: study.name,
        nickname: study.nickname,
        description: study.description,
        point: study.point,
        background: study.background,
        days,
        reaction: top3ReactionMap[String(study.id)] || {},
      };
    });

    // 응답
    return res.status(200).json({
      success: true,
      data: result,
      pagination: {
        currentPage: Number(page),
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        hasNextPage: skip + take < totalCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '서버 에러' });
  }
};
