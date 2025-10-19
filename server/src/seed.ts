import { db } from './db';
import { categories, products, users, orders, orderItems } from './db/schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(users);
    await db.delete(categories);

    // Insert categories
    console.log('📁 Seeding categories...');
    await db.insert(categories).values([
      { name: 'T-Shirts', description: 'Comfortable cotton t-shirts' },
      { name: 'Hoodies', description: 'Warm and cozy hoodies' },
      { name: 'Jeans', description: 'Classic denim jeans' },
      { name: 'Accessories', description: 'Bags, hats, and more' },
    ]);

    // Get the inserted categories to reference their IDs
    const insertedCategories = await db.select().from(categories);
    const tshirtCat = insertedCategories.find(c => c.name === 'T-Shirts')!;
    const hoodieCat = insertedCategories.find(c => c.name === 'Hoodies')!;
    const jeansCat = insertedCategories.find(c => c.name === 'Jeans')!;
    const accessoriesCat = insertedCategories.find(c => c.name === 'Accessories')!;

    // Insert users
    console.log('👥 Seeding users...');
    await db.insert(users).values([
      { email: 'john@example.com', name: 'John Doe' },
      { email: 'jane@example.com', name: 'Jane Smith' },
      { email: 'bob@example.com', name: 'Bob Johnson' },
    ]);

    // Insert products
    console.log('🛍️ Seeding products...');
    await db.insert(products).values([
      {
        name: 'Classic White T-Shirt',
        description: 'A timeless white cotton t-shirt',
        price: '19.99',
        stock: 100,
        categoryId: BigInt(tshirtCat.id),
      },
      {
        name: 'Black Hoodie',
        description: 'Comfortable black hoodie with front pocket',
        price: '49.99',
        stock: 50,
        categoryId: BigInt(hoodieCat.id),
      },
      {
        name: 'Blue Denim Jeans',
        description: 'Classic blue jeans with straight cut',
        price: '79.99',
        stock: 75,
        categoryId: BigInt(jeansCat.id),
      },
      {
        name: 'Canvas Tote Bag',
        description: 'Eco-friendly canvas tote bag',
        price: '15.99',
        stock: 30,
        categoryId: BigInt(accessoriesCat.id),
      },
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();