const corsOrigins = [
  'http://localhost:3000',
  'https://develop.d35lpok7005dz1.amplifyapp.com',
  'https://localhost:5500',
];

export const corsConfig = {
  origin: corsOrigins, // 요청을 보내는 클라이언트의 주소를 명시
  credentials: true,
};
