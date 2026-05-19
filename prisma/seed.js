import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//Study Seed 생성
const studies = [
  {
    name: '빛과 어둠의 스터디',
    description: '모두 함께 이퀴리브리엄에 도달해봅시다.',
    password: 'luminus1234!@',
    nickname: '루미너스',
    background:
      'https://png.pngtree.com/thumb_back/fh260/background/20241124/pngtree-celestial-circle-of-light-in-space-emitting-a-soft-glow-amidst-image_16630308.jpg',
  },
  {
    name: '드레곤 마스터의 길',
    description: '미르 훈련하기 빡세요 ㅠㅠ 같이 배워나갑시다',
    password: 'evan1234!@',
    nickname: '에반',
    background:
      'https://i.namu.wiki/i/v_zK7er3cBXRkKPgXQKyFnRNCBOmGDKRwDGUI92DDImUKG2kFa8RLZrJdeEZCXnpj8Lsp1efiIFkNwJhQNo3lw.webp',
  },
  {
    name: '카드 마술 익히기',
    description: '카드로 사람 패는거 배워보고 싶지 않아?',
    password: 'phantom1234!@',
    nickname: '팬텀',
    background:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/AcetoFive.JPG/1280px-AcetoFive.JPG',
  },
  {
    name: '폴암 휘두르기 맹연습',
    description: '봉인 됐다가 다시 폴압 휘두르려니까 너무 힘드네',
    password: 'aran1234!@',
    nickname: '아란',
    background:
      'https://cdn.imweb.me/upload/S201901155c3d45c030b1a/5c3f4bd73e009.png',
  },
  {
    name: '정령과 대화하기',
    description: '각종 동물 정령과 대화하는 법 익히기',
    password: 'eunwol1234!@',
    nickname: '은월',
    background:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIzS6jib8UzBdBBDr9TFsZY0qs6SLqoQU_Eg&s',
  },
  {
    name: '화살 마스터',
    description: '듀얼 보우건으로 니들 다 패버릴거야',
    password: 'mercedes1234!@',
    nickname: '메르세데스',
    background:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJTI80aFfSGs-0JhK54lx5bzzt2MlN5I23bQ&s',
  },
  {
    name: '시간 마술',
    description: '네 시간 순삭되게 해줄게 ^0^',
    password: 'freud1234!@',
    nickname: '프리드',
    background:
      'https://i.namu.wiki/i/0SGoftrehJuPefLVXRPwjyDlkqg0bCp6ZEj4JsHtSDH-WyEIB4I2vdcCDZ_hM4YrHG8jKFytvfoCDMmmgAWAlQ.webp',
  },
  {
    name: '간호학 101',
    description: '내말 안들으면 힐 안해줌',
    password: 'bishop1234!@',
    nickname: '비숍',
    background:
      'https://i.namu.wiki/i/lZoMNR1GxpifZDc57AIQdBBTqsqmIjSkhMhx6CiMjOx9Dcw3AyI-HHU5yKemfGyW20zUrL53hnC91o9zIZj1IQ.webp',
  },
  {
    name: '집안 다시 일으키기',
    description: '군대 갔다 오면 집 지켜준다 한 대장 죽여버릴거임',
    password: 'demon1234!@',
    nickname: '데몬 어벤져',
    background:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfUNP9XPH7JHoT2qSD5ho2VHL7qkYQSWtXqA&s',
  },
];

async function main() {
  //seeding 시작
  console.log('✅ seeding 시작');

  // 기존 데이터 삭제
  await prisma.study.deleteMany();
  console.log('📝 기존 데이터 삭제 완료');

  //seeding
  await prisma.study.createMany({ data: studies });
  console.log(`🔎 ${studies.length}개 스터디 생성`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
