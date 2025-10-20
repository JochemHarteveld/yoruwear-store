import { Elysia, t } from 'elysia';
import { OrderService } from './service';
import { CreateOrderRequest } from './model';

/**
 * Order Controller - HTTP routing and request validation
 */
export const OrderController = new Elysia({ prefix: '/api/orders' })
  .decorate('orderService', new OrderService())
  .post('/', async ({ body, orderService }) => {
    try {
      const orderData = body as CreateOrderRequest;
      
      // Validate required fields
      if (!orderData.contact?.fullName || !orderData.contact?.email || !orderData.contact?.phone) {
        throw new Error('Contact information is required');
      }
      
      if (!orderData.address?.streetAddress || !orderData.address?.city || !orderData.address?.postalCode) {
        throw new Error('Delivery address is required');
      }
      
      if (!orderData.delivery?.method || !orderData.payment?.method) {
        throw new Error('Delivery and payment methods are required');
      }
      
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }

      const order = await orderService.createOrder(orderData);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }, {
    body: t.Object({
      contact: t.Object({
        fullName: t.String(),
        email: t.String(),
        phone: t.String()
      }),
      address: t.Object({
        streetAddress: t.String(),
        city: t.String(),
        postalCode: t.String(),
        country: t.String()
      }),
      delivery: t.Object({
        method: t.String(),
        cost: t.Number()
      }),
      payment: t.Object({
        method: t.String()
      }),
      items: t.Array(t.Object({
        id: t.Number(),
        name: t.String(),
        price: t.Number(),
        quantity: t.Number(),
        size: t.Optional(t.String())
      })),
      subtotal: t.Number(),
      deliveryCost: t.Number(),
      total: t.Number()
    })
  })
  .get('/:id', async ({ params, orderService }) => {
    try {
      const orderId = parseInt(params.id);
      
      if (isNaN(orderId)) {
        throw new Error('Invalid order ID');
      }
      
      const order = await orderService.getOrderById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  });