import { GET_ERRORS } from "../actions/types";

const initialState = {};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_ERRORS:
            return action.payload; // Puts errors into Redux state
        default:
            return state;
    }
}
