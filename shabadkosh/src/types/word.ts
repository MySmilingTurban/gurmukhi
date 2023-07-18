import { DocumentReference } from 'firebase/firestore';
import { TimestampType } from './timestamp';

export interface Translation {
    en?: string,
    hi?: string
}

export interface NewWordType {
    id?: string,
    word_id?: string,
    word?: string,
    translation?: string,
    meaning_english?: string,
    meaning_punjabi?: string,
    part_of_speech?: string,
    images?: string[],
    antonyms?: string[],
    synonyms?: string[],
    status?: string,
    created_at: TimestampType,
    created_by: string,
    updated_at: TimestampType,
    updated_by: string,
    notes?: string,
    wordlists?: DocumentReference[]
}

export interface MiniWord {
    id: string;
    word: string;
}

export interface Status {
    [key: string] : string
}
