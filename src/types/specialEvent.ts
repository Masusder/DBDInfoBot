/**
 * See https://github.com/Masusder/UEParser/blob/master/UEParser/Models/APIComposerModels/SpecialEvent.cs
 **/
export interface SpecialEvent {
    Name: string;
    Description: string;
    StoreItemIds: string[];
    EndTime: Date;
    StartTime: Date;
}