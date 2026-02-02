// src/utils/sampleData.js

// 👇 The word "export" is crucial here!
export const SAMPLE_DATA = [
    {
      text: "Sharmin shaba\nHolding 36, block D Adarsha Chashara chanmari, Narayanganj\n01749336026\n( who will receive the parcel only)",
      sell: 1200, cost: 600
    },
    {
      text: "House # 76, Road #11, Block E, Banani, Dhaka 1213.\nName: Daraz Admin\n01711000000",
      sell: 5000, cost: 4200
    },
    {
      text: "546, Jahangir Gate, Bir Shrestha Shaheed Jahangir Gate, Dhaka 1206.\nCustomer: Kamal\n01999888777",
      sell: 850, cost: 400
    },
    {
      text: "97, Buddhist Temple Road, Nandonkanon, Chattogram 4000.\nName: Zentexx Design\n01812345678",
      sell: 1500, cost: 900
    }
];

const sampleOrder = {
    customerName: 'John Doe',
    items: [
        { name: 'Item 1', price: 5.99 },
        { name: 'Item 2', price: 3.49 },
        { name: 'Item 3', price: 2.99 },
    ],
    totalPrice: 12.47,
    date: '2026-02-02',
};

export default sampleOrder;