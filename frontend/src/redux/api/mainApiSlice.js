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
      providesTags: (result, error, boxId) => [{ type: "Box", id: boxId }],
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
      invalidatesTags: (result, error, { id }) => [{ type: "Box", id }],
    }),
    deleteBox: builder.mutation({
      query: (id) => ({
        url: "/api/boxes/" + id,
        method: "DELETE",
        invalidatesTags: ["Box"],
      }),
      invalidatesTags: (result, error, id) => [{ type: "Box", id }],
    }),
    changeBoxStatus: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/status",
        body: info,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Box", id }],
    }),

    // public stuff
    showBox: builder.query({
      query: (boxId) => ({
        url: "/api/boxes/" + boxId + "/show",
        method: "GET",
      }),
      providesTags: (result, error, boxId) => [{ type: "Box", id: boxId }],
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
