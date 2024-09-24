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
        invalidatesTags: ["User"],
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
        method: "PUT",
        params: { token },
        providesTags: ["User"],
      }),
    }),
    sendVerificationEmail: builder.mutation({
      query: (email) => ({
        url: "/api/verify-email",
        method: "POST",
        body: email,
        invalidatesTags: ["User"],
      }),
    }),
    editCurrentUser: builder.mutation({
      query: (info) => ({
        url: "/api/users",
        method: "PUT",
        body: info,
        invalidatesTags: ["User"],
      }),
    }),
    getCurrentUser: builder.query({
      query: (id) => ({
        url: "/api/user/" + id,
        method: "GET",
        invalidatesTags: ["User"],
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailQuery,
  useSendVerificationEmailMutation,
  useEditCurrentUserMutation,
  useGetCurrentUserQuery,
} = usersApi;
