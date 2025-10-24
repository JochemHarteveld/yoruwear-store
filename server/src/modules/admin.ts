import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users, orders, orderItems, products, categories } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { AuthMiddleware } from './auth/middleware';
import { AuthUtils } from '../utils/auth';

/**
 * Admin Routes Module
 * Provides administrative endpoints for managing the YoruWear store
 */
export const admin = new Elysia({ prefix: '/admin' })
  
  // Test endpoint without auth
  .get('/test', () => {
    return { message: 'Admin module is working' };
  })
  
  // Dashboard endpoint with authentication and actual database queries
  .get('/dashboard', async ({ headers, set }) => {
    try {
      // Check authentication
      const authorization = headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Authorization token required' };
      }
      
      const token = authorization.slice(7);
      
      try {
        const payload = AuthUtils.verifyAccessToken(token);
        
        // Get full user details to check admin status
        const userDetails = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
        
        if (!userDetails[0]) {
          set.status = 401;
          return { error: 'User not found' };
        }
        
        if (!userDetails[0].isAdmin) {
          set.status = 403;
          return { error: 'Admin access required' };
        }
      } catch (error) {
        set.status = 401;
        return { error: 'Invalid or expired token' };
      }

      console.log('Dashboard endpoint called - fetching real data');
      
      // Get actual counts using SQL COUNT to avoid BigInt issues with IDs
      const [ordersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
      const [productsCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
      const [usersCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);

      // Calculate actual total revenue
      const ordersForRevenue = await db.select({ 
        total: orders.total 
      }).from(orders);
      
      const totalRevenue = ordersForRevenue.reduce((sum: number, order) => {
        // Handle decimal field conversion properly
        const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total);
        return sum + (isNaN(orderTotal) ? 0 : orderTotal);
      }, 0);

      // Get recent orders with BigInt handling
      const recentOrdersRaw = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          userName: users.name,
          total: orders.total,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt))
        .limit(5);

      // Convert BigInt fields to strings for JSON serialization
      const recentOrders = recentOrdersRaw.map(order => ({
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        userName: order.userName || 'Unknown',
        total: order.total,
        status: order.status,
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      }));

      // Get top-selling products
      const topProductsRaw = await db
        .select({
          productId: orderItems.productId,
          productName: products.name,
          totalSold: sql<number>`SUM(${orderItems.quantity})`,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .groupBy(orderItems.productId, products.name)
        .orderBy(desc(sql`SUM(${orderItems.quantity})`))
        .limit(5);

      // Convert BigInt fields to strings
      const topProducts = topProductsRaw.map(product => ({
        productId: product.productId?.toString(),
        productName: product.productName || 'Unknown Product',
        totalSold: Number(product.totalSold) || 0,
      }));

      return {
        success: true,
        statistics: {
          totalOrders: Number(ordersCount.count),
          totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
          totalProducts: Number(productsCount.count),
          totalUsers: Number(usersCount.count),
        },
        recentOrders,
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      set.status = 500;
      return {
        success: false,
        error: 'Failed to fetch dashboard data',
        statistics: {
          totalOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          totalUsers: 0,
        },
        recentOrders: [],
        topProducts: [],
      };
    }
  }, {
    detail: {
      summary: 'Get admin dashboard statistics',
      tags: ['Admin'],
    }
  })

  // Get all orders with details (with BigInt handling)
  .get('/orders', async ({ headers, set }) => {
    try {
      // Check authentication
      const authorization = headers.authorization;
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Authorization token required' };
      }
      
      const token = authorization.slice(7);
      
      try {
        const payload = AuthUtils.verifyAccessToken(token);
        
        // Get full user details to check admin status
        const userDetails = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
        
        if (!userDetails[0]) {
          set.status = 401;
          return { error: 'User not found' };
        }
        
        if (!userDetails[0].isAdmin) {
          set.status = 403;
          return { error: 'Admin access required' };
        }
      } catch (error) {
        set.status = 401;
        return { error: 'Invalid or expired token' };
      }

      const ordersWithDetails = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
          userName: users.name,
          userEmail: users.email,
          contactName: orders.contactName,
          contactEmail: orders.contactEmail,
          contactPhone: orders.contactPhone,
          status: orders.status,
          total: orders.total,
          subtotal: orders.subtotal,
          deliveryCost: orders.deliveryCost,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          streetAddress: orders.streetAddress,
          city: orders.city,
          postalCode: orders.postalCode,
          country: orders.country,
          paymentMethod: orders.paymentMethod,
          deliveryMethod: orders.deliveryMethod,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt));

      // Get order items for all orders
      const allOrderItems = await db
        .select({
          orderId: orderItems.orderId,
          id: orderItems.id,
          productId: orderItems.productId,
          productName: products.name,
          quantity: orderItems.quantity,
          price: orderItems.price,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id));

      // Group order items by order ID
      const itemsByOrderId = allOrderItems.reduce((acc, item) => {
        if (!item.orderId) return acc;
        
        const orderId = item.orderId.toString();
        if (!acc[orderId]) {
          acc[orderId] = [];
        }
        acc[orderId].push({
          id: item.id.toString(),
          productId: item.productId?.toString() || '',
          productName: item.productName || 'Unknown Product',
          quantity: Number(item.quantity),
          price: item.price,
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Convert BigInt fields to strings for JSON serialization and add items
      const serializedOrders = ordersWithDetails.map(order => ({
        ...order,
        id: order.id.toString(),
        userId: order.userId?.toString(),
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
        items: itemsByOrderId[order.id.toString()] || [],
      }));

      return {
        success: true,
        data: serializedOrders,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      set.status = 500;
      return {
        success: false,
        error: 'Failed to fetch orders',
      };
    }
  }, {
    detail: {
      summary: 'Get all orders (Admin)',
      tags: ['Admin'],
    }
  });
