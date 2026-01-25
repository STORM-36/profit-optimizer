// src/utils/parser.js

export const parseText = (text) => {
    if (!text) return { name: '', phone: '', address: '' };
  
    // 1. EXTRACT PHONE (The Anchor)
    const phoneMatch = text.match(/(?:\+88)?01[3-9]\d{8}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
  
    // 2. STRATEGY A: LOOK FOR LABELS (The Fix for Kamal/Zentexx)
    // We look for "Name: Something" or "Customer: Something"
    const nameLabelRegex = /(?:Name|Customer|Receiver|Nam)[:\s-]*([^\n,]+)/i;
    let nameMatch = text.match(nameLabelRegex);
    let name = nameMatch ? nameMatch[1].trim() : '';
  
    // 3. CLEANUP FOR ADDRESS
    // Remove the phone number
    let cleanText = text.replace(phone, '');
    
    // Remove "(who will receive...)" and other brackets
    cleanText = cleanText.replace(/\(.*?\)/g, '');
  
    // If we found a name via label, remove that specific line from the text
    if (name) {
      // Create a regex to find the name we found and remove it
      const nameRemover = new RegExp(`(?:Name|Customer|Receiver|Nam)?[:\\s-]*${name}`, 'i');
      cleanText = cleanText.replace(nameRemover, '');
    }
  
    // Remove leftover labels
    cleanText = cleanText
      .replace(/(Name|Customer|Receiver|Phone|Address|Mobile)[:\s-]*/gi, '')
      .trim();
  
    // Split into lines for analysis
    const lines = cleanText.split(/[\n,]+/).map(l => l.trim()).filter(l => l.length > 0);
  
    // 4. STRATEGY B: THE GUESSING GAME (Fallback)
    // Only run this if we didn't find a name via label
    let address = '';
  
    if (!name) {
      const addressKeywords = [
        "road", "house", "holding", "block", "sector", "lane", "flat", 
        "dhaka", "chittagong", "sylhet", "narayanganj", "chashara", "comilla", 
        "banani", "mirpur", "uttara", "gulshan", "badda", "gate", "temple" // Added "Gate" & "Temple"
      ];
  
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Is this line an address?
        const isAddress = addressKeywords.some(keyword => lowerLine.includes(keyword));
        const hasNumbers = /\d/.test(line);
  
        // If it's short, has no numbers, and NO address keywords -> It's the Name
        if (!isAddress && line.length < 25 && !hasNumbers) {
          name = line;
          // The rest is address
          address = lines.filter((_, index) => index !== i).join(', ');
          break; 
        }
      }
    }
  
    // If we still don't have an address (because we found name via label), 
    // assume everything left in cleanText is the address.
    if (!address) {
       address = lines.join(', ');
    }
  
    return {
      name: name.substring(0, 30), // Safety cap
      phone: phone,
      address: address.substring(0, 120) // Safety cap
    };
  };