import { User } from "firebase/auth";
import { TimestampType } from "./timestamp";
import { ReactNode } from "react";

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

export interface LocalUser {
    user: User | null,
    uid?: string,
    email?: string,
    displayName?: string,
    photoURL?: string
    role?: string,
    username?: string
}

export interface ChildrenProps {
    children?: ReactNode
}

export type UserState = {
    auth: {
      user: LocalUser
    }
}