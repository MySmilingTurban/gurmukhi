import { TimestampType } from "./timestamp";

export interface NewWordType {
    id?: string,
    word_id?: string,
    word?: string,
    translation?: string,
    meaning_english?: string,
    meaning_punjabi?: string,
    images?: string[],
    antonyms?: string[],
    synonyms?: string[],
    status?: string,
    created_at: TimestampType,
    created_by: string,
    updated_at: TimestampType,
    updated_by: string,
    notes?: string,
}

export interface MiniWord {
    id: string;
    word: string;
}