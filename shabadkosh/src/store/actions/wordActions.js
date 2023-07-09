import { addWord } from "../../components/util/controller";

export const createWord = (word) => {
    return (dispatch) => {
        // make async call to database
        addWord({
            ...word,
            created_by: 'Gurmehar Singh',
            creator_id: 12345,
            created_at: new Date()
        }).then(() => {
            dispatch({ type: 'CREATE_WORD', word });
        }).catch((err) => {
            dispatch({ type: 'CREATE_WORD_ERROR', err });
        });
    }
};