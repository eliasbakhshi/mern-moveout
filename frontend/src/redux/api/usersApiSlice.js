import apiSlice from "./apiSlice";

// TODO: Add custom invalidatesTags providesTags

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
      }),
      invalidatesTags: ["User"],
    }),
    registerWithGoogle: builder.mutation({
      query: (credentials) => ({
        url: "/api/register-with-google",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
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
      }),
      providesTags: ["User"],
    }),
    sendVerificationEmail: builder.mutation({
      query: (email) => ({
        url: "/api/verify-email",
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"],
    }),

    sendEmailResetPassword: builder.mutation({
      query: (email) => ({
        url: "/api/reset-password/",
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"],
    }),
    checkTokenResetPassword: builder.query({
      query: (token) => ({
        url: "/api/reset-password/" + token,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    resetPassword: builder.mutation({
      query: (info) => ({
        url: "/api/reset-password/",
        method: "PUT",
        body: info,
      }),
      invalidatesTags: ["User"],
    }),
    editCurrentUser: builder.mutation({
      query: (info) => ({
        url: "/api/users/current",
        method: "PUT",
        body: info,
      }),
      invalidatesTags: ["User"],
    }),
    getCurrentUser: builder.query({
      query: (id) => ({
        url: "/api/users/" + id,
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),
    deleteCurrentUser: builder.query({
      query: (token) => ({
        url: "/api/users/current",
        method: "DELETE",
        params: {token},
      }),
      providesTags: ["User"],
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
      }),
      invalidatesTags: ["User"],
    }),
    shareLabel: builder.mutation({
      query: (info) => ({
        url: "/api/users/share-label/",
        method: "POST",
        body: info,
      }),
      invalidatesTags: ["User"],
    }),
    getUserFromGoogle: builder.query({
      query: (user) => ({
        url: `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: "application/json",
        },
      }),
      invalidatesTags: ["User"],
    }),
    deactivateCurrentUser: builder.mutation({
      query: () => ({
        url: `/api/users/deactivate-current`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    reactivateCurrentUser: builder.mutation({
      query: () => ({
        url: `/api/users/reactivate-current`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    sendDeleteEmail: builder.mutation({
      query: () => ({
        url: `/api/users/send-delete-email`,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    getUsers: builder.query({
      query: () => ({
        url: `/api/users`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getDeletedUsers: builder.query({
      query: () => ({
        url: `/api/users/deleted`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (info) => ({
        url: `/api/users`,
        body: info,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    editUser: builder.mutation({
      query: (info) => ({
        url: `/api/users`,
        body: info,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (info) => ({
        url: `/api/users`,
        body: info,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    changeUserStatus: builder.mutation({
      query: (info) => ({
        url: `/api/users/status`,
        body: info,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    recoverUser: builder.mutation({
      query: (info) => ({
        url: `/api/users/recover`,
        body: info,
        method: "PUT",
      }),
      invalidatesTags: ["User"],
    }),
    deleteUserPermanently: builder.mutation({
      query: (info) => ({
        url: `/api/users/permanently`,
        body: info,
        method: "Delete",
      }),
      invalidatesTags: ["User"],
    }),
    sendMarketingEmail: builder.mutation({
      query: (info) => ({
        url: `/api/users/MarketingEmail`,
        body: info,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLoginWithGoogleMutation,
  useRegisterMutation,
  useRegisterWithGoogleMutation,
  useLogoutMutation,
  useVerifyEmailQuery,
  useSendVerificationEmailMutation,
  useSendEmailResetPasswordMutation,
  useResetPasswordMutation,
  useCheckTokenResetPasswordQuery,
  useEditCurrentUserMutation,
  useGetCurrentUserQuery,
  useDeleteCurrentUserQuery,
  useGetUsersEmailAndNameQuery,
  useShareBoxMutation,
  useShareLabelMutation,
  useGetUserFromGoogleQuery,
  useDeactivateCurrentUserMutation,
  useReactivateCurrentUserMutation,
  useSendDeleteEmailMutation,
  useGetUsersQuery,
  useGetDeletedUsersQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
  useChangeUserStatusMutation,
  useRecoverUserMutation,
  useDeleteUserPermanentlyMutation,
  useSendMarketingEmailMutation,
} = usersApi;
