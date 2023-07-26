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
    sentences?: string[],
    status?: string,
    created_at: TimestampType,
    created_by: string,
    updated_at: TimestampType,
    updated_by: string,
    notes?: string,
    wordlists?: DocumentReference[],
    is_for_support?: boolean
}

export interface MiniWord {
    id?: string,
    word?: string,
    translation?: string,
    is_for_support?: boolean
}

export interface Status {
    [key: string] : string
}
