#!/usr/bin/env bun
import mysql from 'mysql2/promise';
import { config } from './src/config';

async function migrateToYoruWear() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('🎵 Starting YoruWear product migration...');
    
    connection = await mysql.createConnection(config.database.url);
    console.log('✅ Database connection established');

    // Start transaction for safe migration
    await connection.beginTransaction();
    console.log('🔄 Transaction started');

    // Clear existing data
    console.log('🗑️ Clearing existing products and categories...');
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM orders');
    await connection.execute('DELETE FROM products');
    await connection.execute('DELETE FROM categories');
    console.log('✅ Existing data cleared');

    // Reset auto-increment counters
    await connection.execute('ALTER TABLE categories AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE products AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE orders AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE order_items AUTO_INCREMENT = 1');

    // Insert YoruWear categories
    console.log('📝 Inserting YoruWear categories...');
    await connection.execute(`
      INSERT INTO categories (name, description) VALUES
      ('LED T-Shirts', 'Interactive T-shirts with LED patterns that react to music and sound'),
      ('Hoodies & Sweaters', 'Comfortable hoodies with integrated LED systems for festival nights'),
      ('Bottoms', 'LED-enhanced pants, shorts, and skirts for the complete festival look'),
      ('Accessories', 'LED accessories including hats, gloves, and wearable tech'),
      ('Festival Sets', 'Complete outfit sets with synchronized LED patterns')
    `);

    // Insert YoruWear products
    console.log('🎵 Inserting YoruWear LED festival products...');
    await connection.execute(`
      INSERT INTO products (name, description, price, stock, category_id) VALUES
      -- LED T-Shirts
      ('Pulse Wave LED Tee', 'Classic festival T-shirt with reactive LED wave patterns that follow the bassline. Equipped with sound-reactive microcontroller and washable LED strips.', 89.99, 45, 1),
      ('Bass Drop Reactive Shirt', 'Premium cotton tee with central LED panel that explodes with color on every bass drop. Features customizable patterns via YoruWear app.', 94.99, 32, 1),
      ('Spectrum Analyser Tee', 'Advanced LED tee displaying real-time audio spectrum across the chest. Perfect for DJs and music enthusiasts.', 99.99, 28, 1),
      ('Heartbeat Sync Shirt', 'Unique LED shirt that syncs with your heartbeat and the music\\'s BPM. Creates mesmerizing dual-rhythm light shows.', 109.99, 22, 1),
      ('Galaxy Swirl LED Tee', 'Cosmic-inspired T-shirt with swirling LED patterns that react to high frequencies. Features starfield animations during quiet moments.', 87.99, 38, 1),
      ('Frequency Rider Tee', 'Advanced tee with dual-zone LEDs - chest responds to mids/highs, back responds to bass frequencies.', 119.99, 24, 1),
      ('Rave Guardian Armor Tee', 'Futuristic T-shirt with armor-like LED panels that activate sequentially with music builds. Military-inspired design.', 104.99, 19, 1),
      ('Voltage Drop Tank Top', 'High-energy tank top with voltage-meter LED display that reacts to music intensity. Perfect for hot festival days.', 69.99, 50, 1),

      -- Hoodies & Sweaters
      ('Beat Thunder Hoodie', 'Comfortable festival hoodie with LED lightning patterns on sleeves and hood. Weather-resistant design for outdoor events.', 149.99, 25, 2),
      ('Neural Network Hoodie', 'Tech-inspired hoodie with interconnected LED nodes that light up in response to sound complexity. Features minimalist design.', 159.99, 18, 2),
      ('Flame Reactive Sweater', 'Cozy sweater with flame-pattern LEDs that intensify with music volume. Perfect for chilly festival nights.', 134.99, 30, 2),
      ('Melody Vine Hoodie', 'Organic-inspired hoodie with vine-like LED patterns that grow and flow with melodic elements in music.', 144.99, 21, 2),
      ('Crystal Matrix Sweater', 'Geometric sweater with crystalline LED formations that shatter and reform with tempo changes.', 139.99, 16, 2),
      ('Phoenix Rising Jacket', 'Statement jacket with phoenix-wing LED patterns on the back that spread and glow with music crescendos.', 229.99, 7, 2),

      -- Bottoms
      ('Prism Light Cargo Pants', 'Tactical-style cargo pants with LED strips running down the sides. Multiple pockets for festival essentials.', 179.99, 20, 3),
      ('Cyber Glow Shorts', 'Breathable festival shorts with reactive LED hem and side panels. Ideal for summer festivals and dancing.', 79.99, 42, 3),
      ('Neon Dreams Skirt', 'Flowing A-line skirt with cascading LED patterns. Creates beautiful light trails while dancing.', 124.99, 15, 3),
      ('Tempo Track Pants', 'Sleek track pants with LED racing stripes that speed up and slow down with song tempo.', 159.99, 28, 3),
      ('Binary Beat Leggings', 'Futuristic leggings with binary code LED patterns that translate music data into visual code.', 89.99, 35, 3),

      -- Accessories
      ('Rhythm Pulse Bucket Hat', 'Classic festival bucket hat with LED brim that pulses to the music. Includes built-in speakers for personal audio.', 69.99, 55, 4),
      ('Bass Reactive Gloves', 'LED gloves that light up fingers individually based on music frequency bands. Perfect for light shows and dancing.', 54.99, 65, 4),
      ('Sound Wave Bandana', 'Stylish bandana with embedded LEDs that visualize sound waves. Lightweight and comfortable for all-day wear.', 39.99, 80, 4),
      ('Infinity Loop Wristband', 'Smart LED wristband with infinite loop animations that sync with nearby YoruWear products for group effects.', 44.99, 70, 4),
      ('Particle Storm Cape', 'Dramatic festival cape with particle effect LEDs that swirl and dance with wind and music.', 199.99, 10, 4),
      ('Synth Wave Visor', 'Retro-futuristic LED visor with synthwave-inspired patterns and built-in audio visualization.', 74.99, 40, 4),
      ('Echo Chamber Scarf', 'Lightweight scarf with echo-effect LEDs that create trailing light patterns as you move.', 64.99, 45, 4),

      -- Festival Sets
      ('Festival King Complete Set', 'Premium set including LED tee, reactive shorts, and pulse hat. All items sync together for ultimate festival experience.', 299.99, 8, 5),
      ('Electric Dreams Outfit', 'Coordinated set of hoodie and pants with complementary LED patterns. Features cloud-to-lightning animation themes.', 279.99, 12, 5),
      ('Quantum Dancer Set', 'Professional dancer outfit with full-body LED integration. Includes top, bottoms, and motion-sensitive accessories.', 399.99, 5, 5),
      ('Aurora Festival Package', 'Complete festival experience with Aurora-themed LED patterns across tee, shorts, and accessories.', 249.99, 14, 5)
    `);

    // Commit the transaction
    await connection.commit();
    console.log('✅ Transaction committed successfully');

    console.log('🎉 YoruWear product migration completed successfully!');
    console.log('📊 Migration Summary:');
    console.log('   • 5 Festival categories created');
    console.log('   • 30 LED-integrated products added');
    console.log('   • Price range: €39.99 - €399.99');
    console.log('   • All products feature music-reactive LED technology');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    if (connection) {
      await connection.rollback();
      console.log('🔄 Transaction rolled back');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
migrateToYoruWear().catch(console.error);