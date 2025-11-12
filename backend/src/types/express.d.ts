declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email?: string;
      role?: string;
      company_id?: string;
      user_metadata?: Record<string, any>;
    };
  }
}



