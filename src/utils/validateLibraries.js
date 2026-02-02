// Test file to validate third-party libraries work correctly
// Run this to ensure html2canvas and jspdf don't break your app

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

console.log('✅ html2canvas imported successfully:', typeof html2canvas);
console.log('✅ jsPDF imported successfully:', typeof jsPDF);

// Test 1: Verify html2canvas can capture elements
async function testHtml2Canvas() {
  try {
    const element = document.createElement('div');
    element.textContent = 'Test Receipt';
    element.style.padding = '20px';
    
    const canvas = await html2canvas(element);
    console.log('✅ html2canvas works! Canvas size:', canvas.width, 'x', canvas.height);
    return true;
  } catch (error) {
    console.error('❌ html2canvas FAILED:', error.message);
    return false;
  }
}

// Test 2: Verify jsPDF can create PDFs
function testJsPDF() {
  try {
    const pdf = new jsPDF();
    pdf.text('Test PDF', 10, 10);
    console.log('✅ jsPDF works! PDF created');
    return true;
  } catch (error) {
    console.error('❌ jsPDF FAILED:', error.message);
    return false;
  }
}

// Run tests when app loads
export async function validateThirdPartyLibraries() {
  console.log('🔍 Validating third-party libraries...');
  
  const html2canvasOK = await testHtml2Canvas();
  const jsPdfOK = testJsPDF();
  
  if (html2canvasOK && jsPdfOK) {
    console.log('✅ ALL TESTS PASSED - Libraries work correctly!');
    return true;
  } else {
    console.error('❌ TESTS FAILED - Some libraries are broken!');
    return false;
  }
}
