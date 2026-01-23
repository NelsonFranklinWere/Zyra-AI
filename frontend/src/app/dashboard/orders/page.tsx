'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Package, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';

interface Order {
  id: string;
  customerPhone: string;
  items: Array<{ productId: string; quantity: number; priceCents: number }>;
  totalCents: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  paymentAttempts?: Array<{ id: string; status: string; amountCents: number }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Order[] }>('/api/admin/orders');
      setOrders(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDeliveryIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'NOTIFIED':
      case 'IN_TRANSIT':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-gray-600">View and manage customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="cursor-pointer rounded-lg bg-white p-6 shadow-sm hover:shadow-md"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold">Order #{order.id.substring(0, 8)}</h3>
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.paymentStatus)}
                      <span className="capitalize">{order.paymentStatus.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDeliveryIcon(order.deliveryStatus)}
                      <span className="capitalize">{order.deliveryStatus.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium">KES {(order.totalCents / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {order.items && (
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm font-medium">Items:</div>
                  <div className="mt-2 space-y-1">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {item.quantity}x Item - KES {((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

