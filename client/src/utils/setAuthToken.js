import axios from "axios";

// Attaches authToken to header each time this is called

const setAuthToken = token => {
    // Apply to every request
    if (token) axios.defaults.headers.common["Authorization"] = token;
    // Delete auth header
    else delete axios.defaults.headers.common["Authorization"];
};

export default setAuthToken;
