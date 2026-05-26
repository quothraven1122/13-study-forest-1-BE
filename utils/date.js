export const getStartAndEndOfWeek = () => {
  const now = new Date();

  const day = now.getDay(); // 일:0 ~ 토:6
  const diff = day === 0 ? -6 : 1 - day; //일요일(0)이면 -6해서 이번주 월요일로 가져오기

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diff); // 월요일 기준
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};
