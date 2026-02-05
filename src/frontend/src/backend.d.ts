import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type UserId = Principal;
export type Time = bigint;
export type MessageId = bigint;
export type RoomId = string;
export interface Message {
    id: MessageId;
    content: string;
    edited: boolean;
    createdAt: Time;
    senderUsername: Username;
    attachment?: ExternalBlob;
    senderId: UserId;
}
export type Username = string;
export interface UserProfile {
    bio: string;
    username: Username;
    displayName: string;
    userId: UserId;
    createdAt: Time;
    isOnline: boolean;
    lastSeen: Time;
    avatar?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteGlobalMessage(messageId: MessageId): Promise<void>;
    fetchGlobalMessages(fromTimestamp: Time): Promise<Array<Message>>;
    getAllProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProfile(user: UserId): Promise<UserProfile>;
    getSiteLogo(): Promise<ExternalBlob | null>;
    getStatus(): Promise<{
        canisterTime: Time;
        messageCount: bigint;
        startupTime: Time;
        userCount: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logout(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(room: RoomId, content: string, attachment: ExternalBlob | null): Promise<void>;
    sendMessageWithAttachments(roomId: RoomId, content: string, attachments: Array<ExternalBlob>): Promise<void>;
    setSiteLogo(newLogo: ExternalBlob): Promise<void>;
    toggleOnlineStatus(isOnline: boolean): Promise<void>;
    updateBio(newBio: string): Promise<void>;
    updateDisplayName(newDisplayName: string): Promise<void>;
    updateMessage(roomId: RoomId, messageId: MessageId, newContent: string | null, newAttachment: ExternalBlob | null): Promise<boolean>;
    uploadAvatar(avatarBlob: ExternalBlob): Promise<void>;
}
