import { db } from '../../db/index.js';
import { orders, orderItems, products } from '../../db/schema.js';
import { CreateOrderRequest, OrderResponse } from './model.js';
import { eq } from 'drizzle-orm';

export class OrderService {
  async createOrder(orderData: CreateOrderRequest, userId?: number): Promise<OrderResponse> {
    try {
      // Generate order number
      const orderNumber = 'ORD' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      // Create order
      await db.insert(orders).values({
        orderNumber,
        userId: userId ? BigInt(userId) : undefined,
        contactName: orderData.contact.fullName,
        contactEmail: orderData.contact.email,
        contactPhone: orderData.contact.phone,
        streetAddress: orderData.address.streetAddress,
        city: orderData.address.city,
        postalCode: orderData.address.postalCode,
        country: orderData.address.country,
        deliveryMethod: orderData.delivery.method,
        deliveryCost: orderData.delivery.cost.toString(),
        paymentMethod: orderData.payment.method,
        subtotal: orderData.subtotal.toString(),
        total: orderData.total.toString(),
        status: 'confirmed'
      });

      // Get the created order
      const [createdOrder] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber));

      if (!createdOrder) {
        throw new Error('Failed to retrieve created order');
      }

      // Create order items
      if (orderData.items.length > 0) {
        await db.insert(orderItems).values(
          orderData.items.map(item => ({
            orderId: BigInt(createdOrder.id),
            productId: BigInt(item.id),
            quantity: item.quantity,
            price: item.price.toString()
          }))
        );
      }

      // Return formatted response
      return {
        id: Number(createdOrder.id),
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        total: Number(createdOrder.total),
        subtotal: Number(createdOrder.subtotal),
        deliveryCost: Number(createdOrder.deliveryCost),
        createdAt: createdOrder.createdAt!.toISOString(),
        contact: {
          fullName: createdOrder.contactName,
          email: createdOrder.contactEmail,
          phone: createdOrder.contactPhone
        },
        address: {
          streetAddress: createdOrder.streetAddress,
          city: createdOrder.city,
          postalCode: createdOrder.postalCode,
          country: createdOrder.country
        },
        delivery: {
          method: createdOrder.deliveryMethod,
          cost: Number(createdOrder.deliveryCost)
        },
        payment: {
          method: createdOrder.paymentMethod
        },
        items: orderData.items
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async getOrderById(orderId: number): Promise<OrderResponse | null> {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!order) {
        return null;
      }

      // Get order items with product names
      const items = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          productId: orderItems.productId,
          productName: products.name
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, BigInt(order.id)));

      return {
        id: Number(order.id),
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        subtotal: Number(order.subtotal),
        deliveryCost: Number(order.deliveryCost),
        createdAt: order.createdAt!.toISOString(),
        contact: {
          fullName: order.contactName,
          email: order.contactEmail,
          phone: order.contactPhone
        },
        address: {
          streetAddress: order.streetAddress,
          city: order.city,
          postalCode: order.postalCode,
          country: order.country
        },
        delivery: {
          method: order.deliveryMethod,
          cost: Number(order.deliveryCost)
        },
        payment: {
          method: order.paymentMethod
        },
        items: items.map(item => ({
          id: Number(item.productId),
          name: item.productName || `Product #${item.productId}`,
          price: Number(item.price),
          quantity: item.quantity
        }))
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  async getUserOrders(userId: number): Promise<OrderResponse[]> {
    try {
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, BigInt(userId)));

      const ordersWithItems = await Promise.all(
        userOrders.map(async (order) => {
          // Get order items with product names
          const items = await db
            .select({
              id: orderItems.id,
              quantity: orderItems.quantity,
              price: orderItems.price,
              productId: orderItems.productId,
              productName: products.name
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, BigInt(order.id)));

          return {
            id: Number(order.id),
            orderNumber: order.orderNumber,
            status: order.status,
            total: Number(order.total),
            subtotal: Number(order.subtotal),
            deliveryCost: Number(order.deliveryCost),
            createdAt: order.createdAt!.toISOString(),
            contact: {
              fullName: order.contactName,
              email: order.contactEmail,
              phone: order.contactPhone
            },
            address: {
              streetAddress: order.streetAddress,
              city: order.city,
              postalCode: order.postalCode,
              country: order.country
            },
            delivery: {
              method: order.deliveryMethod,
              cost: Number(order.deliveryCost)
            },
            payment: {
              method: order.paymentMethod
            },
            items: items.map(item => ({
              id: Number(item.productId),
              name: item.productName || `Product #${item.productId}`,
              price: Number(item.price),
              quantity: item.quantity
            }))
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }
}