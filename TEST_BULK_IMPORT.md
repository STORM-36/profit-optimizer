# ✅ Bulk Import Feature - TEST GUIDE

## 📦 **Function Created: `parseMultipleProductsWithAI`**

Location: `src/services/aiService.js`

---

## **What It Does:**

Extracts **multiple products** from a single long supplier message.

**Example Input:**
```
Assalamualaikum bhai! Aaj amader stock eshese.
1. Lal shirt - 50 pcs - 500tk each
2. Nil jeans - 30 ta - 800 taka
3. Kalo jacket size L - 20 guti - 1200tk
Ready for delivery tomorrow!
```

**Example Output:**
```json
[
  {
    "name": "Red Shirt",
    "price": 500,
    "quantity": 50,
    "color": "Red",
    "category": "Clothing"
  },
  {
    "name": "Blue Jeans",
    "price": 800,
    "quantity": 30,
    "color": "Blue",
    "category": "Clothing"
  },
  {
    "name": "Black Jacket",
    "price": 1200,
    "quantity": 20,
    "color": "Black",
    "category": "Clothing"
  }
]
```

---

## **Key Features:**

✅ **Uses `gemini-1.5-flash-latest`** (with auto-discovery fallback)  
✅ **Returns JSON Array `[]`** (not single object)  
✅ **Handles 2-20 products** in one message  
✅ **Smart array extraction** (finds `[` and `]` even if AI adds extra text)  
✅ **Console logging** with `📦 Found X products`  
✅ **Error handling** returns empty array `[]` on failure  
✅ **Text limit: 2000 chars** (more than single product function)  

---

## **How to Use in Your App:**

```javascript
import { parseMultipleProductsWithAI } from './services/aiService';

// In your component:
const handleBulkImport = async () => {
  const supplierMessage = `
    New stock arrived:
    1. Red T-shirt - 100 pcs - 250tk
    2. Blue Jeans - 50 pcs - 600tk
    3. Black Shoes - 30 pairs - 1200tk
  `;
  
  const products = await parseMultipleProductsWithAI(supplierMessage);
  
  if (products.length > 0) {
    console.log(`✅ Found ${products.length} products!`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.quantity} pcs @ ${product.price}tk`);
    });
    
    // Save all products to database
    products.forEach(async (product) => {
      await addDoc(collection(db, "inventory"), {
        ...product,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });
    });
    
    alert(`✅ Successfully imported ${products.length} products!`);
  } else {
    alert("⚠️ No products found in the message.");
  }
};
```

---

## **Testing in Browser Console:**

Open F12 and paste:

```javascript
import { parseMultipleProductsWithAI } from './services/aiService';

const testMessage = `
  Hello! Here's today's inventory:
  - Red shirts: 50 pieces at 500tk
  - Blue jeans: 30 items for 800 taka each
  - Black jackets: 20 pcs, price 1200tk
`;

const result = await parseMultipleProductsWithAI(testMessage);
console.log("Result:", result);
console.log("Count:", result.length);
```

Expected console output:
```
📦 Bulk Import Service Called with input: Hello! Here's today's...
🔎 Checking available Gemini models for bulk import...
⚙️ Initializing Gemini model for bulk import: gemini-1.5-flash-latest...
📤 Sending bulk import request to Gemini API...
📥 Bulk import response received: [Object]
📝 Response text: [{"name":"Red Shirt",...}]
🧹 Cleaned text: [{"name":"Red Shirt",...}]
✅ Successfully parsed 3 products: (3) [{…}, {…}, {…}]
```

---

## **Error Handling:**

### **Invalid JSON from AI:**
```javascript
// AI returns: "I found 3 products: red shirt, blue jeans, black jacket"
// Result: [] (empty array)
// Alert: "⚠️ AI returned invalid format for bulk import."
```

### **No products found:**
```javascript
// Input: "Hello, how are you? When will stock arrive?"
// AI returns: []
// Result: []
// Console: "✅ Successfully parsed 0 products: []"
```

### **Single product (should still work):**
```javascript
// Input: "Red shirt 50 pcs 500tk"
// AI returns: [{"name":"Red Shirt", "price":500, "quantity":50, ...}]
// Result: Array with 1 item
```

---

## **Comparison: Single vs Bulk**

| Feature | `parseProductWithAI` | `parseMultipleProductsWithAI` |
|---------|---------------------|-------------------------------|
| **Input** | "Red shirt 500tk" | "Red shirt 500tk, Blue jeans 800tk" |
| **Output** | Single Object `{}` | Array of Objects `[{}, {}]` |
| **Max Length** | 800 chars | 2000 chars |
| **Use Case** | Quick single entry | Bulk supplier orders |
| **Error Return** | `null` | `[]` (empty array) |
| **Console Log** | 🚀 AI Service Called | 📦 Bulk Import Service Called |

---

## **Next Steps:**

1. ✅ Function created and exported
2. ⏳ Create UI component (BulkImportForm.jsx)
3. ⏳ Add to AddInventory page as new tab
4. ⏳ Test with real supplier messages
5. ⏳ Add batch save to Firebase

---

## **Advanced Features (Future):**

- [ ] CSV upload support
- [ ] Excel file parsing
- [ ] Progress bar for batch saving
- [ ] Duplicate detection
- [ ] Preview table before import
- [ ] Edit individual products before saving

---

**Status:** ✅ Ready for integration into UI components!
