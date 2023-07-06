const initState = {
    user: null
}

const authReducer = (state = initState, action: any) => {
    switch (action.type) {
        case 'SET_USER':
            console.log('set user', action.user);
            return {
                ...state,
                user: action.payload
            };
        default:
            return state;
    }
}

export default authReducer