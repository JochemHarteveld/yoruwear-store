export interface Config {
  port: number;
  database: {
    url: string;
  };
  cors: {
    origin: string | string[];
  };
  environment: 'development' | 'production';
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
}

export const config: Config = {
  port: Number(process.env.PORT) || 3000,
  database: {
    url: process.env.DATABASE_URL || process.env.MYSQL_DATABASE || 'mysql://yoruwear_user:yourpassword@localhost:3306/yoruwear'
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://jochemharteveld.github.io',
          'https://jochemharteveld.github.io/yoruwear-store',
          process.env.FRONTEND_URL || 'https://jochemharteveld.github.io/yoruwear-store'
        ]
      : ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:4201']
  },
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  }
};