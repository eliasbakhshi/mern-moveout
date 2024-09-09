import apiSlice from "./apiSlice";


export const usersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/api/login",
                method: "POST",
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: "/api/register",
                method: "POST",
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/api/logout",
                method: "POST",
            }),
        }),
        verifyEmail: builder.query({
            query: (token) => ({
                url: "/api/verify-email",
                method: "GET",
                params: { token },
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useVerifyEmailQuery } = usersApi;
