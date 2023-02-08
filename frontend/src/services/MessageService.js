import { Subject } from "rxjs";

const subject = new Subject();

export const messageType = {
  AddNode: 1,
  DeleteNode: 2,
};

export const messageService = {
  sendMessage: (messageType, data) =>
    subject.next({ type: messageType, data: data }),
  clearMessages: () => subject.next(),
  onMessage: () => subject.asObservable(),
};
