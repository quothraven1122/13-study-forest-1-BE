import prisma from '../prisma';

/// 스터디 전체 조회
export const getAllstudy = async (req, res) => {
  try {
    const { keyword, sort = 'recent', page = '1', limit = '10' } = req.query;
    const where = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { nickname: { contains: keyword } },
      ];
    }

    const orderBy = {
      recent: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
    }[sort] || { createdAt: 'desc' };

    const pageNum = Number(page) || 1;
    const take = Number(limit) || 10;
    const skip = (pageNum - 1) * take;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({ where, orderBy, skip, take }),
      prisma.article.count({ where }),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
