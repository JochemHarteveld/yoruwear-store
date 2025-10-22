# YoruWear Product Images Setup

## Directory Structure
```
client/public/assets/products/
├── led-tshirts/
│   ├── 1-pulse-wave-led-tee.jpg
│   ├── 2-bass-drop-reactive-shirt.jpg
│   ├── 3-spectrum-analyser-tee.jpg
│   ├── 4-heartbeat-sync-shirt.jpg
│   ├── 5-galaxy-swirl-led-tee.jpg
│   ├── 18-frequency-rider-tee.jpg
│   ├── 19-rave-guardian-armor-tee.jpg
│   └── 29-voltage-drop-tank-top.jpg
├── hoodies-sweaters/
│   ├── 6-beat-thunder-hoodie.jpg
│   ├── 7-neural-network-hoodie.jpg
│   ├── 8-flame-reactive-sweater.jpg
│   ├── 20-melody-vine-hoodie.jpg
│   ├── 21-crystal-matrix-sweater.jpg
│   └── 30-phoenix-rising-jacket.jpg
├── bottoms/
│   ├── 9-prism-light-cargo-pants.jpg
│   ├── 10-cyber-glow-shorts.jpg
│   ├── 11-neon-dreams-skirt.jpg
│   ├── 22-tempo-track-pants.jpg
│   └── 23-binary-beat-leggings.jpg
├── accessories/
│   ├── 12-rhythm-pulse-bucket-hat.jpg
│   ├── 13-bass-reactive-gloves.jpg
│   ├── 14-sound-wave-bandana.jpg
│   ├── 15-infinity-loop-wristband.jpg
│   ├── 24-particle-storm-cape.jpg
│   ├── 25-synth-wave-visor.jpg
│   └── 26-echo-chamber-scarf.jpg
└── festival-sets/
    ├── 16-festival-king-complete-set.jpg
    ├── 17-electric-dreams-outfit.jpg
    ├── 27-quantum-dancer-set.jpg
    └── 28-aurora-festival-package.jpg
```

## Image Requirements

### Technical Specifications
- **Format**: JPG or PNG (JPG recommended for smaller file sizes)
- **Resolution**: 800x800px minimum (square format)
- **Max file size**: 500KB per image
- **Quality**: 85-90% compression for optimal balance

### Visual Requirements
- **Square aspect ratio** (1:1) for consistent grid display
- **Dark/night aesthetic** matching YoruWear brand
- **LED lighting visible** in the photos
- **Festival/rave atmosphere** in backgrounds
- **Professional product photography** style

## AI Image Generation Prompts

Use the prompts from yoruwear-products.json to generate images with:
- Midjourney
- DALL-E 3
- Stable Diffusion
- Adobe Firefly

### Example Prompt Usage:
```
"A sleek black T-shirt with vibrant blue and purple LED wave patterns flowing across the chest, worn by a person at a night festival with neon lights in the background, music visualization style, dark atmospheric lighting, high-tech aesthetic, square format, 800x800px"
```

## Implementation Steps

1. **Create Directory Structure**
   ```bash
   mkdir -p client/public/assets/products/{led-tshirts,hoodies-sweaters,bottoms,accessories,festival-sets}
   ```

2. **Generate/Source Images**
   - Use AI generation with provided prompts
   - Commission photography if budget allows
   - Source stock photos with LED/festival themes

3. **Optimize Images**
   - Resize to 800x800px
   - Compress to 85-90% quality
   - Ensure consistent naming convention

4. **Update Angular Configuration**
   - Images in `public/assets/` are automatically served
   - Access via `/assets/products/category/image-name.jpg`

## Code Integration

The application currently uses placeholder icons. To integrate real images:

### Update Product Model (Optional - Add Image Field)
```typescript
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: number;
  imageUrl?: string; // Optional field
  createdAt: string;
  updatedAt: string;
}
```

### Update Component Templates
Replace placeholder divs with:
```html
<div class="product-image">
  <img 
    [src]="getProductImageUrl(product)" 
    [alt]="product.name"
    (error)="onImageError($event)"
    loading="lazy"
  />
</div>
```

### Add Helper Method
```typescript
getProductImageUrl(product: Product): string {
  const categoryMap = {
    1: 'led-tshirts',
    2: 'hoodies-sweaters', 
    3: 'bottoms',
    4: 'accessories',
    5: 'festival-sets'
  };
  
  const category = categoryMap[product.categoryId] || 'led-tshirts';
  const slug = product.name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  return `/assets/products/${category}/${product.id}-${slug}.jpg`;
}

onImageError(event: any): void {
  // Fallback to placeholder icon
  event.target.style.display = 'none';
  // Show placeholder icon instead
}
```

## Next Steps

1. **Create the directory structure** as outlined above
2. **Generate/source the 30 product images** using the AI prompts
3. **Place images** in the correct directories with proper naming
4. **Update the Angular components** to use real images
5. **Test the application** to ensure images load correctly

The current placeholder system will continue working until you're ready to implement real images, so you can work on this incrementally!