// ============================================
// VendorBridge AI — Comprehensive Seed Data
// ============================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;
const DEFAULT_PASSWORD = 'VendorBridge@2024';

async function main() {
  console.log('🌱 Seeding VendorBridge AI database...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.$transaction([
    prisma.analyticsSnapshot.deleteMany(),
    prisma.riskAlert.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.threeWayMatch.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.goodsReceipt.deleteMany(),
    prisma.pOLineItem.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.quotation.deleteMany(),
    prisma.rFQVendorMapping.deleteMany(),
    prisma.rFQAttachment.deleteMany(),
    prisma.rFQ.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.pRAttachment.deleteMany(),
    prisma.purchaseRequest.deleteMany(),
    prisma.approvalRule.deleteMany(),
    prisma.vendorScore.deleteMany(),
    prisma.vendor.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.department.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, HASH_ROUNDS);

  // ============================================
  // 1. Organization
  // ============================================
  console.log('🏢 Creating organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'KSV Technologies Pvt Ltd',
      address: '42, Tech Park, Whitefield, Bengaluru, Karnataka 560066',
      phone: '+91 80 4567 8900',
      email: 'admin@ksvtech.in',
      gstNumber: '29AABCK1234F1Z5',
      panNumber: 'AABCK1234F',
      website: 'https://ksvtech.in',
      industry: 'Information Technology',
      currency: 'INR',
      financialYearStart: 4,
      procurementHealthScore: 87.5,
    },
  });

  // ============================================
  // 2. Departments
  // ============================================
  console.log('🏬 Creating departments...');
  const deptData = [
    { name: 'Information Technology', code: 'IT', budget: 5000000 },
    { name: 'Human Resources', code: 'HR', budget: 2000000 },
    { name: 'Finance & Accounts', code: 'FIN', budget: 1500000 },
    { name: 'Operations', code: 'OPS', budget: 8000000 },
    { name: 'Marketing', code: 'MKT', budget: 3000000 },
    { name: 'Administration', code: 'ADM', budget: 2500000 },
    { name: 'Research & Development', code: 'R&D', budget: 7000000 },
    { name: 'Sales', code: 'SALES', budget: 4000000 },
  ];

  const departments: Record<string, any> = {};
  for (const d of deptData) {
    departments[d.code] = await prisma.department.create({
      data: { ...d, budget: d.budget, organizationId: org.id },
    });
  }

  // ============================================
  // 3. Users & Employees (Internal)
  // ============================================
  console.log('👥 Creating users & employees...');

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Rajesh', lastName: 'Kumar', username: 'admin',
      email: 'admin@vendorbridge.in', passwordHash, phone: '+91 9876543210',
      dateOfBirth: new Date('1985-03-15'), gender: 'MALE',
      addressLine1: '12, MG Road', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560001', country: 'India', role: 'ADMIN',
      isActive: true, isEmailVerified: true, loginCount: 47,
      lastLoginAt: new Date('2024-12-20T09:00:00Z'),
      bio: 'System Administrator with 10+ years of experience in enterprise procurement systems.',
    },
  });
  const adminEmp = await prisma.employee.create({
    data: {
      userId: adminUser.id, employeeId: 'EMP-001',
      departmentId: departments['IT'].id, designation: 'System Administrator',
      joiningDate: new Date('2020-01-15'), employeeType: 'FULL_TIME',
    },
  });

  // Manager
  const managerUser = await prisma.user.create({
    data: {
      firstName: 'Priya', lastName: 'Sharma', username: 'priya.sharma',
      email: 'priya.sharma@vendorbridge.in', passwordHash, phone: '+91 9876543211',
      dateOfBirth: new Date('1988-07-22'), gender: 'FEMALE',
      addressLine1: '45, Indiranagar', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560038', country: 'India', role: 'MANAGER',
      isActive: true, isEmailVerified: true, loginCount: 89,
      lastLoginAt: new Date('2024-12-20T08:30:00Z'),
      bio: 'IT Department Manager overseeing procurement for all technology needs.',
    },
  });
  const managerEmp = await prisma.employee.create({
    data: {
      userId: managerUser.id, employeeId: 'EMP-002',
      departmentId: departments['IT'].id, designation: 'IT Manager',
      joiningDate: new Date('2019-06-01'), employeeType: 'FULL_TIME',
    },
  });

  // Senior Manager
  const seniorMgrUser = await prisma.user.create({
    data: {
      firstName: 'Vikram', lastName: 'Patel', username: 'vikram.patel',
      email: 'vikram.patel@vendorbridge.in', passwordHash, phone: '+91 9876543212',
      dateOfBirth: new Date('1982-11-05'), gender: 'MALE',
      addressLine1: '78, Koramangala', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560034', country: 'India', role: 'SENIOR_MANAGER',
      isActive: true, isEmailVerified: true, loginCount: 62,
      lastLoginAt: new Date('2024-12-19T14:00:00Z'),
      bio: 'Senior Manager - Operations, responsible for high-value procurement approvals.',
    },
  });
  await prisma.employee.create({
    data: {
      userId: seniorMgrUser.id, employeeId: 'EMP-003',
      departmentId: departments['OPS'].id, designation: 'Senior Operations Manager',
      joiningDate: new Date('2018-03-15'), employeeType: 'FULL_TIME',
    },
  });

  // Director
  const directorUser = await prisma.user.create({
    data: {
      firstName: 'Anita', lastName: 'Desai', username: 'anita.desai',
      email: 'anita.desai@vendorbridge.in', passwordHash, phone: '+91 9876543213',
      dateOfBirth: new Date('1975-05-18'), gender: 'FEMALE',
      addressLine1: '10, Sadashivanagar', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560080', country: 'India', role: 'DIRECTOR',
      isActive: true, isEmailVerified: true, loginCount: 34,
      lastLoginAt: new Date('2024-12-18T11:00:00Z'),
      bio: 'Director of Procurement & Strategy. Oversees organization-wide procurement policy.',
    },
  });
  await prisma.employee.create({
    data: {
      userId: directorUser.id, employeeId: 'EMP-004',
      departmentId: departments['ADM'].id, designation: 'Director - Procurement & Strategy',
      joiningDate: new Date('2017-01-10'), employeeType: 'FULL_TIME',
    },
  });

  // Procurement Officers
  const procUser1 = await prisma.user.create({
    data: {
      firstName: 'Suresh', lastName: 'Menon', username: 'suresh.menon',
      email: 'suresh.menon@vendorbridge.in', passwordHash, phone: '+91 9876543214',
      dateOfBirth: new Date('1990-09-12'), gender: 'MALE',
      addressLine1: '23, HSR Layout', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560102', country: 'India', role: 'PROCUREMENT_OFFICER',
      isActive: true, isEmailVerified: true, loginCount: 156,
      lastLoginAt: new Date('2024-12-20T10:00:00Z'),
      bio: 'Lead Procurement Officer handling IT and Office supplies procurement.',
    },
  });
  const procEmp1 = await prisma.employee.create({
    data: {
      userId: procUser1.id, employeeId: 'EMP-005',
      departmentId: departments['ADM'].id, designation: 'Lead Procurement Officer',
      joiningDate: new Date('2021-02-01'), employeeType: 'FULL_TIME',
      reportingManagerId: managerEmp.id,
    },
  });

  const procUser2 = await prisma.user.create({
    data: {
      firstName: 'Kavita', lastName: 'Reddy', username: 'kavita.reddy',
      email: 'kavita.reddy@vendorbridge.in', passwordHash, phone: '+91 9876543215',
      dateOfBirth: new Date('1993-02-28'), gender: 'FEMALE',
      addressLine1: '56, Electronic City', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560100', country: 'India', role: 'PROCUREMENT_OFFICER',
      isActive: true, isEmailVerified: true, loginCount: 98,
      lastLoginAt: new Date('2024-12-20T09:45:00Z'),
      bio: 'Procurement Officer specializing in services and maintenance contracts.',
    },
  });
  await prisma.employee.create({
    data: {
      userId: procUser2.id, employeeId: 'EMP-006',
      departmentId: departments['ADM'].id, designation: 'Procurement Officer',
      joiningDate: new Date('2022-07-15'), employeeType: 'FULL_TIME',
      reportingManagerId: procEmp1.id,
    },
  });

  // Employees
  const empUser1 = await prisma.user.create({
    data: {
      firstName: 'Amit', lastName: 'Verma', username: 'amit.verma',
      email: 'amit.verma@vendorbridge.in', passwordHash, phone: '+91 9876543216',
      dateOfBirth: new Date('1995-04-10'), gender: 'MALE',
      addressLine1: '89, BTM Layout', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560076', country: 'India', role: 'EMPLOYEE',
      isActive: true, isEmailVerified: true, loginCount: 23,
      lastLoginAt: new Date('2024-12-19T16:00:00Z'),
      bio: 'Senior Software Developer in the IT department.',
    },
  });
  const empEmp1 = await prisma.employee.create({
    data: {
      userId: empUser1.id, employeeId: 'EMP-007',
      departmentId: departments['IT'].id, designation: 'Senior Software Developer',
      joiningDate: new Date('2022-01-10'), employeeType: 'FULL_TIME',
      reportingManagerId: managerEmp.id,
    },
  });

  const empUser2 = await prisma.user.create({
    data: {
      firstName: 'Sneha', lastName: 'Gupta', username: 'sneha.gupta',
      email: 'sneha.gupta@vendorbridge.in', passwordHash, phone: '+91 9876543217',
      dateOfBirth: new Date('1996-12-03'), gender: 'FEMALE',
      addressLine1: '34, Jayanagar', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560041', country: 'India', role: 'EMPLOYEE',
      isActive: true, isEmailVerified: true, loginCount: 15,
      lastLoginAt: new Date('2024-12-18T10:30:00Z'),
      bio: 'HR Executive responsible for office supplies and team equipment requests.',
    },
  });
  const empEmp2 = await prisma.employee.create({
    data: {
      userId: empUser2.id, employeeId: 'EMP-008',
      departmentId: departments['HR'].id, designation: 'HR Executive',
      joiningDate: new Date('2023-03-01'), employeeType: 'FULL_TIME',
    },
  });

  const empUser3 = await prisma.user.create({
    data: {
      firstName: 'Rohan', lastName: 'Joshi', username: 'rohan.joshi',
      email: 'rohan.joshi@vendorbridge.in', passwordHash, phone: '+91 9876543218',
      dateOfBirth: new Date('1997-08-25'), gender: 'MALE',
      addressLine1: '67, Marathahalli', city: 'Bengaluru', state: 'Karnataka',
      pincode: '560037', country: 'India', role: 'EMPLOYEE',
      isActive: true, isEmailVerified: true, loginCount: 8,
      lastLoginAt: new Date('2024-12-17T14:00:00Z'),
      bio: 'Marketing Analyst looking after campaign and event procurement.',
    },
  });
  await prisma.employee.create({
    data: {
      userId: empUser3.id, employeeId: 'EMP-009',
      departmentId: departments['MKT'].id, designation: 'Marketing Analyst',
      joiningDate: new Date('2023-08-01'), employeeType: 'FULL_TIME',
    },
  });

  // ============================================
  // 4. Vendor Users & Vendor Profiles
  // ============================================
  console.log('🏪 Creating vendors...');

  const vendorData = [
    {
      user: { firstName: 'Arun', lastName: 'Krishnan', username: 'vendor.technova', email: 'vendor@technova.in', phone: '+91 9900110011' },
      vendor: { vendorCode: 'VND-001', companyName: 'TechNova Solutions Pvt Ltd', tradeName: 'TechNova', gstNumber: '29AADCT5678G1Z9', panNumber: 'AADCT5678G', category: 'IT_HARDWARE' as const, contactPerson: 'Arun Krishnan', contactEmail: 'sales@technova.in', contactPhone: '+91 9900110011', website: 'https://technova.in', addressLine1: '15, ITPL Main Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', bankName: 'HDFC Bank', bankAccountNumber: '50200012345678', bankIfscCode: 'HDFC0001234', bankBranch: 'Whitefield', annualTurnover: 150000000, employeeCount: 250, yearEstablished: 2012, certifications: ['ISO 9001:2015', 'ISO 27001'], description: 'Leading IT hardware solutions provider specializing in enterprise computing, networking, and server infrastructure.' },
      score: { trustScore: 92, onTimeDeliveryRate: 95, qualityScore: 91, priceCompetitiveness: 88, complaintRate: 3, invoiceAccuracy: 97, responseTime: 4, orderCompletionRate: 98, communicationScore: 90, totalOrders: 45, totalOrderValue: 28500000, avgDeliveryDays: 5 },
    },
    {
      user: { firstName: 'Meera', lastName: 'Nair', username: 'vendor.cloudminds', email: 'vendor@cloudminds.in', phone: '+91 9900220022' },
      vendor: { vendorCode: 'VND-002', companyName: 'CloudMinds Technologies', gstNumber: '36AABCC9876H1Z3', panNumber: 'AABCC9876H', category: 'IT_SOFTWARE' as const, contactPerson: 'Meera Nair', contactEmail: 'sales@cloudminds.in', contactPhone: '+91 9900220022', website: 'https://cloudminds.in', addressLine1: '78, HITEC City', city: 'Hyderabad', state: 'Telangana', pincode: '500081', annualTurnover: 80000000, employeeCount: 120, yearEstablished: 2015, certifications: ['ISO 27001', 'SOC 2 Type II'], description: 'Cloud-native SaaS and enterprise software licensing solutions.' },
      score: { trustScore: 88, onTimeDeliveryRate: 90, qualityScore: 92, priceCompetitiveness: 85, complaintRate: 5, invoiceAccuracy: 94, responseTime: 6, orderCompletionRate: 96, communicationScore: 87, totalOrders: 32, totalOrderValue: 18200000, avgDeliveryDays: 3 },
    },
    {
      user: { firstName: 'Deepak', lastName: 'Shah', username: 'vendor.officekart', email: 'vendor@officekart.in', phone: '+91 9900330033' },
      vendor: { vendorCode: 'VND-003', companyName: 'OfficeKart India Pvt Ltd', tradeName: 'OfficeKart', gstNumber: '27AABCO3456J1Z7', panNumber: 'AABCO3456J', category: 'OFFICE_SUPPLIES' as const, contactPerson: 'Deepak Shah', contactEmail: 'orders@officekart.in', contactPhone: '+91 9900330033', website: 'https://officekart.in', addressLine1: '202, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', annualTurnover: 45000000, employeeCount: 85, yearEstablished: 2010, certifications: ['ISO 9001:2015'], description: 'One-stop shop for office stationery, supplies, and consumables.' },
      score: { trustScore: 85, onTimeDeliveryRate: 88, qualityScore: 83, priceCompetitiveness: 92, complaintRate: 8, invoiceAccuracy: 90, responseTime: 8, orderCompletionRate: 94, communicationScore: 82, totalOrders: 67, totalOrderValue: 8900000, avgDeliveryDays: 4 },
    },
    {
      user: { firstName: 'Rahul', lastName: 'Mehta', username: 'vendor.furnishpro', email: 'vendor@furnishpro.in', phone: '+91 9900440044' },
      vendor: { vendorCode: 'VND-004', companyName: 'FurnishPro Ltd', gstNumber: '27AABCF7890K1Z1', panNumber: 'AABCF7890K', category: 'FURNITURE' as const, contactPerson: 'Rahul Mehta', contactEmail: 'sales@furnishpro.in', contactPhone: '+91 9900440044', website: 'https://furnishpro.in', addressLine1: '45, Hinjewadi Phase 2', city: 'Pune', state: 'Maharashtra', pincode: '411057', annualTurnover: 35000000, employeeCount: 60, yearEstablished: 2014, certifications: ['ISO 14001'], description: 'Premium office furniture manufacturer and supplier.' },
      score: { trustScore: 78, onTimeDeliveryRate: 80, qualityScore: 85, priceCompetitiveness: 75, complaintRate: 12, invoiceAccuracy: 88, responseTime: 12, orderCompletionRate: 90, communicationScore: 76, totalOrders: 28, totalOrderValue: 12500000, avgDeliveryDays: 14 },
    },
    {
      user: { firstName: 'Sanjay', lastName: 'Tiwari', username: 'vendor.printmax', email: 'vendor@printmax.in', phone: '+91 9900550055' },
      vendor: { vendorCode: 'VND-005', companyName: 'PrintMax Services', gstNumber: '07AABCP2345L1Z5', panNumber: 'AABCP2345L', category: 'SERVICES' as const, contactPerson: 'Sanjay Tiwari', contactEmail: 'info@printmax.in', contactPhone: '+91 9900550055', addressLine1: '12, Nehru Place', city: 'New Delhi', state: 'Delhi', pincode: '110019', annualTurnover: 20000000, employeeCount: 40, yearEstablished: 2008, certifications: [], description: 'Professional printing, branding, and marketing material services.' },
      score: { trustScore: 72, onTimeDeliveryRate: 75, qualityScore: 78, priceCompetitiveness: 80, complaintRate: 15, invoiceAccuracy: 82, responseTime: 18, orderCompletionRate: 85, communicationScore: 70, totalOrders: 22, totalOrderValue: 4500000, avgDeliveryDays: 7 },
    },
    {
      user: { firstName: 'Lakshmi', lastName: 'Iyer', username: 'vendor.cleanstar', email: 'vendor@cleanstar.in', phone: '+91 9900660066' },
      vendor: { vendorCode: 'VND-006', companyName: 'CleanStar Facilities Mgmt', gstNumber: '33AABCC4567M1Z9', panNumber: 'AABCC4567M', category: 'MAINTENANCE' as const, contactPerson: 'Lakshmi Iyer', contactEmail: 'ops@cleanstar.in', contactPhone: '+91 9900660066', addressLine1: '88, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017', annualTurnover: 30000000, employeeCount: 200, yearEstablished: 2011, certifications: ['ISO 9001:2015', 'ISO 14001'], description: 'Comprehensive facility management, cleaning, and maintenance services.' },
      score: { trustScore: 81, onTimeDeliveryRate: 84, qualityScore: 80, priceCompetitiveness: 82, complaintRate: 10, invoiceAccuracy: 86, responseTime: 10, orderCompletionRate: 92, communicationScore: 79, totalOrders: 36, totalOrderValue: 9600000, avgDeliveryDays: 2 },
    },
    {
      user: { firstName: 'Karan', lastName: 'Singh', username: 'vendor.swiftlogix', email: 'vendor@swiftlogix.in', phone: '+91 9900770077' },
      vendor: { vendorCode: 'VND-007', companyName: 'SwiftLogix Transport Pvt Ltd', tradeName: 'SwiftLogix', gstNumber: '24AABCS6789N1Z3', panNumber: 'AABCS6789N', category: 'LOGISTICS' as const, contactPerson: 'Karan Singh', contactEmail: 'logistics@swiftlogix.in', contactPhone: '+91 9900770077', addressLine1: '34, SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', annualTurnover: 60000000, employeeCount: 150, yearEstablished: 2013, certifications: ['ISO 9001:2015'], description: 'End-to-end logistics and supply chain solutions.' },
      score: { trustScore: 76, onTimeDeliveryRate: 78, qualityScore: 77, priceCompetitiveness: 79, complaintRate: 14, invoiceAccuracy: 80, responseTime: 15, orderCompletionRate: 88, communicationScore: 74, totalOrders: 18, totalOrderValue: 6200000, avgDeliveryDays: 6 },
    },
    {
      user: { firstName: 'Pooja', lastName: 'Agarwal', username: 'vendor.greenleaf', email: 'vendor@greenleaf.in', phone: '+91 9900880088' },
      vendor: { vendorCode: 'VND-008', companyName: 'GreenLeaf Raw Materials', gstNumber: '08AABCG8901P1Z7', panNumber: 'AABCG8901P', category: 'RAW_MATERIALS' as const, contactPerson: 'Pooja Agarwal', contactEmail: 'supply@greenleaf.in', contactPhone: '+91 9900880088', addressLine1: '56, MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', annualTurnover: 90000000, employeeCount: 180, yearEstablished: 2009, certifications: ['ISO 9001:2015', 'ISO 14001', 'OHSAS 18001'], description: 'Sustainable raw material sourcing and supply for manufacturing.' },
      score: { trustScore: 90, onTimeDeliveryRate: 93, qualityScore: 89, priceCompetitiveness: 87, complaintRate: 4, invoiceAccuracy: 95, responseTime: 5, orderCompletionRate: 97, communicationScore: 88, totalOrders: 52, totalOrderValue: 42000000, avgDeliveryDays: 8 },
    },
    {
      user: { firstName: 'Nikhil', lastName: 'Kapoor', username: 'vendor.digitaledge', email: 'vendor@digitaledge.in', phone: '+91 9900990099' },
      vendor: { vendorCode: 'VND-009', companyName: 'DigitalEdge Marketing', gstNumber: '09AABCD1234Q1Z1', panNumber: 'AABCD1234Q', category: 'MARKETING' as const, contactPerson: 'Nikhil Kapoor', contactEmail: 'hello@digitaledge.in', contactPhone: '+91 9900990099', addressLine1: '120, Sector 18', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', annualTurnover: 25000000, employeeCount: 45, yearEstablished: 2017, certifications: [], description: 'Digital marketing, branding, and creative services agency.' },
      score: { trustScore: 65, onTimeDeliveryRate: 68, qualityScore: 72, priceCompetitiveness: 70, complaintRate: 20, invoiceAccuracy: 75, responseTime: 24, orderCompletionRate: 80, communicationScore: 65, totalOrders: 12, totalOrderValue: 3200000, avgDeliveryDays: 10 },
    },
    {
      user: { firstName: 'Aditi', lastName: 'Rao', username: 'vendor.securenet', email: 'vendor@securenet.in', phone: '+91 9911001100' },
      vendor: { vendorCode: 'VND-010', companyName: 'SecureNet Cybersecurity', gstNumber: '29AABCS9012R1Z5', panNumber: 'AABCS9012R', category: 'IT_SOFTWARE' as const, contactPerson: 'Aditi Rao', contactEmail: 'sales@securenet.in', contactPhone: '+91 9911001100', website: 'https://securenet.in', addressLine1: '90, Koramangala 5th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560095', annualTurnover: 200000000, employeeCount: 350, yearEstablished: 2010, certifications: ['ISO 27001', 'SOC 2', 'PCI DSS'], description: 'Enterprise cybersecurity solutions, SIEM, and managed security services.' },
      score: { trustScore: 95, onTimeDeliveryRate: 97, qualityScore: 96, priceCompetitiveness: 82, complaintRate: 2, invoiceAccuracy: 99, responseTime: 2, orderCompletionRate: 99, communicationScore: 95, totalOrders: 38, totalOrderValue: 55000000, avgDeliveryDays: 1 },
    },
  ];

  const vendors: Record<string, any> = {};
  for (const vd of vendorData) {
    const vu = await prisma.user.create({
      data: { ...vd.user, passwordHash, role: 'VENDOR', isActive: true, isEmailVerified: true, loginCount: Math.floor(Math.random() * 50), dateOfBirth: new Date('1990-01-01'), addressLine1: vd.vendor.addressLine1, city: vd.vendor.city, state: vd.vendor.state, pincode: vd.vendor.pincode },
    });
    const v = await prisma.vendor.create({
      data: { ...vd.vendor, userId: vu.id, approvedById: adminUser.id, approvedAt: new Date('2024-06-01'), isActive: true },
    });
    await prisma.vendorScore.create({
      data: { vendorId: v.id, ...vd.score, lastEvaluatedAt: new Date('2024-12-15') },
    });
    vendors[vd.vendor.vendorCode] = v;
  }

  // ============================================
  // 5. Approval Rules
  // ============================================
  console.log('📋 Creating approval rules...');
  await prisma.approvalRule.createMany({
    data: [
      { organizationId: org.id, level: 1, minAmount: 0, maxAmount: 50000, approverRole: 'MANAGER', description: 'Manager approval for requests up to ₹50,000', isActive: true },
      { organizationId: org.id, level: 2, minAmount: 50001, maxAmount: 500000, approverRole: 'SENIOR_MANAGER', description: 'Senior Manager approval for ₹50,001 to ₹5,00,000', isActive: true },
      { organizationId: org.id, level: 3, minAmount: 500001, approverRole: 'DIRECTOR', description: 'Director approval for requests above ₹5,00,000', isActive: true },
    ],
  });

  // ============================================
  // 6. Purchase Requests
  // ============================================
  console.log('📝 Creating purchase requests...');
  const prData = [
    { prNumber: 'PR-2024-0001', title: '20 Developer Laptops - Dell Latitude 5540', description: 'Required 20 Dell Latitude 5540 laptops for new developer hires joining in January. Specs: i7 13th Gen, 16GB RAM, 512GB SSD, 15.6" FHD.', category: 'IT Equipment', quantity: 20, estimatedUnitPrice: 85000, estimatedBudget: 1700000, priority: 'HIGH' as const, status: 'COMPLETED' as const, requiredByDate: new Date('2025-01-15'), requestedById: empEmp1.id, departmentId: departments['IT'].id, justification: 'New batch of developers starting in January. Current inventory insufficient.' },
    { prNumber: 'PR-2024-0002', title: 'Office Stationery Q1 2025', description: 'Quarterly office stationery order including A4 paper, pens, markers, sticky notes, folders, and printing supplies.', category: 'Office Supplies', quantity: 1, estimatedBudget: 35000, priority: 'LOW' as const, status: 'APPROVED' as const, requiredByDate: new Date('2025-01-05'), requestedById: empEmp2.id, departmentId: departments['HR'].id, justification: 'Regular quarterly stationery replenishment.' },
    { prNumber: 'PR-2024-0003', title: 'Ergonomic Office Chairs - 50 Units', description: 'Replace old office chairs with ergonomic chairs for the entire 3rd floor. Herman Miller Aeron or equivalent.', category: 'Furniture', quantity: 50, estimatedUnitPrice: 25000, estimatedBudget: 1250000, priority: 'MEDIUM' as const, status: 'RFQ_CREATED' as const, requiredByDate: new Date('2025-02-28'), requestedById: empEmp2.id, departmentId: departments['HR'].id, justification: 'Employee health initiative - replacing chairs older than 5 years.' },
    { prNumber: 'PR-2024-0004', title: 'Annual Security Software Licenses', description: 'Renewal of CrowdStrike Falcon endpoint security for 500 endpoints + SentinelOne for servers.', category: 'Software Licenses', quantity: 500, estimatedUnitPrice: 2500, estimatedBudget: 1250000, priority: 'URGENT' as const, status: 'PO_GENERATED' as const, requiredByDate: new Date('2025-01-01'), requestedById: empEmp1.id, departmentId: departments['IT'].id, justification: 'Current licenses expiring Dec 31. Critical for security compliance.' },
    { prNumber: 'PR-2024-0005', title: 'Marketing Event Booth Materials', description: 'Design and production of exhibition booth for TechSummit 2025. Includes backdrop, standees, brochures, and promotional items.', category: 'Marketing Materials', quantity: 1, estimatedBudget: 180000, priority: 'HIGH' as const, status: 'SUBMITTED' as const, requiredByDate: new Date('2025-02-15'), requestedById: empEmp1.id, departmentId: departments['MKT'].id, justification: 'TechSummit 2025 sponsorship confirmed. Need booth setup.' },
    { prNumber: 'PR-2024-0006', title: 'Server Room AC Maintenance', description: 'Annual maintenance contract for 4 precision AC units in the server room. Includes quarterly servicing and emergency support.', category: 'Maintenance', quantity: 4, estimatedUnitPrice: 15000, estimatedBudget: 60000, priority: 'MEDIUM' as const, status: 'UNDER_REVIEW' as const, requiredByDate: new Date('2025-01-31'), requestedById: empEmp1.id, departmentId: departments['IT'].id },
    { prNumber: 'PR-2024-0007', title: 'Cloud Infrastructure - AWS Reserved Instances', description: 'Purchase AWS Reserved Instances for production workloads. 10x m5.xlarge, 5x r5.2xlarge for 1-year term.', category: 'Cloud Services', quantity: 15, estimatedBudget: 4500000, priority: 'HIGH' as const, status: 'APPROVED' as const, requiredByDate: new Date('2025-01-10'), requestedById: empEmp1.id, departmentId: departments['IT'].id, justification: 'On-demand costs are 40% higher. RI commitment saves ₹18L annually.' },
    { prNumber: 'PR-2024-0008', title: 'Employee Onboarding Kits - 30 Units', description: 'Welcome kits for new hires: laptop bag, notebook, pen set, water bottle, t-shirt, ID card holder.', category: 'Office Supplies', quantity: 30, estimatedUnitPrice: 2500, estimatedBudget: 75000, priority: 'LOW' as const, status: 'DRAFT' as const, requiredByDate: new Date('2025-01-20'), requestedById: empEmp2.id, departmentId: departments['HR'].id },
    { prNumber: 'PR-2024-0009', title: 'Conference Room AV Equipment Upgrade', description: 'Upgrade 5 conference rooms with 75" displays, Poly video conferencing systems, and wireless presentation dongles.', category: 'IT Equipment', quantity: 5, estimatedUnitPrice: 350000, estimatedBudget: 1750000, priority: 'MEDIUM' as const, status: 'REJECTED' as const, requiredByDate: new Date('2025-03-31'), requestedById: empEmp1.id, departmentId: departments['IT'].id, rejectionReason: 'Budget not allocated for Q1. Resubmit in Q2 budget cycle.' },
    { prNumber: 'PR-2024-0010', title: 'Annual Facility Cleaning Contract', description: 'Comprehensive cleaning and housekeeping services for the 3-floor office space including washrooms, cafeteria, and common areas.', category: 'Facility Services', quantity: 1, estimatedBudget: 480000, priority: 'MEDIUM' as const, status: 'RFQ_CREATED' as const, requiredByDate: new Date('2025-01-01'), requestedById: empEmp2.id, departmentId: departments['ADM'].id, justification: 'Current contract ending Dec 31. Need new vendor selection.' },
  ];

  const purchaseRequests: Record<string, any> = {};
  for (const pr of prData) {
    purchaseRequests[pr.prNumber] = await prisma.purchaseRequest.create({ data: pr });
  }

  // ============================================
  // 7. Approvals
  // ============================================
  console.log('✅ Creating approvals...');
  const approvalData = [
    { purchaseRequestId: purchaseRequests['PR-2024-0001'].id, approvalType: 'PR_APPROVAL' as const, approverId: directorUser.id, approvalLevel: 3, status: 'APPROVED' as const, remarks: 'Approved. Critical for new hiring batch. Ensure competitive pricing through RFQ.', decidedAt: new Date('2024-11-15T10:00:00Z') },
    { purchaseRequestId: purchaseRequests['PR-2024-0002'].id, approvalType: 'PR_APPROVAL' as const, approverId: managerUser.id, approvalLevel: 1, status: 'APPROVED' as const, remarks: 'Standard quarterly order. Approved.', decidedAt: new Date('2024-12-01T14:00:00Z') },
    { purchaseRequestId: purchaseRequests['PR-2024-0003'].id, approvalType: 'PR_APPROVAL' as const, approverId: seniorMgrUser.id, approvalLevel: 2, status: 'APPROVED' as const, remarks: 'Health initiative approved. Proceed with RFQ for best pricing.', decidedAt: new Date('2024-11-20T11:00:00Z') },
    { purchaseRequestId: purchaseRequests['PR-2024-0004'].id, approvalType: 'PR_APPROVAL' as const, approverId: seniorMgrUser.id, approvalLevel: 2, status: 'APPROVED' as const, remarks: 'Critical security renewal. Fast-track approved.', decidedAt: new Date('2024-12-10T09:00:00Z') },
    { purchaseRequestId: purchaseRequests['PR-2024-0005'].id, approvalType: 'PR_APPROVAL' as const, approverId: seniorMgrUser.id, approvalLevel: 2, status: 'PENDING' as const },
    { purchaseRequestId: purchaseRequests['PR-2024-0006'].id, approvalType: 'PR_APPROVAL' as const, approverId: seniorMgrUser.id, approvalLevel: 2, status: 'PENDING' as const },
    { purchaseRequestId: purchaseRequests['PR-2024-0007'].id, approvalType: 'PR_APPROVAL' as const, approverId: directorUser.id, approvalLevel: 3, status: 'APPROVED' as const, remarks: 'Significant cost savings demonstrated. Approved for immediate procurement.', decidedAt: new Date('2024-12-05T16:00:00Z'), aiSummary: 'AI Analysis: AWS Reserved Instances offer 40% cost reduction compared to on-demand pricing. 1-year commitment aligns with projected workload growth.', aiRecommendation: 'Recommend approval. ROI positive within 3 months.' },
    { purchaseRequestId: purchaseRequests['PR-2024-0009'].id, approvalType: 'PR_APPROVAL' as const, approverId: directorUser.id, approvalLevel: 3, status: 'REJECTED' as const, remarks: 'Budget not allocated for Q1. Resubmit in Q2 budget cycle.', decidedAt: new Date('2024-12-12T13:00:00Z') },
    { purchaseRequestId: purchaseRequests['PR-2024-0010'].id, approvalType: 'PR_APPROVAL' as const, approverId: seniorMgrUser.id, approvalLevel: 2, status: 'APPROVED' as const, remarks: 'Current contract ending. Need seamless transition.', decidedAt: new Date('2024-11-25T10:00:00Z') },
  ];

  for (const a of approvalData) {
    await prisma.approval.create({ data: a });
  }

  // ============================================
  // 8. RFQs
  // ============================================
  console.log('📨 Creating RFQs...');
  const rfqData = [
    { rfqNumber: 'RFQ-2024-0001', purchaseRequestId: purchaseRequests['PR-2024-0001'].id, title: 'Supply of 20 Developer Laptops', description: 'Request for quotation for 20 business-grade laptops. Minimum specs: Intel i7 13th Gen, 16GB RAM, 512GB NVMe SSD, 15.6" FHD IPS display, Windows 11 Pro. 3-year warranty required.', quantity: 20, estimatedBudget: 1700000, priority: 'HIGH' as const, deadline: new Date('2024-12-01'), status: 'CLOSED' as const, createdById: procUser1.id, publishedAt: new Date('2024-11-18'), closedAt: new Date('2024-12-05'), evaluationCriteria: 'Price (40%), Delivery Time (20%), Warranty (15%), Vendor Rating (15%), After-sales Support (10%)' },
    { rfqNumber: 'RFQ-2024-0002', purchaseRequestId: purchaseRequests['PR-2024-0003'].id, title: 'Ergonomic Office Chairs - 50 Units', description: 'Supply of 50 ergonomic office chairs with lumbar support, adjustable armrests, and mesh back. Must support up to 120kg.', quantity: 50, estimatedBudget: 1250000, priority: 'MEDIUM' as const, deadline: new Date('2025-01-15'), status: 'QUOTATION_RECEIVED' as const, createdById: procUser1.id, publishedAt: new Date('2024-12-10'), evaluationCriteria: 'Quality (35%), Price (30%), Warranty (20%), Delivery (15%)' },
    { rfqNumber: 'RFQ-2024-0003', purchaseRequestId: purchaseRequests['PR-2024-0004'].id, title: 'Annual Security Software Licenses - 500 Endpoints', description: 'Enterprise endpoint security solution for 500 endpoints. Must include EDR, threat intelligence, and 24/7 SOC support.', quantity: 500, estimatedBudget: 1250000, priority: 'URGENT' as const, deadline: new Date('2024-12-20'), status: 'VENDOR_SELECTED' as const, createdById: procUser1.id, publishedAt: new Date('2024-12-12'), evaluationCriteria: 'Technical Compliance (40%), Price (25%), Support SLA (20%), Vendor Track Record (15%)' },
    { rfqNumber: 'RFQ-2024-0004', purchaseRequestId: purchaseRequests['PR-2024-0010'].id, title: 'Annual Facility Cleaning & Housekeeping Services', description: 'Comprehensive cleaning services for 3-floor office space (50,000 sq ft). Daily cleaning, washroom maintenance, cafeteria, and periodic deep cleaning.', quantity: 1, estimatedBudget: 480000, priority: 'MEDIUM' as const, deadline: new Date('2024-12-25'), status: 'UNDER_REVIEW' as const, createdById: procUser2.id, publishedAt: new Date('2024-12-05'), evaluationCriteria: 'Service Quality (35%), Price (30%), Manpower Deployment (20%), References (15%)' },
    { rfqNumber: 'RFQ-2024-0005', purchaseRequestId: purchaseRequests['PR-2024-0002'].id, title: 'Q1 2025 Office Stationery Supply', description: 'Bulk order for office stationery: A4 paper (200 reams), pens, markers, folders, sticky notes, and general supplies.', quantity: 1, estimatedBudget: 35000, priority: 'LOW' as const, deadline: new Date('2024-12-28'), status: 'PUBLISHED' as const, createdById: procUser2.id, publishedAt: new Date('2024-12-15') },
  ];

  const rfqs: Record<string, any> = {};
  for (const r of rfqData) {
    rfqs[r.rfqNumber] = await prisma.rFQ.create({ data: r });
  }

  // ============================================
  // 9. RFQ-Vendor Mappings
  // ============================================
  console.log('🔗 Creating RFQ-vendor mappings...');
  const mappings: Record<string, any> = {};

  // RFQ-001: Laptops → IT Hardware vendors
  mappings['RFQ1-V1'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0001'].id, vendorId: vendors['VND-001'].id, status: 'SELECTED', viewedAt: new Date('2024-11-19'), isSelected: true } });
  mappings['RFQ1-V2'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0001'].id, vendorId: vendors['VND-002'].id, status: 'QUOTED', viewedAt: new Date('2024-11-19') } });
  mappings['RFQ1-V10'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0001'].id, vendorId: vendors['VND-010'].id, status: 'DECLINED', viewedAt: new Date('2024-11-20'), declineReason: 'Not in our product portfolio' } });

  // RFQ-002: Chairs → Furniture vendors
  mappings['RFQ2-V4'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0002'].id, vendorId: vendors['VND-004'].id, status: 'QUOTED', viewedAt: new Date('2024-12-11') } });
  mappings['RFQ2-V3'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0002'].id, vendorId: vendors['VND-003'].id, status: 'QUOTED', viewedAt: new Date('2024-12-11') } });

  // RFQ-003: Security Software
  mappings['RFQ3-V10'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0003'].id, vendorId: vendors['VND-010'].id, status: 'SELECTED', viewedAt: new Date('2024-12-13'), isSelected: true } });
  mappings['RFQ3-V2'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0003'].id, vendorId: vendors['VND-002'].id, status: 'QUOTED', viewedAt: new Date('2024-12-13') } });

  // RFQ-004: Cleaning
  mappings['RFQ4-V6'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0004'].id, vendorId: vendors['VND-006'].id, status: 'QUOTED', viewedAt: new Date('2024-12-06') } });

  // RFQ-005: Stationery
  mappings['RFQ5-V3'] = await prisma.rFQVendorMapping.create({ data: { rfqId: rfqs['RFQ-2024-0005'].id, vendorId: vendors['VND-003'].id, status: 'INVITED' } });

  // ============================================
  // 10. Quotations
  // ============================================
  console.log('💰 Creating quotations...');

  // RFQ-001 quotes
  const qt1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0001', rfqVendorMappingId: mappings['RFQ1-V1'].id,
      rfqId: rfqs['RFQ-2024-0001'].id, vendorId: vendors['VND-001'].id,
      unitPrice: 82000, totalPrice: 1640000, taxPercentage: 18, taxAmount: 295200, grandTotal: 1935200,
      deliveryDays: 7, warrantyMonths: 36, warrantyDetails: '3-year comprehensive on-site warranty with next business day replacement.',
      supportDetails: '24/7 toll-free support, dedicated account manager', paymentTerms: 'Net 30',
      validityDays: 30, technicalCompliance: true, isAiRecommended: true, aiScore: 92,
      aiReasoning: 'Best overall value. Competitive pricing at ₹82K/unit with excellent 3-year warranty and highest vendor trust score (92). On-time delivery rate: 95%.',
      status: 'ACCEPTED', submittedAt: new Date('2024-11-25'),
    },
  });

  await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0002', rfqVendorMappingId: mappings['RFQ1-V2'].id,
      rfqId: rfqs['RFQ-2024-0001'].id, vendorId: vendors['VND-002'].id,
      unitPrice: 79000, totalPrice: 1580000, taxPercentage: 18, taxAmount: 284400, grandTotal: 1864400,
      deliveryDays: 14, warrantyMonths: 12, warrantyDetails: '1-year standard warranty.',
      supportDetails: 'Email support during business hours', paymentTerms: 'Net 45',
      validityDays: 15, technicalCompliance: true, isAiRecommended: false, aiScore: 71,
      aiReasoning: 'Lower price but significantly shorter warranty (1 year vs 3 years). Longer delivery time of 14 days. Limited support options.',
      status: 'REJECTED', submittedAt: new Date('2024-11-26'),
    },
  });

  // RFQ-002 quotes (chairs)
  await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0003', rfqVendorMappingId: mappings['RFQ2-V4'].id,
      rfqId: rfqs['RFQ-2024-0002'].id, vendorId: vendors['VND-004'].id,
      unitPrice: 22000, totalPrice: 1100000, taxPercentage: 18, taxAmount: 198000, grandTotal: 1298000,
      deliveryDays: 21, warrantyMonths: 60, warrantyDetails: '5-year structural warranty.',
      supportDetails: 'Free assembly and installation included', paymentTerms: 'Net 30',
      validityDays: 30, technicalCompliance: true,
      status: 'SUBMITTED', submittedAt: new Date('2024-12-15'),
    },
  });

  await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0004', rfqVendorMappingId: mappings['RFQ2-V3'].id,
      rfqId: rfqs['RFQ-2024-0002'].id, vendorId: vendors['VND-003'].id,
      unitPrice: 24500, totalPrice: 1225000, taxPercentage: 18, taxAmount: 220500, grandTotal: 1445500,
      deliveryDays: 14, warrantyMonths: 36, warrantyDetails: '3-year warranty on mechanism.',
      supportDetails: 'Installation included. Replacement parts available.', paymentTerms: 'Net 15',
      validityDays: 20, technicalCompliance: true,
      status: 'SUBMITTED', submittedAt: new Date('2024-12-16'),
    },
  });

  // RFQ-003 quotes (security)
  await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0005', rfqVendorMappingId: mappings['RFQ3-V10'].id,
      rfqId: rfqs['RFQ-2024-0003'].id, vendorId: vendors['VND-010'].id,
      unitPrice: 2200, totalPrice: 1100000, taxPercentage: 18, taxAmount: 198000, grandTotal: 1298000,
      deliveryDays: 1, warrantyMonths: 12, warrantyDetails: 'Annual license with auto-renewal.',
      supportDetails: '24/7 SOC support, dedicated CISO advisory, quarterly threat reports', paymentTerms: 'Net 30',
      validityDays: 30, technicalCompliance: true, isAiRecommended: true, aiScore: 96,
      aiReasoning: 'Highest vendor trust score (95). Complete EDR + SOC solution. Fastest deployment (1 day). Best-in-class SLA with 24/7 support.',
      status: 'ACCEPTED', submittedAt: new Date('2024-12-16'),
    },
  });

  await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0006', rfqVendorMappingId: mappings['RFQ3-V2'].id,
      rfqId: rfqs['RFQ-2024-0003'].id, vendorId: vendors['VND-002'].id,
      unitPrice: 1900, totalPrice: 950000, taxPercentage: 18, taxAmount: 171000, grandTotal: 1121000,
      deliveryDays: 3, warrantyMonths: 12, supportDetails: 'Business hours support. Basic threat monitoring.',
      paymentTerms: 'Net 30', validityDays: 30, technicalCompliance: false, isAiRecommended: false, aiScore: 62,
      aiReasoning: 'Lower price but does not meet technical compliance for EDR requirements. Limited SOC capabilities.',
      status: 'REJECTED', submittedAt: new Date('2024-12-17'),
    },
  });

  // RFQ-004 quote (cleaning)
  await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2024-0007', rfqVendorMappingId: mappings['RFQ4-V6'].id,
      rfqId: rfqs['RFQ-2024-0004'].id, vendorId: vendors['VND-006'].id,
      unitPrice: 420000, totalPrice: 420000, taxPercentage: 18, taxAmount: 75600, grandTotal: 495600,
      deliveryDays: 1, warrantyMonths: 12, warrantyDetails: 'Annual contract with monthly billing.',
      supportDetails: 'Dedicated site supervisor. Emergency deep cleaning within 4 hours.', paymentTerms: 'Monthly',
      validityDays: 30, technicalCompliance: true,
      status: 'UNDER_REVIEW', submittedAt: new Date('2024-12-10'),
    },
  });

  // ============================================
  // 11. Purchase Orders
  // ============================================
  console.log('📦 Creating purchase orders...');

  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-0001', purchaseRequestId: purchaseRequests['PR-2024-0001'].id,
      rfqId: rfqs['RFQ-2024-0001'].id, quotationId: qt1.id, vendorId: vendors['VND-001'].id,
      subtotal: 1640000, taxPercentage: 18, taxAmount: 295200, grandTotal: 1935200,
      deliveryDate: new Date('2024-12-15'), deliveryAddress: '42, Tech Park, Whitefield, Bengaluru 560066',
      paymentTerms: 'Net 30', status: 'COMPLETED',
      issuedById: procUser1.id, issuedAt: new Date('2024-12-06'), acknowledgedAt: new Date('2024-12-06'),
    },
  });

  // PO line items
  await prisma.pOLineItem.create({
    data: { purchaseOrderId: po1.id, itemNumber: 1, description: 'Dell Latitude 5540 Laptop - i7/16GB/512GB', quantity: 20, unitPrice: 82000, totalPrice: 1640000, hsnCode: '8471.30' },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-0002', purchaseRequestId: purchaseRequests['PR-2024-0004'].id,
      rfqId: rfqs['RFQ-2024-0003'].id, quotationId: qt1.id, vendorId: vendors['VND-010'].id,
      subtotal: 1100000, taxPercentage: 18, taxAmount: 198000, grandTotal: 1298000,
      deliveryDate: new Date('2024-12-22'), deliveryAddress: '42, Tech Park, Whitefield, Bengaluru 560066',
      paymentTerms: 'Net 30', status: 'DELIVERED',
      issuedById: procUser1.id, issuedAt: new Date('2024-12-18'), acknowledgedAt: new Date('2024-12-18'),
    },
  });

  await prisma.pOLineItem.create({
    data: { purchaseOrderId: po2.id, itemNumber: 1, description: 'SecureNet Enterprise EDR - 500 Endpoint Licenses', quantity: 500, unitPrice: 2200, totalPrice: 1100000, hsnCode: '8523.80' },
  });

  // ============================================
  // 12. Goods Receipts
  // ============================================
  console.log('📥 Creating goods receipts...');

  const gr1 = await prisma.goodsReceipt.create({
    data: {
      grnNumber: 'GRN-2024-0001', purchaseOrderId: po1.id, vendorId: vendors['VND-001'].id,
      receivedById: procUser1.id, receivedDate: new Date('2024-12-13'),
      quantityOrdered: 20, quantityReceived: 20, quantityAccepted: 19, quantityRejected: 1,
      condition: 'PARTIAL_DAMAGE', inspectionNotes: '19 laptops in perfect condition. 1 unit has damaged screen - returned for replacement.',
      status: 'PARTIALLY_RECEIVED',
    },
  });

  const gr2 = await prisma.goodsReceipt.create({
    data: {
      grnNumber: 'GRN-2024-0002', purchaseOrderId: po2.id, vendorId: vendors['VND-010'].id,
      receivedById: procUser1.id, receivedDate: new Date('2024-12-21'),
      quantityOrdered: 500, quantityReceived: 500, quantityAccepted: 500, quantityRejected: 0,
      condition: 'GOOD', inspectionNotes: 'All 500 endpoint licenses activated successfully. SOC integration completed.',
      status: 'RECEIVED',
    },
  });

  // ============================================
  // 13. Invoices
  // ============================================
  console.log('🧾 Creating invoices...');

  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-0001', vendorInvoiceNumber: 'TN/2024/1234',
      purchaseOrderId: po1.id, vendorId: vendors['VND-001'].id,
      invoiceDate: new Date('2024-12-14'), dueDate: new Date('2025-01-13'),
      subtotal: 1640000, cgstAmount: 147600, sgstAmount: 147600, totalTax: 295200, grandTotal: 1935200,
      status: 'PAID', submittedById: procUser1.id, approvedById: managerUser.id,
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-0002', vendorInvoiceNumber: 'SN/2024/5678',
      purchaseOrderId: po2.id, vendorId: vendors['VND-010'].id,
      invoiceDate: new Date('2024-12-22'), dueDate: new Date('2025-01-21'),
      subtotal: 1100000, igstAmount: 198000, totalTax: 198000, grandTotal: 1298000,
      status: 'APPROVED', submittedById: procUser1.id, approvedById: managerUser.id,
    },
  });

  // ============================================
  // 14. Three-Way Matches
  // ============================================
  console.log('🔍 Creating three-way matches...');

  await prisma.threeWayMatch.create({
    data: {
      invoiceId: inv1.id, purchaseOrderId: po1.id, goodsReceiptId: gr1.id,
      quantityMatch: false, priceMatch: true, taxMatch: true,
      overallStatus: 'QUANTITY_MISMATCH', quantityVariance: 1,
      notes: 'PO: 20 units, GRN: 19 accepted (1 damaged). Invoice billed for 20 - needs vendor credit note for 1 unit.',
      verifiedById: procUser1.id,
    },
  });

  await prisma.threeWayMatch.create({
    data: {
      invoiceId: inv2.id, purchaseOrderId: po2.id, goodsReceiptId: gr2.id,
      quantityMatch: true, priceMatch: true, taxMatch: true,
      overallStatus: 'MATCHED',
      notes: 'Perfect match. All 500 licenses delivered and billed correctly.',
      verifiedById: procUser1.id,
    },
  });

  // ============================================
  // 15. Payments
  // ============================================
  console.log('💳 Creating payments...');

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-0001', invoiceId: inv1.id, vendorId: vendors['VND-001'].id,
      amount: 1935200, paymentMethod: 'NEFT', paymentDate: new Date('2024-12-28'),
      referenceNumber: 'NEFT/2024/TN001234', status: 'COMPLETED',
      remarks: 'Full payment processed. Credit note for damaged unit to be adjusted in next invoice.',
      processedById: adminUser.id,
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2024-0002', invoiceId: inv2.id, vendorId: vendors['VND-010'].id,
      amount: 1298000, paymentMethod: 'RTGS', paymentDate: new Date('2025-01-05'),
      referenceNumber: 'RTGS/2025/SN005678', status: 'PROCESSING',
      processedById: adminUser.id,
    },
  });

  // ============================================
  // 16. Notifications
  // ============================================
  console.log('🔔 Creating notifications...');
  const notificationData = [
    { userId: managerUser.id, title: 'New Approval Required', message: 'Purchase request PR-2024-0005 for "Marketing Event Booth Materials" (₹1,80,000) requires your approval.', type: 'APPROVAL_REQUIRED' as const, referenceType: 'PurchaseRequest', referenceId: purchaseRequests['PR-2024-0005'].id, priority: 'HIGH' as const },
    { userId: seniorMgrUser.id, title: 'New Approval Required', message: 'Purchase request PR-2024-0006 for "Server Room AC Maintenance" (₹60,000) requires your approval.', type: 'APPROVAL_REQUIRED' as const, referenceType: 'PurchaseRequest', referenceId: purchaseRequests['PR-2024-0006'].id, priority: 'MEDIUM' as const },
    { userId: procUser1.id, title: 'Quotation Received', message: 'FurnishPro Ltd has submitted quotation QT-2024-0003 for RFQ-2024-0002 (Ergonomic Office Chairs).', type: 'QUOTATION_SUBMITTED' as const, referenceType: 'Quotation', priority: 'MEDIUM' as const },
    { userId: procUser1.id, title: 'Quotation Received', message: 'OfficeKart India has submitted quotation QT-2024-0004 for RFQ-2024-0002 (Ergonomic Office Chairs).', type: 'QUOTATION_SUBMITTED' as const, referenceType: 'Quotation', priority: 'MEDIUM' as const },
    { userId: empUser1.id, title: 'Request Approved', message: 'Your purchase request PR-2024-0001 for "20 Developer Laptops" has been approved by Director Anita Desai.', type: 'INFO' as const, referenceType: 'PurchaseRequest', referenceId: purchaseRequests['PR-2024-0001'].id, priority: 'MEDIUM' as const, isRead: true, readAt: new Date('2024-11-16') },
    { userId: empUser1.id, title: 'Request Rejected', message: 'Your purchase request PR-2024-0009 for "Conference Room AV Equipment" has been rejected. Reason: Budget not allocated for Q1.', type: 'INFO' as const, referenceType: 'PurchaseRequest', referenceId: purchaseRequests['PR-2024-0009'].id, priority: 'HIGH' as const, isRead: true, readAt: new Date('2024-12-13') },
    { userId: adminUser.id, title: 'Risk Alert: Vendor Concentration', message: 'TechNova Solutions has won 3 out of 4 IT hardware RFQs in the last quarter. Potential vendor favoritism detected.', type: 'RISK_ALERT' as const, priority: 'HIGH' as const },
    { userId: adminUser.id, title: 'Payment Processed', message: 'Payment PAY-2024-0001 of ₹19,35,200 to TechNova Solutions has been completed via NEFT.', type: 'PAYMENT_COMPLETED' as const, priority: 'LOW' as const, isRead: true, readAt: new Date('2024-12-29') },
  ];

  for (const n of notificationData) {
    await prisma.notification.create({ data: n });
  }

  // ============================================
  // 17. Activity Logs
  // ============================================
  console.log('📜 Creating activity logs...');
  const logData = [
    { userId: empUser1.id, action: 'CREATED' as const, entityType: 'PurchaseRequest', entityId: purchaseRequests['PR-2024-0001'].id, description: 'Amit Verma created purchase request PR-2024-0001: 20 Developer Laptops', createdAt: new Date('2024-11-10T09:00:00Z') },
    { userId: empUser1.id, action: 'SUBMITTED' as const, entityType: 'PurchaseRequest', entityId: purchaseRequests['PR-2024-0001'].id, description: 'Purchase request PR-2024-0001 submitted for approval', createdAt: new Date('2024-11-10T09:15:00Z') },
    { userId: directorUser.id, action: 'APPROVED' as const, entityType: 'PurchaseRequest', entityId: purchaseRequests['PR-2024-0001'].id, description: 'Director Anita Desai approved PR-2024-0001 (₹17,00,000)', createdAt: new Date('2024-11-15T10:00:00Z') },
    { userId: procUser1.id, action: 'CREATED' as const, entityType: 'RFQ', entityId: rfqs['RFQ-2024-0001'].id, description: 'Suresh Menon created RFQ-2024-0001 for 20 Developer Laptops', createdAt: new Date('2024-11-18T11:00:00Z') },
    { userId: procUser1.id, action: 'PUBLISHED' as const, entityType: 'RFQ', entityId: rfqs['RFQ-2024-0001'].id, description: 'RFQ-2024-0001 published to 3 vendors', createdAt: new Date('2024-11-18T11:30:00Z') },
    { userId: procUser1.id, action: 'GENERATED' as const, entityType: 'PurchaseOrder', entityId: po1.id, description: 'Purchase order PO-2024-0001 generated for TechNova Solutions (₹19,35,200)', createdAt: new Date('2024-12-06T14:00:00Z') },
    { userId: procUser1.id, action: 'CREATED' as const, entityType: 'GoodsReceipt', entityId: gr1.id, description: 'Goods receipt GRN-2024-0001 recorded - 19/20 laptops accepted', createdAt: new Date('2024-12-13T16:00:00Z') },
    { userId: adminUser.id, action: 'LOGIN' as const, entityType: 'User', entityId: adminUser.id, description: 'Admin Rajesh Kumar logged in', createdAt: new Date('2024-12-20T09:00:00Z') },
    { userId: managerUser.id, action: 'LOGIN' as const, entityType: 'User', entityId: managerUser.id, description: 'Manager Priya Sharma logged in', createdAt: new Date('2024-12-20T08:30:00Z') },
    { userId: procUser1.id, action: 'CREATED' as const, entityType: 'RFQ', entityId: rfqs['RFQ-2024-0002'].id, description: 'RFQ-2024-0002 created for Ergonomic Office Chairs', createdAt: new Date('2024-12-10T10:00:00Z') },
    { userId: empUser2.id, action: 'CREATED' as const, entityType: 'PurchaseRequest', entityId: purchaseRequests['PR-2024-0002'].id, description: 'Sneha Gupta created PR-2024-0002: Office Stationery Q1 2025', createdAt: new Date('2024-11-25T11:00:00Z') },
    { userId: managerUser.id, action: 'APPROVED' as const, entityType: 'PurchaseRequest', entityId: purchaseRequests['PR-2024-0002'].id, description: 'Manager Priya Sharma approved PR-2024-0002 (₹35,000)', createdAt: new Date('2024-12-01T14:00:00Z') },
  ];

  for (const l of logData) {
    await prisma.activityLog.create({ data: l });
  }

  // ============================================
  // 18. Risk Alerts
  // ============================================
  console.log('⚠️ Creating risk alerts...');
  const riskData = [
    { type: 'VENDOR_FAVORITISM' as const, severity: 'HIGH' as const, title: 'Potential Vendor Favoritism — TechNova Solutions', description: 'TechNova Solutions (VND-001) has been selected in 3 out of 4 IT hardware RFQs in the last 6 months. Win rate of 75% is significantly above the 25% threshold.', vendorId: vendors['VND-001'].id, aiConfidence: 85, status: 'ACTIVE' as const },
    { type: 'DELIVERY_DELAY' as const, severity: 'MEDIUM' as const, title: 'Delivery Delay Pattern — FurnishPro Ltd', description: 'FurnishPro Ltd (VND-004) has delivered late on 4 out of last 10 orders. Average delay: 5.3 days. On-time delivery rate dropped from 88% to 80%.', vendorId: vendors['VND-004'].id, aiConfidence: 72, status: 'ACTIVE' as const },
    { type: 'PRICE_ANOMALY' as const, severity: 'MEDIUM' as const, title: 'Price Increase Anomaly — DigitalEdge Marketing', description: 'DigitalEdge Marketing quoted 35% higher than market average for recent marketing materials RFQ. Historical quotes were within 10% of market rate.', vendorId: vendors['VND-009'].id, aiConfidence: 68, status: 'ACTIVE' as const },
    { type: 'UNDERPERFORMING_VENDOR' as const, severity: 'LOW' as const, title: 'Underperforming Vendor — PrintMax Services', description: 'PrintMax Services trust score dropped below 75 threshold. Key issues: complaint rate 15%, response time 18 hours, order completion 85%.', vendorId: vendors['VND-005'].id, aiConfidence: 90, status: 'ACKNOWLEDGED' as const },
    { type: 'INVOICE_MISMATCH' as const, severity: 'HIGH' as const, title: 'Invoice Quantity Mismatch — PO-2024-0001', description: 'Invoice INV-2024-0001 billed for 20 units but GRN-2024-0001 accepted only 19. ₹82,000 overbilling detected. Credit note required.', vendorId: vendors['VND-001'].id, referenceType: 'Invoice', referenceId: inv1.id, aiConfidence: 99, status: 'RESOLVED' as const, resolvedById: procUser1.id, resolvedAt: new Date('2024-12-29'), resolutionNotes: 'Credit note CN-2024-0001 received from vendor for ₹82,000 + GST.' },
    { type: 'CONCENTRATION_RISK' as const, severity: 'MEDIUM' as const, title: 'Vendor Concentration Risk — IT Software', description: 'Only 2 active vendors in IT_SOFTWARE category. SecureNet handles 70% of software procurement. Diversification recommended.', aiConfidence: 78, status: 'ACTIVE' as const },
  ];

  for (const r of riskData) {
    await prisma.riskAlert.create({ data: r });
  }

  // ============================================
  // 19. Analytics Snapshots (30 days)
  // ============================================
  console.log('📊 Creating analytics snapshots...');
  const baseDate = new Date('2024-11-21');
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    await prisma.analyticsSnapshot.create({
      data: {
        snapshotDate: date,
        totalVendors: 10 + Math.floor(i / 10),
        totalPRs: 5 + Math.floor(i * 0.4),
        pendingApprovals: Math.max(0, 3 - Math.floor(i / 8) + Math.floor(Math.random() * 3)),
        activeRFQs: 2 + Math.floor(i / 7),
        totalSpend: 500000 + i * 120000 + Math.random() * 50000,
        avgCycleTimeDays: 8.5 - i * 0.05 + Math.random() * 0.5,
        approvalSpeedHours: 12 - i * 0.15 + Math.random() * 2,
        vendorReliabilityScore: 82 + i * 0.2 + Math.random() * 2,
        procurementHealthScore: 78 + i * 0.3 + Math.random() * 1.5,
        topVendorId: vendors['VND-001'].id,
        departmentSpendJson: { IT: 450000 + i * 30000, HR: 120000 + i * 5000, OPS: 200000 + i * 15000, MKT: 80000 + i * 8000, ADM: 150000 + i * 10000 },
        categorySpendJson: { IT_HARDWARE: 350000 + i * 25000, IT_SOFTWARE: 200000 + i * 20000, OFFICE_SUPPLIES: 50000 + i * 3000, FURNITURE: 100000 + i * 10000, SERVICES: 80000 + i * 5000 },
      },
    });
  }

  console.log('\n✅ Seed completed successfully!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Password for ALL users: VendorBridge@2024');
  console.log('');
  console.log('  ADMIN:               admin@vendorbridge.in');
  console.log('  MANAGER:             priya.sharma@vendorbridge.in');
  console.log('  SENIOR MANAGER:      vikram.patel@vendorbridge.in');
  console.log('  DIRECTOR:            anita.desai@vendorbridge.in');
  console.log('  PROCUREMENT OFFICER: suresh.menon@vendorbridge.in');
  console.log('  PROCUREMENT OFFICER: kavita.reddy@vendorbridge.in');
  console.log('  EMPLOYEE:            amit.verma@vendorbridge.in');
  console.log('  EMPLOYEE:            sneha.gupta@vendorbridge.in');
  console.log('  EMPLOYEE:            rohan.joshi@vendorbridge.in');
  console.log('  VENDOR:              vendor@technova.in');
  console.log('  VENDOR:              vendor@securenet.in');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
