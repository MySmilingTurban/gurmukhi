import { TimestampType } from "./timestamp";

export interface NewUserType {
    id?: string,
    name?: string,
    username?: string,
    email?: string,
    pwd?: string,
    role?: string,
    created_at: TimestampType,
    created_by: string,
    updated_at: TimestampType,
}