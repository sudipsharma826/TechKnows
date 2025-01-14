import { configureStore } from "@reduxjs/toolkit";
import userReducer  from "./slices/userSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            //List all the reducers /slices here
            user: userReducer,
        },
    });
};
