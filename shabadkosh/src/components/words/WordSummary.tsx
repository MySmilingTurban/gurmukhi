import React from "react";
import { Card } from "react-bootstrap";
import { NewWordType } from "../../types/word";
import { TimestampType } from "../../types/timestamp";

type MyProps = {
    word: NewWordType
}

const WordSummary = ({word}: MyProps) => {
    function convertTimestampToDate(timestamp: TimestampType) {
        let timestampDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        return timestampDate.toLocaleString('en-us', { year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    }
    return (
        <Card>
            <Card.Title>{word.word} ({word.translation})</Card.Title>
            <Card.Body>
                <Card.Text>
                    <p>{word.meaning_punjabi}</p>
                    <p>{word.meaning_english}</p>
                    <p>Created by {word.created_by}</p>
                    <p className="grey">{word.updated_at && convertTimestampToDate(word.updated_at)}</p>
                </Card.Text>
                <Card.Link href="#">Edit</Card.Link>
                <Card.Link href="#">Delete</Card.Link>
            </Card.Body>
        </Card>
    )
}

export default WordSummary;