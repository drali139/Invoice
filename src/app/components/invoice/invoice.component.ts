import { Component, Input, Output, EventEmitter, inject, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonSelect,
  IonSelectOption, IonNote, IonItemGroup, IonItemDivider, IonIcon,
  Platform
} from '@ionic/angular/standalone';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import jsPDF from 'jspdf';
import { FileOpener } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonModal, IonHeader, IonToolbar, 
    IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonNote, IonItemGroup,
    IonItemDivider, IonIcon
  ]
})
export class InvoiceComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<boolean>();
  
  private fb: FormBuilder = inject(FormBuilder);
  private platform: Platform = inject(Platform);
  
  public logoUrl: WritableSignal<string | null> = signal<string | null>(null);
  public totalAmount: WritableSignal<number> = signal<number>(0);
  public isPdfGenerated: WritableSignal<boolean> = signal<boolean>(false);
  public pdfDoc: WritableSignal<string | null> = signal<string | null>(null);

  public invoiceForm = this.fb.group({
    customerName: ['', Validators.required],
    customerAddress: ['', Validators.required],
    orderItems: this.fb.array<FormGroup>([]),
    discount: ['0'],
    paymentMethod: ['cash', Validators.required]
  });

  public get orderItems(): FormArray {
    return this.invoiceForm.get('orderItems') as FormArray;
  }

  public clearInput(event: any): void {
    event.target.value = '';
  }

  public incrementQuantity(index: number): void {
    const quantityControl = this.orderItems.at(index).get('quantity');
    if (quantityControl) {
      const currentValue = Number(quantityControl.value) || 0;
      quantityControl.setValue(currentValue + 1);
      this.calculateTotal();
    }
  }

  public decrementQuantity(index: number): void {
    const quantityControl = this.orderItems.at(index).get('quantity');
    if (quantityControl) {
      const currentValue = Number(quantityControl.value) || 0;
      if (currentValue > 1) {
        quantityControl.setValue(currentValue - 1);
        this.calculateTotal();
      }
    }
  }

  public addOrderItem(): void {
    const orderItem = this.fb.group({
      product: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [{value: 1, disabled: false}, [Validators.required, Validators.min(1)]]
    });
    this.orderItems.push(orderItem);
    this.calculateTotal();
  }

  public calculateItemTotal(item: any): number {
    return item.price * item.quantity;
  }

  public calculateTotal(): void {
    let subtotal = 0;
    this.orderItems.controls.forEach(item => {
      subtotal += this.calculateItemTotal(item.value);
    });
    const discountPercentage = Number(this.invoiceForm.get('discount')?.value) || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const finalAmount = subtotal - discountAmount;
    this.totalAmount.set(finalAmount);
  }

  public uploadLogo(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.logoUrl.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  public async preparePDF(): Promise<void> {
    const doc = new jsPDF();
    const margin = 10;
    const startYPos = margin;
    const pageWidth = doc.internal.pageSize.width;
    const headerHeight = 25;

    const currentLogoUrl = this.logoUrl();
    if (currentLogoUrl) {
      doc.addImage(currentLogoUrl, 'JPEG', margin, startYPos, 40, 20);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(66, 82, 182);

    const invoiceText = 'INVOICE';
    const invoiceTextWidth = doc.getTextDimensions(invoiceText).w;
    const centerX = pageWidth / 2;
    doc.text(invoiceText, centerX - (invoiceTextWidth / 2), startYPos + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const date = new Date().toLocaleDateString();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const rightColumnX = pageWidth - margin - 60;
    doc.text(`Date: ${date}`, rightColumnX, startYPos + 8);
    doc.text(`Invoice #: ${invoiceNumber}`, rightColumnX, startYPos + 15);

    let yPos = startYPos + headerHeight + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Customer Name:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(this.invoiceForm.get('customerName')?.value || '', margin + 35, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Address:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const address = this.invoiceForm.get('customerAddress')?.value || '';
    const addressLines = doc.splitTextToSize(address, 140);
    doc.text(addressLines, margin + 35, yPos);
    yPos += (addressLines.length * 5) + 15;
    
    const columns = ['#', 'Product', 'Price', 'Qty', 'Amount'];
    const columnWidths = [15, 80, 30, 25, 35];
    const startX = margin;
    
    doc.setFillColor(66, 82, 182);
    doc.rect(startX, yPos - 5, pageWidth - (margin * 2), 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    let xPos = startX;
    columns.forEach((col, index) => {
      doc.text(col, xPos + 2, yPos);
      xPos += columnWidths[index];
    });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    
    let totalAmount = 0;
    this.orderItems.controls.forEach((item, index) => {
      const values = item.value;
      const itemTotal = this.calculateItemTotal(values);
      totalAmount += itemTotal;
      
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, yPos - 5, pageWidth - (margin * 2), 8, 'F');
      }
      
      xPos = startX;
      doc.text((index + 1).toString(), xPos + 2, yPos);
      xPos += columnWidths[0];
      doc.text(values.product, xPos + 2, yPos);
      xPos += columnWidths[1];
      doc.text(`$${values.price.toFixed(2)}`, xPos + 2, yPos);
      xPos += columnWidths[2];
      doc.text(values.quantity.toString(), xPos + 2, yPos);
      xPos += columnWidths[3];
      doc.text(`$${itemTotal.toFixed(2)}`, xPos + 2, yPos);
      
      yPos += 8;
    });
    
    yPos += 10;
    
    const discount = Number(this.invoiceForm.get('discount')?.value) || 0;
    const discountAmount = (totalAmount * discount) / 100;
    const finalAmount = totalAmount - discountAmount;
    
    const summaryX = pageWidth - margin - 80;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(summaryX, yPos - 5, 80, 35, 'FD');
    
    doc.text('Subtotal:', summaryX + 5, yPos);
    doc.text(`$${totalAmount.toFixed(2)}`, summaryX + 60, yPos, { align: 'right' });
    yPos += 8;
    doc.text(`Discount (${discount}%):`, summaryX + 5, yPos);
    doc.text(`$${discountAmount.toFixed(2)}`, summaryX + 60, yPos, { align: 'right' });
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', summaryX + 5, yPos);
    doc.text(`$${finalAmount.toFixed(2)}`, summaryX + 60, yPos, { align: 'right' });
    
    yPos += 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(this.invoiceForm.get('paymentMethod')?.value?.toUpperCase() || '', margin + 35, yPos);
    
    yPos = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
    
    const pdfOutput = doc.output('datauristring');
    this.pdfDoc.set(pdfOutput);
    this.isPdfGenerated.set(true);
  }

  public async viewPDF(): Promise<void> {
    const pdfDataUri = this.pdfDoc();
    if (!pdfDataUri) return;

    if (this.platform.is('android')) {
      try {
        const fileName = `invoice_preview_${Date.now()}.pdf`;
        const pdfData = pdfDataUri.split(',')[1];
        
        await Filesystem.writeFile({
          path: `Download/${fileName}`,
          data: pdfData,
          directory: Directory.External,
          recursive: true
        });

        const filePath = await Filesystem.getUri({
          directory: Directory.External,
          path: `Download/${fileName}`
        });

        await FileOpener.open({
          filePath: filePath.uri,
          contentType: 'application/pdf'
        });
      } catch (error) {
        console.error('Error viewing PDF:', error);
        try {
          const uri = await Filesystem.getUri({
            directory: Directory.External,
            path: `Download/invoice_preview_${Date.now()}.pdf`
          });
          const contentUrl = Capacitor.convertFileSrc(uri.uri);
          await Browser.open({ url: contentUrl });
        } catch (e) {
          console.error('Browser fallback failed:', e);
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        window.open()?.document.write(
          `<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`
        );
      }
    }
  }

  public async downloadPDF(): Promise<void> {
    const pdfDataUri = this.pdfDoc();
    if (!pdfDataUri) return;

    if (this.platform.is('android')) {
      try {
        const fileName = `invoice_${Date.now()}.pdf`;
        const pdfData = pdfDataUri.split(',')[1];
        
        await Filesystem.writeFile({
          path: `Download/${fileName}`,
          data: pdfData,
          directory: Directory.External,
          recursive: true
        });

        alert('PDF saved to Downloads folder');
        this.resetForm();
        this.closeModal.emit(true);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to save PDF. Please try again.');
      }
    } else {
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `invoice_${Date.now()}.pdf`;
      link.click();
    }
  }

  public resetForm(): void {
    this.invoiceForm.reset();
    this.orderItems.clear();
    this.totalAmount.set(0);
    this.isPdfGenerated.set(false);
    this.logoUrl.set(null);
  }

  public close(): void {
    this.closeModal.emit(true);
  }
}