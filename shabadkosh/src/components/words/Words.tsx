import React from "react";
import { Card } from "react-bootstrap";
import WordSummary from "./WordSummary";
import { NewWordType } from "../../types/word";
import { Link } from "react-router-dom";

type MyProps = {
    words: NewWordType[]
}

const Words = ({words}: MyProps) => {
    return (
        <div className="project-list section">
            {words && words.map(word => {
                console.log("word", word);
                return (
                    <Link to={'/words/' + word.id} key={word.id}>
                      <WordSummary word={word} key={word.id}/>
                    </Link>
                )
            })}
        </div>
    );
}

export default Words;