export const setUser = (user) => {
    return {
        type: 'SET_USER',
        payload: user
    }
}

export const setAuthUser = (user) => async dispatch => {
    dispatch({
        type: 'SET_USER',
        payload: user
    })
}