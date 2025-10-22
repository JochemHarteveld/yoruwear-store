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

      // Convert BigInt fields to strings for JSON serialization
      const serializedOrders = ordersWithDetails.map(order => ({
        ...order,
        id: order.id.toString(),
        userId: order.userId?.toString(),
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
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

  // TEMPORARILY DISABLED OTHER ENDPOINTS TO AVOID BIGINT ISSUES
  /*
  
  // Get all orders with details
  .get('/orders', async () => {
    try {
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

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        ordersWithDetails.map(async (order: any) => {
          const items = await db
            .select({
              id: orderItems.id,
              productId: orderItems.productId,
              productName: products.name,
              quantity: orderItems.quantity,
              price: orderItems.price,
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id));

          return {
            ...order,
            items,
          };
        })
      );

      return {
        success: true,
        data: ordersWithItems,
        totalOrders: ordersWithDetails.length,
      };
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      return {
        success: false,
        error: 'Failed to fetch orders',
        data: [],
        totalOrders: 0,
      };
    }
  }, {
    detail: {
      summary: 'Get all orders (Admin)',
      tags: ['Admin'],
    }
  })
  
  // Get enhanced product analytics
  .get('/products', async () => {
    try {
      const productsWithAnalytics = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          stock: products.stock,
          categoryId: products.categoryId,
          categoryName: categories.name,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .orderBy(products.name);

      // Calculate analytics for each product
      const analyticsPromises = productsWithAnalytics.map(async (product: any) => {
        // Get total quantity sold
        const salesData = await db
          .select({
            totalSold: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.productId, product.id));

        const totalSold = salesData.reduce((sum: number, item: any) => sum + item.totalSold, 0);
        
        // Get number of orders containing this product
        const orderCount = await db
          .select({ count: orderItems.id })
          .from(orderItems)
          .where(eq(orderItems.productId, product.id));

        const ordersContaining = orderCount.length;

        // Calculate stock status
        let stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
        if (product.stock === 0) {
          stockStatus = 'out-of-stock';
        } else if (product.stock <= 10) {
          stockStatus = 'low-stock';
        } else {
          stockStatus = 'in-stock';
        }

        return {
          ...product,
          analytics: {
            totalSold,
            ordersContaining,
            stockStatus,
            revenue: totalSold * parseFloat(product.price),
          },
        };
      });

      const productsWithStats = await Promise.all(analyticsPromises);

      // Calculate overall statistics
      const totalProducts = productsWithStats.length;
      const totalRevenue = productsWithStats.reduce((sum: number, p: any) => sum + p.analytics.revenue, 0);
      const outOfStockProducts = productsWithStats.filter((p: any) => p.analytics.stockStatus === 'out-of-stock').length;
      const lowStockProducts = productsWithStats.filter((p: any) => p.analytics.stockStatus === 'low-stock').length;

      return {
        success: true,
        data: productsWithStats,
        summary: {
          totalProducts,
          totalRevenue,
          outOfStockProducts,
          lowStockProducts,
        },
      };
    } catch (error) {
      console.error('Error fetching admin products:', error);
      return {
        success: false,
        error: 'Failed to fetch product analytics',
        data: [],
        summary: {
          totalProducts: 0,
          totalRevenue: 0,
          outOfStockProducts: 0,
          lowStockProducts: 0,
        },
      };
    }
  }, {
    detail: {
      summary: 'Get products with analytics (Admin)',
      tags: ['Admin'],
    }
  })
  
  // Get dashboard statistics
  .get('/dashboard', async () => {
    try {
      // Total orders
      const totalOrdersResult = await db.select().from(orders);
      const totalOrders = totalOrdersResult.length;

      // Total revenue - properly handle decimal values
      const totalRevenue = totalOrdersResult.reduce((sum: number, order: any) => {
        const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total);
        return sum + (isNaN(orderTotal) ? 0 : orderTotal);
      }, 0);

      // Total products
      const totalProductsResult = await db.select().from(products);
      const totalProducts = totalProductsResult.length;

      // Total users
      const totalUsersResult = await db.select().from(users);
      const totalUsers = totalUsersResult.length;

      // Recent orders (last 10)
      const recentOrders = await db
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
        .limit(10);

      // Top selling products - Fix aggregation
      const topProductsQuery = await db
        .select({
          productId: orderItems.productId,
          productName: products.name,
          totalSold: orderItems.quantity,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .orderBy(desc(orderItems.quantity))
        .limit(5);

      return {
        success: true,
        statistics: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
          totalProducts,
          totalUsers,
        },
        recentOrders,
        topProducts: topProductsQuery,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
  
  // Update order status
  .patch('/orders/:id/status', async ({ params: { id }, body, set }) => {
    try {
      const { status } = body as { status: string };
      const orderId = parseInt(id);
      
      await db
        .update(orders)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));

      // Get the updated order
      const updatedOrder = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (updatedOrder.length === 0) {
        set.status = 404;
        return { success: false, error: 'Order not found' };
      }

      return {
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder[0],
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      set.status = 500;
      return {
        success: false,
        error: 'Failed to update order status',
      };
    }
  }, {
    body: t.Object({
      status: t.String()
    }),
    detail: {
      summary: 'Update order status (Admin)',
      tags: ['Admin'],
    }
  })
  
  // Update product stock
  .patch('/products/:id/stock', async ({ params: { id }, body, set }) => {
    try {
      const { stock } = body as { stock: number };
      const productId = parseInt(id);
      
      await db
        .update(products)
        .set({ 
          stock,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId));

      // Get the updated product
      const updatedProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (updatedProduct.length === 0) {
        set.status = 404;
        return { success: false, error: 'Product not found' };
      }

      return {
        success: true,
        message: 'Product stock updated successfully',
        data: updatedProduct[0],
      };
    } catch (error) {
      console.error('Error updating product stock:', error);
      set.status = 500;
      return {
        success: false,
        error: 'Failed to update product stock',
      };
    }
  }, {
    body: t.Object({
      stock: t.Number()
    }),
    detail: {
      summary: 'Update product stock (Admin)',
      tags: ['Admin'],
    }
  });
  */