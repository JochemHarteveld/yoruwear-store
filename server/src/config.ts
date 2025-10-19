export interface Config {
  port: number;
  database: {
    url: string;
  };
  cors: {
    origin: string | string[];
  };
  environment: 'development' | 'production';
}

export const config: Config = {
  port: Number(process.env.PORT) || 3000,
  database: {
    url: process.env.DATABASE_URL || process.env.MYSQL_DATABASE || 'mysql://root:password@localhost:3306/yoruwear'
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://jochemharteveld.github.io',
          'https://jochemharteveld.github.io/yoruwear-store',
          process.env.FRONTEND_URL || 'https://jochemharteveld.github.io/yoruwear-store'
        ]
      : ['http://localhost:4200', 'http://localhost:3000']
  },
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'development'
};