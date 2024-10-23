import apiSlice from "./apiSlice";

export const mainApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBoxes: builder.query({
      query: () => ({
        url: "/api/boxes/",
        method: "GET",
      }),
      providesTags: ["Box"],
    }),
    getBox: builder.query({
      query: (boxId) => ({
        url: "/api/boxes/" + boxId,
        method: "GET",
      }),
      providesTags: ["Box"],
    }),
    createBox: builder.mutation({
      query: (info) => ({
        url: "/api/boxes",
        method: "POST",
        body: info,
      }),
      invalidatesTags: ["Box"],
    }),
    updateBox: builder.mutation({
      query: (info) => ({
        url: "/api/boxes",
        method: "PUT",
        body: info,
      }),
      invalidatesTags: ["Box"],
    }),
    deleteBox: builder.mutation({
      query: (id) => ({
        url: "/api/boxes/" + id,
        method: "DELETE",
        invalidatesTags: ["Box"],
      }),
      invalidatesTags: ["Box"],
    }),
    changeBoxStatus: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/status",
        body: info,
        method: "PUT",
      }),
      invalidatesTags: ["Box"],
    }),
    changeCurrency: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/currency",
        body: info,
        method: "PUT",
      }),
      invalidatesTags: ["Box"],
    }),

    // public stuff
    showBox: builder.query({
      query: (boxId) => ({
        url: "/api/boxes/" + boxId + "/show",
        method: "GET",
      }),
      providesTags: ["Box"],
    }),
    sendContactMessage: builder.mutation({
      query: (info) => ({
        url: "/api/contact",
        method: "POST",
        body: info,
      }),
    }),

    // Items
    getItems: builder.query({
      query: ({ boxId, privateCode }) => ({
        url: `/api/boxes/${boxId}/items/`,
        method: "GET",
        params: { privateCode },
      }),
      providesTags: ["Box"],
    }),
    getItem: builder.query({
      query: (itemId) => ({
        url: `/api/boxes/${boxId}/items/${itemId}`,
        method: "GET",
      }),
      providesTags: ["Box"],
    }),
    createItem: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/items",
        method: "POST",
        body: info,
      }),
      invalidatesTags: ["Box"],
    }),
    updateItem: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/items",
        method: "PUT",
        body: info,
      }),
      invalidatesTags: ["Box"],
    }),
    deleteItem: builder.mutation({
      query: (id) => ({
        url: "/api/boxes/items/" + id,
        method: "DELETE",
      }),
      invalidatesTags: ["Box"],
    }),

  }),
});

export const {
  useGetBoxesQuery,
  useGetBoxQuery,
  useCreateBoxMutation,
  useUpdateBoxMutation,
  useDeleteBoxMutation,
  useChangeBoxStatusMutation,
  useChangeCurrencyMutation,
  // public stuff
  useShowBoxQuery,
  useSendContactMessageMutation,
  // Items
  useGetItemsQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = mainApi;
