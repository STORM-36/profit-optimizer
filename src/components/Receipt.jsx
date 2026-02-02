import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Receipt = ({ order }) => {
    const handlePrint = () => {
        const printContent = document.getElementById('receipt');
        const win = window.open('', '_blank');
        win.document.write('<html><head><title>Print Receipt</title>');
        win.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
        win.document.write('</head><body>');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };

    const handleDownloadPDF = async () => {
        const receiptElement = document.getElementById('receipt');
        const buttonsElement = document.getElementById('receipt-buttons');
        
        try {
            // Hide buttons before capture
            if (buttonsElement) {
                buttonsElement.style.display = 'none';
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            // Clone the element to measure its true size
            const clonedElement = receiptElement.cloneNode(true);
            clonedElement.style.position = 'fixed';
            clonedElement.style.left = '-10000px';
            clonedElement.style.top = '-10000px';
            clonedElement.style.width = receiptElement.offsetWidth + 'px';
            document.body.appendChild(clonedElement);

            // Wait for cloned element to render
            await new Promise(resolve => setTimeout(resolve, 200));

            // Capture the cloned element
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true
            });

            // Remove cloned element
            document.body.removeChild(clonedElement);

            // Show buttons again
            if (buttonsElement) {
                buttonsElement.style.display = 'flex';
            }

            // Create PDF with proper dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            let imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            let heightLeft = imgHeight;
            let position = 0;

            // Add image, fit to multiple pages if needed
            const imgData = canvas.toDataURL('image/png');
            
            while (heightLeft > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                position -= pageHeight;
                
                if (heightLeft > 0) {
                    pdf.addPage();
                }
            }
            
            pdf.save(`receipt-${order.id || 'download'}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF: ' + error.message);
            
            // Make sure buttons are visible again
            const buttonsElement = document.getElementById('receipt-buttons');
            if (buttonsElement) {
                buttonsElement.style.display = 'flex';
            }
        }
    };

    return (
        <div id="receipt" className="w-80 p-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <h1 className="text-center font-bold text-2xl mb-4 text-gray-800">📄 Receipt</h1>
            
            <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="font-semibold text-gray-700">Customer: <span className="font-normal">{order.customerName}</span></p>
                <p className="text-sm text-gray-600">Phone: {order.phone}</p>
                <p className="text-sm text-gray-600">Address: {order.address}</p>
            </div>
            
            <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-500 uppercase mb-2">Order Details:</p>
                {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.price.toFixed(2)} Tk</span>
                    </div>
                ))}
            </div>
            
            <div className="mb-4 space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-semibold">{order.sellingPrice?.toFixed(2) || order.totalPrice?.toFixed(2)} Tk</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Cost:</span>
                    <span className="font-semibold">{order.deliveryCost} Tk</span>
                </div>
                {order.netProfit !== undefined && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-bold text-gray-700">Net Profit:</span>
                        <span className={`font-bold ${order.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {order.netProfit.toFixed(2)} Tk
                        </span>
                    </div>
                )}
            </div>
            
            <p className="text-xs text-gray-500 mb-4">Date: {order.date}</p>
            
            <div id="receipt-buttons" className="flex gap-2 mt-6">
                <button onClick={handlePrint} className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-semibold text-sm">
                    🖨️ Print
                </button>
                <button onClick={handleDownloadPDF} className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 font-semibold text-sm">
                    📥 Download PDF
                </button>
            </div>
        </div>
    );
};

export default Receipt;
