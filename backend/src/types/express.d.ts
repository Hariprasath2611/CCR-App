declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isClassCoordinator: boolean;
        department: string;
        assignedClassId?: string;
      };
    }
  }
}

export {};
