export interface ContactRow {
  [key: string]: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export interface GenerationResult {
  originalData: ContactRow;
  emails: GeneratedEmail[];
}

export enum AppStep {
  UPLOAD = 1,
  TEMPLATE = 2,
  MAPPING = 3,
  PREVIEW = 4,
  GENERATE = 5,
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface MappingState {
  [templateVariable: string]: string; // template var -> csv header
}

export interface GenerationConfig {
  apiKey: string;
}
