export interface OrderItem {
    product: string;
    price: number; 
    quantity: number;
   }
   
   export interface InvoiceFormData {
    customerName: string;
    customerAddress: string;
    orderItems: OrderItem[];
    discount: string;
    paymentMethod: 'cash' | 'card';
   }