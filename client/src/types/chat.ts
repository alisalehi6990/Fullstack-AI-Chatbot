export type AttachedFileType = {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeText: string;
};

export type MessageDocument = {
  id: string;
  name: string;
  type: string;
  sizeText: string;
};

export type Message = {
  isUser: boolean;
  content: string;
  documents?: MessageDocument[];
  timestamp?: Date;
};
