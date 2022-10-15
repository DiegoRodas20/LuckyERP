export interface Attachment {
    name: string;
    innerMsgContent: boolean;
    fileNameShort: string;
    dataId?: number;
    contentLength?: number;
    extension: string;
    fileName: string;
    pidContentId: string;
}

export interface Recipient {
    name: string;
}

export interface MensajeOutlook {
    attachments: Attachment[];
    recipients: Recipient[];
    senderName: string;
    body: string;
    subject: string;
}
