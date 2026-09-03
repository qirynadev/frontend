export type ChatMessageType = {
  id: string;
  messageType: "sender" | "receiver";
  bubbleType: "image" | "text" | "file";
  message?: string;
  file?: File;
  status?: "sent" | "delivered" | "read";
};

export type MentalOQuizType = {
  description: string;
  id: string;
  type: "unique" | "libre" | "multiple";
  label: string;
  answers: any;
};
