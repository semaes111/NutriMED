import 'express-session';

declare module 'express-session' {
  interface SessionData {
    patientSession?: {
      patient: {
        id: number;
        name: string;
        dietLevel: number;
        accessCode: string;
        codeExpiry: Date | null;
        age: number | null;
        height: string | null;
        initialWeight: string | null;
        targetWeight: string | null;
        medicalNotes: string | null;
      };
      loginTime: string;
    };
  }
}