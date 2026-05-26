import prisma from '../prisma/index.js';


export const getAllStudy = async (req, res) => {
  try {
    const { search, sort = 'recent' } = req.query;

    // 1. 검색 조건
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { nickname: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // 2. 정렬 조건
    const orderBy = {
      highPoint: { point: 'desc' },
      lowPoint: { point: 'asc' },
      recent: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
    }[sort] || { createdAt: 'desc' };

    // 3. 데이터 조회
    const studies = await prisma.study.findMany({
      where,
      orderBy,
    });

    const reactions = await prisma.reaction.findMany();
    // 4. 리엑션 카운트
    const reactionMap = reactions.reduce((acc, cur) => {
      if (!acc[cur.studyId]) acc[cur.studyId] = {};
      acc[cur.studyId][cur.emoji] = (acc[cur.studyId][cur.emoji] || 0) + 1;
      return acc;
    }, {});
    // 5. 상위 3개 리엑션 선택
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
    // 6. 날짜 계산
    const result = studies.map((study) => {
      const diff = new Date() - new Date(study.createdAt);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      return {
        ...study,
        days,
        reaction: top3ReactionMap[study.id] || {},
      };
    });

    // 7. 응답
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '서버 에러' });
  }
};
