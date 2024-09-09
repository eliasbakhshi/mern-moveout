function Cart() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Your Cart</h1>
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">Product</th>
              <th className="border-b px-4 py-2">Price</th>
              <th className="border-b px-4 py-2">Quantity</th>
              <th className="border-b px-4 py-2">Total</th>
              <th className="border-b px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>{/* Render cart items here */}</tbody>
        </table>
        <div className="flex justify-end border-t bg-gray-100 px-4 py-2">
          <span className="font-bold">Total: $PLACEHOLDER$</span>
        </div>
        <div className="flex justify-end px-4 py-4">
          <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
