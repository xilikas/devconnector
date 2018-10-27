import axios from "axios";
import { GET_ERRORS } from "./types";

// Register User
export const registerUser = (userData, history) => dispatch => {
    // Dispatch (redux-thunk) waits for the call before continuing
    axios
        .post("/api/users/register", userData)
        // history allows us to redirect to another page from an action
        .then(res => history.push("/login"))
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};
