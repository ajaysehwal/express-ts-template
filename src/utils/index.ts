import path from "path";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";

export const loadEnvFile = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
  const defaultEnvPath = path.resolve(process.cwd(), ".env");
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    const defaultResult = dotenv.config({ path: defaultEnvPath });
    if (defaultResult.error) {
      throw new Error("No .env file found");
    }
  }
};


export const swaggerOptions:swaggerJsdoc.Options={
    definition:{
      openapi: '3.0.0',
      info: {
        title: 'Express API with Swagger',
        version: '1.0.0',
        description: 'A sample Express API',
      },
      components:{
        securitySchemes:{
          BearerAuth:{
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security:[
        {
          bearerAuth:[]
        }
      ]
    },
    apis: [
      './src/routes/*.ts'
    ]
}