import { Component, WritableSignal, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonItem, IonLabel,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonNote, IonIcon,
  IonFab, IonFabButton, IonBackButton, IonButtons, IonFabList, Platform
} from '@ionic/angular/standalone';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { FileOpener } from '@capacitor-community/file-opener';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrderItem } from 'src/app/core/interfaces/orderitem.interface';

@Component({
  selector: 'app-invoice-page',
  templateUrl: './invoice-page.component.html',
  styleUrls: ['./invoice-page.component.scss'],
  standalone: true,
  imports: [
    IonFabList, CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButton, IonContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonSelect,
    IonSelectOption, IonNote, IonIcon, IonFab, IonFabButton,
    IonBackButton, IonButtons
  ]
})
export class InvoicePageComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private platform: Platform = inject(Platform);

  public logoUrl: WritableSignal<string | null> = signal<string | null>(null);
  public totalAmount: WritableSignal<number> = signal<number>(0);
  public pdfDoc: WritableSignal<jsPDF | null> = signal<jsPDF | null>(null);

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

  public addOrderItem(): void {
    const orderItem = this.fb.group({
      product: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.orderItems.push(orderItem);
    this.calculateTotal();
  }

  public calculateItemTotal(item: OrderItem): number {
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
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            const img = new Image();
            img.onload = () => {
              const maxWidth = 200;
              const maxHeight = 100;
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
              }
              if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              this.logoUrl.set(canvas.toDataURL('image/png'));
            };
            img.src = result;
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  private async generatePDF(): Promise<string | null> {
    const element = document.querySelector('.invoice-container') as HTMLElement;
    if (!element) return null;

    try {
      element.classList.add('printing');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      element.classList.remove('printing');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);

      return pdf.output('datauristring');
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  public async previewPDF(): Promise<void> {
    if (!this.invoiceForm.valid) return;

    const pdfDataUri = await this.generatePDF();
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

        const fileUri = await Filesystem.getUri({
          directory: Directory.External,
          path: `Download/${fileName}`
        });

        await FileOpener.open({
          filePath: fileUri.uri,
          contentType: 'application/pdf'
        });
      } catch (error) {
        console.error('Error previewing PDF:', error);
        try {
          const fileUri = await Filesystem.getUri({
            directory: Directory.External,
            path: `Download/invoice_preview_${Date.now()}.pdf`
          });
          const contentUrl = Capacitor.convertFileSrc(fileUri.uri);
          await Browser.open({ url: contentUrl });
        } catch (e) {
          console.error('Browser fallback failed:', e);
        }
      }
    } else {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`
        );
      }
    }
  }

  public async downloadPDF(): Promise<void> {
    if (!this.invoiceForm.valid) return;

    const pdfDataUri = await this.generatePDF();
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
    this.logoUrl.set(null);
  }
}
