import { combineReducers } from 'redux';
import authReducer from './authReducer';
import wordReducer from './wordReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    word: wordReducer,
});

export default rootReducer;