const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Order = require('../model/orderModel');

const generateInvoice = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate("userId", "fullName email")       
      .populate("courses", "title price");
    
    const invoiceDir = path.join(__dirname,  '../public/invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const filePath = path.join(invoiceDir, `invoice_${orderId}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fillColor('#f97316')
      .fontSize(28)
      .text('Codemy', 50, 45)
      .fontSize(12)
      .text('Where Coding Meets Excellence', 50, 75)
      .moveDown();

    // Invoice details
    doc.fontSize(16)
      .fillColor('#f97316')
      .text('INVOICE', 50, 130)
      .fontSize(10)
      .fillColor('#444444')
      .text(`Invoice Number: ${orderId}`, 50, 150)
      .text(`Date: ${order?.timestamps?.createdAt ? new Date(order.timestamps.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 50, 165);

    // Customer info
    doc.fontSize(14)
      .text('Bill To:', 50, 205)
      .fontSize(10)
      .text(order?.userId?.fullName || 'N/A', 50, 225)
      .text(order?.userId?.email || 'N/A', 50, 240);

    // Courses table
    const tableTop = 290;
    doc.font('Helvetica-Bold');
    generateTableRow(doc, tableTop, 'Course Title', 'Price');
    
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    doc.font('Helvetica');

    let position = tableTop;
    if (order?.courses?.length) {
      order.courses.forEach((course, i) => {
        position = tableTop + (i + 1) * 30;
        generateTableRow(doc, position, course.title || 'N/A', `₹${(course.price || 0)}`);
      });
    }

    // Totals
    const subtotalPosition = position + 40;
    generateTotalRow(doc, subtotalPosition, 'Subtotal', order?.totalAmount / 100 || 0);

    const discountAmount = order?.discount?.discountAmount || 0;
    if (discountAmount > 0) {
      generateTotalRow(
        doc, 
        subtotalPosition + 20, 
        `Discount (${order?.discount?.couponCode || 'N/A'})`,
        -(discountAmount / 100)
      );
    }

    const total = (order?.totalAmount / 100 || 0) - (discountAmount / 100);
    doc.font('Helvetica-Bold');
    generateTotalRow(doc, subtotalPosition + 40, 'Total', total);

    // Payment details
    doc.font('Helvetica')
      .fillColor('#f97316')
      .text('Payment Details', 50, subtotalPosition + 70)
      .fillColor('#444444')
      .fontSize(10)
      .text(`Method: ${order?.payment?.paymentMethod || 'N/A'}`, 50, subtotalPosition + 85)
      .text(`Status: ${order?.payment?.status || 'N/A'}`, 50, subtotalPosition + 100)
      .text(`Payment ID: ${order?.payment?.paymentId || 'N/A'}`, 50, subtotalPosition + 115);

    // Footer
    doc.fontSize(10)
      .text(
        'Thank you for choosing Codemy!',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
      doc.end();
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

function generateTableRow(doc, y, item, price) {
    doc.fontSize(10)
      .text(item, 50, y)
      .text(price.replace('₹', 'Rs.'), 400, y, { align: 'right' });
  }
  
  function generateTotalRow(doc, y, label, amount) {
    doc.fontSize(10)
      .text(label, 300, y)
      .text(`Rs. ${Math.abs(amount).toFixed(2)}`, 400, y, { align: 'right' });
  }
module.exports = { generateInvoice };