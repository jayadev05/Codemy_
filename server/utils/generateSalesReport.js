const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../model/orderModel');

const generateSalesReport = async (startDate, endDate) => {
  try {
    const reportsDir = path.join(__dirname, '../public/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `sales_report_${startDate}_to_${endDate}.pdf`);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(reportPath);
    doc.pipe(stream);

    const orders = await Order.find({
      'timestamps.createdAt': {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('userId')
      .populate('courses');

    const metrics = orders.reduce(
      (acc, order) => {
        acc.totalSales++;
        acc.totalRevenue += order.totalAmount;
        acc.totalDiscount += order.discount?.discountAmount || 0;
        acc.paymentMethods[order.payment.paymentMethod] =
          (acc.paymentMethods[order.payment.paymentMethod] || 0) + 1;
        return acc;
      },
      {
        totalSales: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        paymentMethods: {},
      }
    );

    // Modern UI Design
    const colors = {
      primary: '#FF6B35',
      text: '#333333',
      lightGray: '#F4F4F4',
      border: '#E2E8F0',
    };

    // Function to ensure content fits on page
    const ensureSpace = (neededSpace) => {
      if (doc.y + neededSpace > doc.page.height - 70) { // Increased bottom margin for footer
        doc.addPage();
        // Add header to new page
        doc
          .fontSize(12)
          .fillColor('#666666')
          .text('Codemy Sales Report - Continued', { align: 'center' });
        doc.moveDown();
      }
    };

    // Header with modern styling
    doc
      .font('Helvetica-Bold')
      .fontSize(32)
      .fillColor(colors.primary)
      .text('Codemy', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Subtitle with period
    doc
      .fontSize(14)
      .fillColor(colors.text)
      .text('Sales Analytics Report', { align: 'center' });
    
    doc
      .fontSize(12)
      .fillColor('#666666')
      .text(`${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, {
        align: 'center',
      });

    doc.moveDown(2);

    // Modern metrics cards layout
    const cardWidth = 250;
    const cardHeight = 80;
    const cardSpacing = 20;
    let currentX = 50;
    let currentY = doc.y;

    // Function to draw a metric card
    const drawMetricCard = (title, value, x, y) => {
      doc
        .roundedRect(x, y, cardWidth, cardHeight, 8)
        .fillAndStroke(colors.lightGray, colors.border);
      
      doc
        .fillColor(colors.text)
        .fontSize(12)
        .text(title, x + 15, y + 15);
      
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(colors.primary)
        .text(value, x + 15, y + 35);
      
      doc.font('Helvetica');
    };

    // Draw metric cards
    drawMetricCard('Total Orders', metrics.totalSales.toString(), currentX, currentY);
    drawMetricCard(
      'Total Revenue',
      `Rs. ${metrics.totalRevenue.toLocaleString()}`,
      currentX + cardWidth + cardSpacing,
      currentY
    );

    currentY += cardHeight + cardSpacing;

    drawMetricCard(
      'Total Discounts',
      `Rs. ${metrics.totalDiscount.toLocaleString()}`,
      currentX,
      currentY
    );
    drawMetricCard(
      'Net Revenue',
      `Rs. ${(metrics.totalRevenue - metrics.totalDiscount).toLocaleString()}`,
      currentX + cardWidth + cardSpacing,
      currentY
    );

    doc.moveDown(4);

    // Payment Methods Section with modern styling
    ensureSpace(200); // Check if enough space for payment methods section
    currentY = doc.y + 20;
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(colors.primary)
      .text('Payment Methods Distribution', 50, currentY);

    doc.moveDown();

    // Draw modern payment methods table
    Object.entries(metrics.paymentMethods).forEach(([method, count], index) => {
      ensureSpace(40);
      const percentage = ((count / metrics.totalSales) * 100).toFixed(1);
      const y = doc.y;
      
      // Draw row background
      doc
        .rect(50, y - 5, 500, 30)
        .fill(index % 2 === 0 ? colors.lightGray : '#FFFFFF');
      
      // Draw text
      doc
        .fontSize(12)
        .fillColor(colors.text)
        .text(method, 60, y, { width: 200 })
        .text(`${count} orders`, 260, y, { width: 100 })
        .text(`${percentage}%`, 360, y, { width: 100 });
    });

    doc.moveDown(2);

    // Recent Orders Section with modern table
    ensureSpace(400); // Check if enough space for orders table
    currentY = doc.y + 20;
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(colors.primary)
      .text('Recent Orders', 50, currentY);

    doc.moveDown();

    // Table headers with modern styling
    const tableTop = doc.y;
    const tableHeaders = ['No.', 'Order ID', 'Date', 'Amount', 'Status'];
    const columnWidths = [50, 120, 120, 125, 85]; // Adjusted column widths for better spacing

    // Draw header background
    doc
      .rect(50, tableTop - 5, 500, 30)
      .fill(colors.primary);

    // Draw header text with padding
    let xOffset = 60;
    tableHeaders.forEach((header, i) => {
      doc
        .fontSize(12)
        .fillColor('#FFFFFF')
        .text(header, xOffset, tableTop + 5, { // Added vertical padding
          width: columnWidths[i] - 10, // Subtract padding from width
          align: i === 0 ? 'center' : 'left' // Center align the No. column
        });
      xOffset += columnWidths[i];
    });

    // Table rows with alternating backgrounds
    let rowY = tableTop + 30;
    let lastY = rowY; // Track the last row's Y position
    
    orders.slice(-10).forEach((order, index) => {
      ensureSpace(40);
      
      // Draw row background
      doc
        .rect(50, rowY - 5, 500, 30)
        .fill(index % 2 === 0 ? colors.lightGray : '#FFFFFF');

      // Reset x offset for each row
      xOffset = 60;

      // Draw row content with padding
      doc
        .fontSize(11)
        .fillColor(colors.text);
      
      // Number column (centered)
      doc.text((index + 1).toString(), xOffset, rowY + 5, {
        width: columnWidths[0] - 10,
        align: 'center'
      });
      xOffset += columnWidths[0];
      
      // Order ID
      doc.text(order.orderId, xOffset, rowY + 5, {
        width: columnWidths[1] - 10
      });
      xOffset += columnWidths[1];
      
      // Date
      doc.text(
        new Date(order.timestamps.createdAt).toLocaleDateString(),
        xOffset,
        rowY + 5,
        { width: columnWidths[2] - 10 }
      );
      xOffset += columnWidths[2];
      
      // Amount
      doc.text(
        `Rs. ${order.totalAmount.toLocaleString()}`,
        xOffset,
        rowY + 5,
        { width: columnWidths[3] - 10 }
      );
      xOffset += columnWidths[3];
      
      // Status
      doc.text(
        order.payment.status,
        xOffset,
        rowY + 5,
        { width: columnWidths[4] - 10 }
      );

      rowY += 30;
      lastY = rowY; // Update last Y position
    });

    // Add footer at the bottom of the last content page
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(
        `Generated on: ${new Date().toLocaleString()}`,
        50,
        lastY + 20, // Position footer relative to last row
        {
          align: 'center',
        }
      );

    // Finalize document
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('PDF generation completed:', reportPath);
        resolve(reportPath);
      });
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    throw error;
  }
};

module.exports = { generateSalesReport };