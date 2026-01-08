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
  PREVIEW = 3,
  GENERATE = 4,
}
