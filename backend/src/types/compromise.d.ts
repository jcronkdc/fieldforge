declare module "compromise" {
  export interface Document {
    json(options?: Record<string, unknown>): Array<{
      terms: Array<{
        text?: string;
        tags?: string[];
      }>;
    }>;
    wordCount(): number;
  }

  export type NLP = (text: string) => Document;

  const nlp: NLP;
  export default nlp;
}

declare module "compromise" {
  type TermTags = string[];

  interface TermJSON {
    text: string;
    tags: TermTags;
  }

  interface SentenceJSON {
    terms: TermJSON[];
  }

  interface Document {
    json(options?: { offset?: boolean }): SentenceJSON[];
    wordCount(): number;
  }

  const nlp: (text: string) => Document;
  export default nlp;
}

