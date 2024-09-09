function Orders() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>
      <div className="rounded-lg bg-white p-4 shadow-md">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-2">Order ID</th>
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">1</td>
              <td className="py-2">2022-01-01</td>
              <td className="py-2">Delivered</td>
            </tr>
            <tr>
              <td className="py-2">2</td>
              <td className="py-2">2022-01-05</td>
              <td className="py-2">In Progress</td>
            </tr>
            {/* Add more rows for each order */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
