
export interface NewsData {
    news: NewsItem[];
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
    content: ContentItem[];
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

export interface ContentItem {
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