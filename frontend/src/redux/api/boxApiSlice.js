import apiSlice from "./apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBoxes: builder.query({
      query: () => ({
        url: "/api/boxes/",
        method: "GET",
        providesTags: ["Box"],
      }),
    }),
    getBox: builder.query({
      query: (boxId) => ({
        url: "/api/boxes/" + boxId,
        method: "GET",
        providesTags: ["Box"],
      }),
    }),
    createBox: builder.mutation({
      query: (info) => ({
        url: "/api/boxes",
        method: "POST",
        body: info,
        invalidatesTags: ["Box"],
      }),
    }),
    updateBox: builder.mutation({
      query: (info) => ({
        url: "/api/boxes",
        method: "PUT",
        body: info,
        invalidatesTags: ["Box"],
      }),
    }),
    deleteBox: builder.mutation({
      query: (id) => ({
        url: "/api/boxes/" + id,
        method: "DELETE",
        invalidatesTags: ["Box"],
      }),
    }),




    getItems: builder.query({
      query: (boxId) => ({
        url: `/api/boxes/${boxId}/items/`,
        method: "GET",
        providesTags: ["Box"],
      }),
    }),
    getItem: builder.query({
      query: (itemId) => ({
        url: `/api/boxes/${boxId}/items/${itemId}`,
        method: "GET",
        providesTags: ["Box"],
      }),
    }),
    createItem: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/items",
        method: "POST",
        body: info,
        invalidatesTags: ["Box"],
      }),
    }),
    updateItem: builder.mutation({
      query: (info) => ({
        url: "/api/boxes/items",
        method: "PUT",
        body: info,
        invalidatesTags: ["Box"],
      }),
    }),
    deleteItem: builder.mutation({
      query: (id) => ({
        url: "/api/boxes/items/" + id,
        method: "DELETE",
        invalidatesTags: ["Box"],
      }),
    })
  }),
});

export const {
  useGetBoxesQuery,
  useGetBoxQuery,
  useCreateBoxMutation,
  useUpdateBoxMutation,
  useDeleteBoxMutation,
  useGetItemsQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = usersApi;
