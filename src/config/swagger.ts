import swaggerJsdoc from 'swagger-jsdoc';

export function createSwaggerSpec(port: number) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Node.js Backend API',
        version: '1.0.0',
        description: 'Node.js + TypeScript로 구축된 백엔드 API',
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: '개발 서버',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.ts'], // 라우트 파일의 Swagger 주석을 읽어옴
  };

  return swaggerJsdoc(swaggerOptions);
} 