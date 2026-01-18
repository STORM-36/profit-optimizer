// --- PARSER V3.0: THE ELIMINATOR ---

// 1. PHONE (Unchanged, it works well)
export const findPhone = (text) => {
  const cleanText = text.replace(/[- ]/g, ""); 
  const phoneRegex = /(?:\+88|88)?(01[3-9]\d{8})/;
  const match = cleanText.match(phoneRegex);
  return match ? match[1] : "";
};

// 2. location src/utils/parser.js (Partial Update)

export const detectLocation = (text) => {
  const lowerText = text.toLowerCase();
  
  // EXPANDED KEYWORD LIST (Based on your Dataset)
  const insideDhaka = [
    // Standard Areas
    "dhaka", "dhanmondi", "mirpur", "uttara", "banani", "gulshan", "bashundhara", 
    "mohammadpur", "badda", "rampura", "farmgate", "motijheel", "lalmatia",
    
    // NEW from Dataset [cite: 6, 8, 9]
    "dilkusha",       // From Singer Bangladesh
    "mohakhali",      // From Square Toiletries
    "tejgaon",        // From ACI Ltd & Kohinoor
    "baridhara",      // From Bashundhara Group
    "aftabnagar",     // From East West Media
    "nikunja",        // From VPS.com.bd
    "shantinagar", "malibagh", "maghbazar", "khilgaon" // Common neighbors
  ];
  
  const isInsideDhaka = insideDhaka.some(area => lowerText.includes(area));

  // Logic: If it matches a keyword OR has a Dhaka Postal Code (1000-1399) [cite: 4]
  // We add Regex for Postal Code to be even smarter.
  const dhakaPostalRegex = /1[0-3]\d\d/; // Matches 1000 to 1399
  const hasDhakaPostal = dhakaPostalRegex.test(text);

  if (isInsideDhaka || hasDhakaPostal) {
    return { city: "Dhaka", charge: 60 };
  } else {
    return { city: "Outside Dhaka", charge: 120 }; 
  }
};

// 3. NAME (The New "Elimination" Logic)
export const findName = (text) => {
  // Strategy A: Explicit Label (Best Case)
  // Looks for "Name: Rafiq" or "Nam: Rafiq"
  const explicitRegex = /(?:name|nam|customer|bhai)[\s:.-]+([a-zA-Z\s]+)/i;
  const match = text.match(explicitRegex);
  if (match) return match[1].trim();

  // Strategy B: The "Elimination" Method (Fallback)
  // If there is no "Name:" label, we look for a line that is NOT a number and NOT a city.
  
  // 1. Break text into chunks (by comma or new line)
  const chunks = text.split(/,|\n/);

  for (let chunk of chunks) {
    let cleanChunk = chunk.trim();
    
    // Skip empty lines
    if (cleanChunk.length < 2) continue;

    // Skip if it contains digits (likely phone or house number)
    if (/\d/.test(cleanChunk)) continue;

    // Skip if it contains "Dhaka" or location keywords (likely address)
    // We reuse the list from detectLocation logic concepts
    const locationKeywords = ["dhaka", "road", "house", "sector", "banani", "mirpur", "bonani", "bunani"];
    if (locationKeywords.some(kw => cleanChunk.toLowerCase().includes(kw))) continue;

    // Skip common filler words
    if (["send", "to", "plz", "please", "urgent"].includes(cleanChunk.toLowerCase())) continue;

    // If it survived all those checks, IT IS LIKELY THE NAME
    return cleanChunk; 
  }

  return ""; // If nothing matches
};