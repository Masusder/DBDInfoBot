
export interface NewsData {
    news: NewsItem[];
    messages: InboxItem[];
}

interface RewardData {
    type: string;
    amount: number;
    id: string;
}

interface Claimable {
    type: string;
    data: RewardData[];
}

interface Message {
    title: string;
    body: string;
    claimable: Claimable;
}

export interface InboxItem {
    expireAt: number;
    received: number;
    flag: string;
    gameSpecificData: object;
    read: boolean;
    allowedPlatforms: string[];
    message: Message;
    tag: string[];
    userMinVersion: string;
    translationId: string;
    recipientId: string;
}

export interface Section {
    type: string;
    text?: string;
    rewards?: ShowcasedItem[];
}

export interface MessageBody {
    sections: Section[];
    callToAction?: CallToAction;
}


export interface NewsItem {
    id: string;
    title: string;
    url: string;
    images: Image[];
    contentHash: string;
    weight: number;
    startDate: Date;
    endDate: Date;
    metaData: MetaData;
    newsContent: NewsContent;
}

interface Image {
    path: string;
    url: string;
    version: string;
}

interface MetaData {
    eventID?: string;
    isPopup: boolean;
    isSticky: boolean;
    segmentationTags: string[];
}

interface NewsContent {
    callToAction: CallToAction;
    content: NewsContentItem[];
    id: string;
    image: ImageContent;
    title: string;
}

export interface CallToAction {
    link: string;
    qrCodeIsApprovedOnSwitch: boolean;
    shouldPresentAsQrCode: boolean;
    text: string;
}

export interface NewsContentItem {
    text?: string;
    showcasedItem?: ShowcasedItem[];
    type: string;
}

interface ShowcasedItem {
    id: string;
    amount: number;
    type: string;
}

interface ImageContent {
    contentVersion: string;
    packagedPath: string;
    uri: string;
}