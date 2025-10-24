import bcrypt from 'bcryptjs';

export const users = [
  {
    id: 1,
    email: "admin@yoruwear.com",
    name: "Admin User",
    passwordHash: await bcrypt.hash("admin123", 10),
    fullName: "YoruWear Administrator",
    phone: "+31-71-518-8888",
    streetAddress: "Zernikedreef 11",
    city: "Leiden",
    postalCode: "2333 CK",
    country: "Netherlands",
    isFirstPurchase: false,
    isAdmin: true
  },
  {
    id: 2,
    email: "user@example.com",
    name: "John Doe",
    passwordHash: await bcrypt.hash("user123", 10),
    fullName: "John Doe",
    phone: "+31-20-987-6543",
    streetAddress: "Example Street 123",
    city: "Amsterdam",
    postalCode: "1001 AA",
    country: "Netherlands",
    isFirstPurchase: true,
    isAdmin: false
  }
];

// Helper function to get users with hashed passwords
export async function getUsersData() {
  return [
    {
      id: 1,
      email: "admin@yoruwear.com",
      name: "Admin User",
      passwordHash: await bcrypt.hash("admin123", 10),
      fullName: "YoruWear Administrator",
      phone: "+31-71-518-8888",
      streetAddress: "Zernikedreef 11",
      city: "Leiden",
      postalCode: "2333 CK",
      country: "Netherlands",
      isFirstPurchase: false,
      isAdmin: true
    },
    {
      id: 2,
      email: "user@example.com",
      name: "John Doe",
      passwordHash: await bcrypt.hash("user123", 10),
      fullName: "John Doe",
      phone: "+31-20-987-6543",
      streetAddress: "Example Street 123",
      city: "Amsterdam",
      postalCode: "1001 AA",
      country: "Netherlands",
      isFirstPurchase: true,
      isAdmin: false
    }
  ];
}