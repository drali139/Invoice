import { customer } from '../interfaces/customer';
import { Injectable } from '@angular/core';
import { reportsdata } from '../interfaces/reportdata';
@Injectable({
  providedIn: 'root'
})

export class DataService {
  reduce(arg0: (sum: number, report: { sale: any; }) => number, arg1: number): number {
    throw new Error('Method not implemented.');
  }
  public customers: customer[] = [
    { customername: 'Ali', shopname: 'Baba Mobile', mobile: '03054590631', tax: '123456789', address: 'Pine Valley', city: 'Pakpattan' },
    { customername: 'Ahmed', shopname: 'Tech Hub', mobile: '03125678490', tax: '987654321', address: 'City Center', city: 'Lahore' },
    { customername: 'Sara', shopname: 'Fashion Point', mobile: '03217894567', tax: '567890123', address: 'Main Boulevard', city: 'Karachi' },
    { customername: 'Zain', shopname: 'Gadget World', mobile: '03367890123', tax: '345678901', address: 'Model Town', city: 'Islamabad' },
    { customername: 'Aisha', shopname: 'Style Bazaar', mobile: '03459012345', tax: '456789012', address: 'Liberty Market', city: 'Multan' },
    { customername: 'Usman', shopname: 'Smart Store', mobile: '03567891234', tax: '234567890', address: 'Green Street', city: 'Rawalpindi' },
    { customername: 'Hassan', shopname: 'Electro Mart', mobile: '03678912345', tax: '678901234', address: 'Garden Town', city: 'Faisalabad' }
  ];

  public reportdata: any = [
    { sale: '17000', received: '19000', dues: '2000' },
    { sale: '25000', received: '23000', dues: '2000' },
    { sale: '15000', received: '18000', dues: '3000' },
    { sale: '30000', received: '32000', dues: '2000' },
    { sale: '12000', received: '10000', dues: '2000' },
    { sale: '27000', received: '25000', dues: '2000' },
    { sale: '19000', received: '21000', dues: '2000' },
    { sale: '22000', received: '20000', dues: '2000' },
    { sale: '16000', received: '14000', dues: '2000' },
    { sale: '18000', received: '20000', dues: '2000' },
    { sale: '20000', received: '22000', dues: '2000' },
  ];

  constructor() { }
}