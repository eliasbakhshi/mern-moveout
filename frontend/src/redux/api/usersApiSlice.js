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
    loginWithGoogle: builder.mutation({
      query: (credentials) => ({
        url: "/api/login-with-google",
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
        body: { token },
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

    sendEmailResetPassword: builder.mutation({
      query: (email) => ({
        url: "/api/reset-password/",
        method: "POST",
        body: email,
        invalidatesTags: ["User"],
      }),
    }),
    checkTokenResetPassword: builder.query({
      query: (token) => ({
        url: "/api/reset-password/" + token,
        method: "GET",
        providesTags: ["User"],
      }),
    }),
    resetPassword: builder.mutation({
      query: (info) => ({
        url: "/api/reset-password/",
        method: "PUT",
        body: info,
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
        url: "/api/users/" + id,
        method: "GET",
        invalidatesTags: ["User"],
      }),
    }),
    deleteCurrentUser: builder.mutation({
      query: () => ({
        url: "/api/users/delete-current/",
        method: "DELETE",
        providesTags: ["User"],
      }),
    }),
    getUsersEmailAndName: builder.query({
      query: () => ({
        url: "/api/users/get-name-email",
        method: "GET",
      }),
    }),
    shareBox: builder.mutation({
      query: (info) => ({
        url: "/api/users/share-box/",
        method: "POST",
        body: info,
        invalidatesTags: ["User"],
      }),
    }),
    shareLabel: builder.mutation({
      query: (info) => ({
        url: "/api/users/share-label/",
        method: "POST",
        body: info,
        invalidatesTags: ["User"],
      }),
    }),
    getUserFromGoogle: builder.query({
      query: (user) => ({
        url: `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        method: "GET",
        invalidatesTags: ["User"],
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: "application/json",
        },
      }),
    }),
    deactivateCurrentUser: builder.mutation({
      query: (email) => ({
        url: `/api/users/deactivate-current`,
        method: "PUT",
        invalidatesTags: ["User"],
      }),
    }),
    reactivateCurrentUser: builder.mutation({
      query: (email) => ({
        url: `/api/users/reactivate-current`,
        method: "PUT",
        invalidatesTags: ["User"],
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginWithGoogleMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailQuery,
  useSendVerificationEmailMutation,
  useSendEmailResetPasswordMutation,
  useResetPasswordMutation,
  useCheckTokenResetPasswordQuery,
  useEditCurrentUserMutation,
  useGetCurrentUserQuery,
  useDeleteCurrentUserMutation,
  useGetUsersEmailAndNameQuery,
  useShareBoxMutation,
  useShareLabelMutation,
  useGetUserFromGoogleQuery,
  useDeactivateCurrentUserMutation,
  useReactivateCurrentUserMutation,
} = usersApi;
