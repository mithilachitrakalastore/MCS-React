import React, { useRef, useState } from 'react';
import { Printer, Download, X, ShieldCheck, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

export const InvoiceView = ({ order, onClose, role, isCombined, combinedOrders }) => {
    const invoiceRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const displayData = isCombined && combinedOrders && combinedOrders.length > 0 ? {
                ...order,
                id: combinedOrders.map(o => o.id).join(', '),
                invoice_no: combinedOrders[0]?.invoice_no ? `${combinedOrders[0].invoice_no} (Combined)` : 'COMBINED',
                tracking_id: combinedOrders[0]?.tracking_id || order.tracking_id,
                date: combinedOrders[0]?.date || order.date,
                customer: combinedOrders[0]?.customer || order.customer,
                items: combinedOrders.flatMap(o => (o.items || []).map(item => ({ ...item, sourceOrderId: o.id }))),
                total: combinedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                commission_amount: combinedOrders.reduce((sum, o) => sum + (o.commission_amount || 0), 0),
                commission_percentage: combinedOrders[0]?.commission_percentage || order.commission_percentage,
                customer_payment_status: combinedOrders.some(o => o.customer_payment_status === 'done') ? 'done' : 'pending',
            } : order;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const W = pdf.internal.pageSize.getWidth();
            const H = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const rightX = W - margin;
            let y = margin;

            // Helper functions
            const setFont = (family = 'helvetica', style = 'normal', size = 10) => {
                pdf.setFontSize(size);
                pdf.setFont(family, style);
            };
            const textRight = (text, yPos) => pdf.text(text, rightX, yPos, { align: 'right' });
            const drawLine = (yPos, color = [229, 225, 216]) => {
                pdf.setDrawColor(...color);
                pdf.setLineWidth(0.2);
                pdf.line(margin, yPos, rightX, yPos);
            };

            // ─── HEADER ───
            // Fetch and embed logo
            const logoX = margin;
            let logoEndX = margin;
            try {
                const logoUrl = 'https://res.cloudinary.com/djmbuuz28/image/upload/v1761108817/logo.png';
                const logoResp = await fetch(logoUrl, { mode: 'cors' });
                const logoBlob = await logoResp.blob();
                const logoDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(logoBlob);
                });
                pdf.addImage(logoDataUrl, 'PNG', logoX, y - 5, 15, 15);
                logoEndX = logoX + 18;
            } catch (e) {
                console.error("Logo fetch failed:", e);
                logoEndX = margin;
            }

            // Store name (serif font for Playfair-like style)
            pdf.setFont('times', 'bold');
            pdf.setFontSize(24);
            pdf.setTextColor(42, 39, 35);
            pdf.text('Mithila Chitrakala Store', logoEndX, y + 2);
            
            setFont('helvetica', 'bold', 8);
            pdf.setTextColor(92, 17, 17);
            pdf.text('PREMIUM HERITAGE REGISTRY', logoEndX, y + 7.5);

            // Right side - Tax Invoice
            pdf.setFont('times', 'bolditalic');
            pdf.setFontSize(28);
            pdf.setTextColor(240, 240, 240); // Subtle background-like color
            textRight('TAX INVOICE', y + 4);

            y += 18;

            // Store address & Invoice details
            setFont('helvetica', 'normal', 8);
            pdf.setTextColor(115, 115, 115);
            pdf.text('MKS Central Hub, Ward 26', margin, y);
            pdf.text('Janakpur Dham, Nepal', margin, y + 4);
            pdf.text('contact@mithilachitrakala.com', margin, y + 8);

            // Invoice details (right)
            setFont('helvetica', 'bold', 8);
            pdf.setTextColor(115, 115, 115);
            const invoiceNo = displayData.invoice_no || 'DRAFT';
            const trackingId = displayData.tracking_id || 'N/A';
            const invoiceDate = new Date(displayData.date).toLocaleDateString('en-GB');
            
            textRight(`INVOICE NO: ${invoiceNo}`, y);
            textRight(`TRACKING ID: ${trackingId}`, y + 4.5);
            textRight(`DATE: ${invoiceDate}`, y + 9);

            y += 22;
            drawLine(y, [229, 225, 216]);
            y += 10;

            // ─── RECIPIENT ───
            setFont('helvetica', 'bold', 8);
            pdf.setTextColor(92, 17, 17);
            pdf.text('RECIPIENT DETAILS', margin, y);
            y += 8;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(42, 39, 35);
            pdf.text(displayData.customer?.name || 'N/A', margin, y);
            y += 6;

            setFont('helvetica', 'normal', 9);
            pdf.setTextColor(100, 100, 100);
            const addr = displayData.customer?.address || '';
            const city = displayData.customer?.city || '';
            const phone = displayData.customer?.phone || '';
            let detailsY = y;
            if (addr) { pdf.text(addr, margin, detailsY); detailsY += 4.5; }
            if (city) { pdf.text(city, margin, detailsY); detailsY += 4.5; }
            if (phone) { pdf.text(`T: ${phone}`, margin, detailsY); detailsY += 4.5; }
            y = Math.max(y + 6, detailsY + 2);

            y += 4;
            drawLine(y, [229, 225, 216]);
            y += 10;

            // ─── TABLE HEADER ───
            const colX = {
                desc: margin + 2,
                orderId: margin + 85,
                qty: margin + 115,
                price: margin + 135,
                total: rightX - 2
            };

            // Table header background
            pdf.setFillColor(248, 246, 242);
            pdf.rect(margin, y - 5, W - margin * 2, 9, 'F');

            setFont('helvetica', 'bold', 7.5);
            pdf.setTextColor(168, 162, 154);
            pdf.text('MASTERPIECE DESCRIPTION', colX.desc, y + 1);
            pdf.text('ORDER ID', colX.orderId, y + 1);
            pdf.text('QTY', colX.qty, y + 1, { align: 'center' });
            pdf.text('UNIT PRICE', colX.price, y + 1, { align: 'right' });
            pdf.text('TOTAL', rightX - 2, y + 1, { align: 'right' });

            y += 10;

            // ─── TABLE ROWS ───
            displayData.items.forEach((item, idx) => {
                // Check if we need a new page
                if (y > H - 70) {
                    pdf.addPage();
                    y = margin + 10;
                    // Redraw header on new page if needed or just continue
                }

                setFont('helvetica', 'bold', 10);
                pdf.setTextColor(42, 39, 35);
                const itemName = item.name.length > 40 ? item.name.substring(0, 38) + '...' : item.name;
                pdf.text(itemName, colX.desc, y);

                setFont('helvetica', 'normal', 7);
                pdf.setTextColor(168, 162, 154);
                const subtitle = [item.material, item.category].filter(Boolean).join(' • ');
                if (subtitle) pdf.text(subtitle.toUpperCase(), colX.desc, y + 4.5);

                setFont('helvetica', 'normal', 9);
                pdf.setTextColor(80, 80, 80);
                const oid = item.sourceOrderId || displayData.id;
                const oidStr = String(oid).length > 18 ? String(oid).substring(0, 16) + '..' : String(oid);
                pdf.text(oidStr, colX.orderId, y);
                pdf.text(String(item.quantity), colX.qty, y, { align: 'center' });
                pdf.text(`Rs ${item.price.toLocaleString()}`, colX.price, y, { align: 'right' });

                setFont('helvetica', 'bold', 9);
                pdf.setTextColor(42, 39, 35);
                pdf.text(`Rs ${(item.price * item.quantity).toLocaleString()}`, rightX - 2, y, { align: 'right' });

                y += (subtitle ? 11 : 8);
                drawLine(y, [248, 246, 242]);
                y += 6;
            });

            // ─── TOTALS ───
            y += 4;
            const totalsX = W - 90;

            setFont('helvetica', 'bold', 8);
            pdf.setTextColor(168, 162, 154);
            pdf.text('SUBTOTAL', totalsX, y);
            setFont('helvetica', 'bold', 9);
            pdf.setTextColor(42, 39, 35);
            textRight(`Rs ${displayData.total.toLocaleString()}`, y);
            y += 6.5;

            setFont('helvetica', 'bold', 8);
            pdf.setTextColor(168, 162, 154);
            pdf.text('HERITAGE TAX', totalsX, y);
            setFont('helvetica', 'bold', 9);
            pdf.setTextColor(42, 39, 35);
            textRight('Rs 0.00', y);
            y += 8;

            // Commission (admin/seller only)
            if (role === 'admin' || role === 'seller') {
                pdf.setFillColor(248, 246, 242);
                pdf.roundedRect(totalsX - 2, y - 4, rightX - totalsX + 4, 10, 2, 2, 'F');
                setFont('helvetica', 'bold', 7);
                pdf.setTextColor(92, 17, 17);
                pdf.text('INTERNAL MKS RECORDS', totalsX, y);
                y += 4;
                setFont('helvetica', 'normal', 7);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`MKS Commission (${displayData.commission_percentage}%)`, totalsX, y);
                textRight(`-Rs ${displayData.commission_amount.toLocaleString()}`, y);
                y += 10;
            }

            // Total line
            pdf.setDrawColor(42, 39, 35);
            pdf.setLineWidth(0.6);
            pdf.line(totalsX, y - 4, rightX, y - 4);

            pdf.setFont('times', 'italic');
            pdf.setFontSize(12);
            pdf.setTextColor(115, 115, 115);
            pdf.text('Total Paid', totalsX, y + 1);
            
            pdf.setFont('times', 'bold');
            pdf.setFontSize(22);
            pdf.setTextColor(92, 17, 17);
            textRight(`Rs ${displayData.total.toLocaleString()}`, y + 2);
            y += 12;

            // Payment status badge
            const isPaid = displayData.customer_payment_status === 'done';
            const statusText = `PAYMENT STATUS: ${displayData.customer_payment_status.toUpperCase()}`;
            setFont('helvetica', 'bold', 7);
            const statusWidth = pdf.getTextWidth(statusText);
            const badgeW = statusWidth + 10;
            const badgeX = rightX - badgeW;
            
            pdf.setFillColor(isPaid ? 240 : 255, isPaid ? 253 : 251, isPaid ? 244 : 235);
            pdf.setDrawColor(isPaid ? 220 : 240, isPaid ? 240 : 230, isPaid ? 220 : 210);
            pdf.roundedRect(badgeX, y - 4, badgeW, 6, 3, 3, 'FD');
            
            pdf.setTextColor(isPaid ? 21 : 180, isPaid ? 128 : 120, isPaid ? 61 : 0);
            pdf.text(statusText, badgeX + 5, y);

            y += 20; 

            // ─── FOOTER ───
            if (y > H - 40) { pdf.addPage(); y = margin; }
            drawLine(y, [229, 225, 216]);
            y += 10;

            // QR Code
            try {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&data=${encodeURIComponent(`https://mithilachitrakala.onrender.com/verify/${invoiceNo}`)}`;
                const response = await fetch(qrUrl);
                const blob = await response.blob();
                const qrDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                pdf.addImage(qrDataUrl, 'PNG', rightX - 25, y - 2, 25, 25);
            } catch (e) {
                console.error("QR Code fetch failed:", e);
            }

            setFont('helvetica', 'bold', 8);
            pdf.setTextColor(92, 17, 17);
            pdf.text('CERTIFIED ORIGINAL MITHILA ARTIFACT', margin, y + 2);
            y += 6;

            setFont('helvetica', 'normal', 7);
            pdf.setTextColor(115, 115, 115);
            pdf.text('This invoice serves as a certificate of origin.', margin, y);
            pdf.text('Scan the QR code to verify this invoice online.', margin, y + 4);

            setFont('helvetica', 'bold', 6.5);
            pdf.setTextColor(168, 162, 154);
            pdf.text('SCAN TO VERIFY', rightX - 12.5, y + 22, { align: 'center' });

            const fileName = `Invoice-${invoiceNo}.pdf`;
            pdf.save(fileName);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // If combined, calculate totals from combinedOrders
    const displayOrder = isCombined && combinedOrders && combinedOrders.length > 0 ? {
        ...order,
        id: combinedOrders.map(o => o.id).join(', '),
        invoice_no: combinedOrders[0]?.invoice_no ? `${combinedOrders[0].invoice_no} (Combined)` : 'COMBINED',
        date: combinedOrders[0]?.date || order.date,
        customer: combinedOrders[0]?.customer || order.customer,
        seller_id: combinedOrders.map(o => o.seller_id).filter(Boolean).join(', '),
        items: combinedOrders.flatMap(o => (o.items || []).map(item => ({ ...item, sourceOrderId: o.id }))),
        total: combinedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        commission_amount: combinedOrders.reduce((sum, o) => sum + (o.commission_amount || 0), 0),
        seller_payable_amount: combinedOrders.reduce((sum, o) => sum + (o.seller_payable_amount || 0), 0),
        commission_percentage: combinedOrders[0]?.commission_percentage || order.commission_percentage,
        customer_payment_status: combinedOrders.some(o => o.customer_payment_status === 'done') ? 'done' : 'pending',
        // Store all seller info for combined orders
        sellers: combinedOrders.map(o => ({
            seller_id: o.seller_id,
            storeName: o.items?.[0]?.storeName,
            location: o.items?.[0]?.location,
            orderId: o.id,
            items: o.items || [],
            orderTotal: o.total || 0,
            commission: o.commission_amount || 0,
            payable: o.seller_payable_amount || 0
        }))
    } : order;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-in fade-in duration-300 print:invoice-container">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col print:shadow-none print:rounded-none print:max-h-none print:fixed print:inset-0 print:z-[2000]">
                
                {/* Header Actions - Hidden during print */}
                <div className="p-6 border-b border-stone-100 flex justify-between items-center print:hidden">
                    <div className="flex gap-4">
                        <button onClick={handlePrint} className="bg-[#5c1111] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-900 transition-all">
                            <Printer size={16} /> Print Bill
                        </button>
                        <button onClick={handleDownloadPDF} disabled={downloading} className="bg-stone-100 text-stone-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-200 transition-all disabled:opacity-50">
                            {downloading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Download size={16} /> PDF</>}
                        </button>
                    </div>
                    <button onClick={onClose} className="p-2 text-stone-400 hover:text-red-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Printable Area */}
                <div ref={invoiceRef} className="flex-1 overflow-y-auto p-8 md:p-12 print:overflow-visible print:p-4 bg-white">
                    <div className="max-w-3xl mx-auto space-y-8 print:max-w-full print:space-y-4">
                        
                        {/* Branding Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 flex items-center justify-center text-white font-black text-2xl">
                                        <img 
                                          className="w-12 h-12 rounded-[0.5rem]"
                                          src="https://res.cloudinary.com/djmbuuz28/image/upload/v1761108817/logo.png" 
                                          alt="Logo" 
                                        />
                                    </div>
                                    <div>
                                        <h1 className="font-playfair text-3xl font-black text-stone-900 tracking-tight">Mithila Chitrakala Store</h1>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5c1111]/70">Premium Heritage Registry</p>
                                    </div>
                                </div>
                                <div className="text-[10px] text-stone-400 leading-relaxed font-medium">
                                    MKS Central Hub, Ward 26<br/>
                                    Janakpur Dham, Nepal<br/>
                                    contact@mithilachitrakala.com
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <h2 className="text-4xl font-playfair font-black italic text-stone-200 uppercase print:text-stone-300">Tax Invoice</h2>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Invoice No: <span className="text-stone-900">{displayOrder.invoice_no || 'DRAFT'}</span></p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Tracking ID: <span className="text-stone-900">{displayOrder.tracking_id || 'N/A'}</span></p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Date: <span className="text-stone-900">{new Date(displayOrder.date).toLocaleDateString('en-GB')}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-row-2 gap-8 border-t border-b border-stone-100 py-6 print:py-3">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#5c1111]">Recipient Details</h3>
                                <div className="space-y-1">
                                    <p className="font-black text-stone-900">{displayOrder.customer.name}</p>
                                    <p className="text-[11px] text-stone-500 leading-relaxed">
                                        {displayOrder.customer.address}<br/>
                                        {displayOrder.customer.city}<br/>
                                        T: {displayOrder.customer.phone}
                                    </p>
                                </div>
                            </div>
                            
                        </div>

                        {/* Line Items */}
                        <table className="w-full text-left">
                            <thead className="bg-stone-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                                <tr>
                                    <th className="py-3 px-2">Masterpiece Description</th>
                                    <th className="py-3 px-2 text-right">Order ID</th>
                                    <th className="py-3 px-2 text-right">Quantity</th>
                                    <th className="py-3 px-2 text-right">Unit Price</th>
                                    <th className="py-3 px-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {displayOrder.items.map((item, idx) => (
                                    <tr key={idx} className="text-[11px] print:text-[10px]">
                                        <td className="py-3 px-2 print:py-1">
                                            <p className="font-black text-stone-900">{item.name}</p>
                                            <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-widest">{item.material} &bull; {item.category}</p>
                                        </td>
                                        <td className="py-3 px-2 text-right font-medium print:py-1">{item.sourceOrderId || displayOrder.id}</td>
                                        <td className="py-3 px-2 text-right font-medium print:py-1">{item.quantity}</td>
                                        <td className="py-3 px-2 text-right font-medium print:py-1">रु {item.price.toLocaleString()}</td>
                                        <td className="py-3 px-2 text-right font-black text-stone-900 print:py-1">रु {(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Financial Totals */}
                        <div className="flex justify-end pt-4 border-t border-stone-100">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-stone-400 tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-stone-900">रु {displayOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-stone-400 tracking-widest">
                                    <span>Heritage Tax</span>
                                    <span className="text-stone-900">रु 0.00</span>
                                </div>
                                
                                {(role === 'admin' || role === 'seller') && (
                                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 space-y-2 opacity-60 print:hidden">
                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5c1111]">Internal MKS Records</p>
                                        <div className="flex justify-between text-[9px] font-bold text-stone-500">
                                            <span>MKS Commission ({displayOrder.commission_percentage}%)</span>
                                            <span>-रु {displayOrder.commission_amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t-2 border-stone-900 flex justify-between items-baseline">
                                    <span className="font-playfair text-lg font-black italic">Total Paid</span>
                                    <span className="text-2xl font-playfair font-black text-[#5c1111]">रु {displayOrder.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-center pt-1">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-[0.3em] rounded-full border border-green-100">
                                        Payment Status: {displayOrder.customer_payment_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Authentication */}
                        <div className="pt-6 flex justify-between items-end border-t border-stone-100">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[#5c1111]">
                                    <ShieldCheck size={14} />
                                    <p className="text-[8px] font-black uppercase tracking-widest">Certified Original Mithila Artifact</p>
                                </div>
                                <p className="text-[7px] text-stone-400 leading-relaxed max-w-xs">
                                    This invoice serves as a certificate of origin.<br/>
                                    Scan the QR code to verify this invoice online.
                                </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://mithilachitrakala.onrender.com/verify/${displayOrder.invoice_no || displayOrder.id}`)}`} 
                                    className="w-20 h-20" 
                                    alt="verification-qr" 
                                    crossOrigin="anonymous"
                                />
                                <p className="text-[7px] font-black uppercase tracking-widest text-stone-400">Scan to Verify</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
