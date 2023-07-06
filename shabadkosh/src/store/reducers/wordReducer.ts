const initState = {
    words: [
        {id: '1', word: 'ਸਤਿਗੁਰ', meaning: 'true guru', type: 'noun', status: 'creating'},
        {id: '2', word: 'somethin', meaning: 'true guru', type: 'verb', status: 'creating'},
        {id: '3', word: 'zoom', meaning: 'true guru', type: 'noun', status: 'created'},
    ]
}

const wordReducer = (state = initState, action: any) => {
    switch (action.type) {
        case 'CREATE_WORD':
            console.log('created word', action.word)
            return state;
        case 'CREATE_WORD_ERROR':
            console.log('create word error', action.err)
            return state;
        default:
            return state;
    }
}

export default wordReducer