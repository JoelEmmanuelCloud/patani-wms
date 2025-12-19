# PAT-ANI GRAINS LIMITED - Warehouse Management System

A complete, production-ready warehouse management system built with Next.js 14+, TypeScript, and MongoDB for PAT-ANI GRAINS LIMITED, a Nigerian grain trading company.

## Features

### Core Modules

1. **Inventory Management**
   - Add, edit, and delete inventory items
   - Track stock levels with automatic status (In Stock, Low Stock, Out of Stock)
   - Search and filter by category
   - Real-time stock value calculation
   - Supplier information management

2. **Customer Management**
   - Comprehensive customer records
   - Balance tracking (credit/debit)
   - Customer type classification (Retail, Wholesale, Distributor, Individual)
   - Order and payment history
   - Debtor list and outstanding balances

3. **Order Management**
   - Multi-item order creation
   - Automatic inventory deduction
   - Customer balance updates
   - Order status tracking
   - Payment status monitoring
   - Delivery management
   - **Transaction-safe**: All operations use MongoDB transactions

4. **Payment Management**
   - Record customer payments
   - Link payments to specific orders
   - Multiple payment methods (Cash, Bank Transfer, POS, etc.)
   - Automatic balance reconciliation
   - Payment history tracking

5. **Expense Management**
   - Categorized business expenses
   - Vendor tracking
   - Monthly expense summaries
   - Tax-deductible expense marking

6. **Tax Management (Nigerian Taxes)**
   - VAT (7.5%)
   - Company Income Tax
   - Withholding Tax (WHT)
   - Import/Export duties
   - Due date tracking
   - Payment recording
   - Overdue alerts

7. **Dashboard & Analytics**
   - Real-time business metrics
   - Sales statistics
   - Profitability calculations
   - Inventory value tracking
   - Outstanding balances
   - Low stock alerts
   - Tax notifications

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **UI Components**: Custom components with Radix UI patterns
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd patani-wms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/patani-wms?retryWrites=true&w=majority
NODE_ENV=development
```

To get your MongoDB URI:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier available)
3. Create a database user
4. Get your connection string
5. Replace `<password>` with your database user password

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
patani-wms/
├── app/
│   ├── api/
│   │   ├── inventory/          # Inventory API routes
│   │   ├── customers/          # Customer API routes
│   │   ├── orders/             # Order API routes
│   │   ├── payments/           # Payment API routes
│   │   ├── expenses/           # Expense API routes
│   │   ├── taxes/              # Tax API routes
│   │   └── reports/            # Reports & analytics API
│   ├── inventory/              # Inventory management page
│   ├── layout.tsx              # Root layout with sidebar
│   ├── page.tsx                # Dashboard
│   └── globals.css             # Global styles
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx         # Navigation sidebar
│   └── ui/                     # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       └── Table.tsx
├── lib/
│   ├── db/
│   │   └── mongodb.ts          # MongoDB connection
│   ├── models/                 # Mongoose models
│   │   ├── Inventory.ts
│   │   ├── Customer.ts
│   │   ├── Order.ts
│   │   ├── Payment.ts
│   │   ├── Expense.ts
│   │   └── Tax.ts
│   ├── validations/            # Zod schemas
│   └── utils/                  # Utility functions
│       ├── formatters.ts       # Currency, date formatters
│       ├── generators.ts       # Auto-number generation
│       ├── api-helpers.ts      # API response helpers
│       └── cn.ts               # Class name merger
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Routes

### Inventory
- `GET /api/inventory` - List all inventory items
- `POST /api/inventory` - Create new item
- `GET /api/inventory/[id]` - Get single item
- `PUT /api/inventory/[id]` - Update item
- `DELETE /api/inventory/[id]` - Delete item

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer with history
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order (with transaction)
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Cancel order (restores inventory)

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Record payment (with transaction)
- `GET /api/payments/[id]` - Get single payment
- `PUT /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get single expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Taxes
- `GET /api/taxes` - List all tax records
- `POST /api/taxes` - Create new tax record
- `GET /api/taxes/[id]` - Get single tax record
- `PUT /api/taxes/[id]` - Update tax record
- `DELETE /api/taxes/[id]` - Delete tax record

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics

## Features Deep Dive

### Transaction Handling

The system uses MongoDB transactions to ensure data consistency:

**Order Creation:**
```typescript
1. Start transaction
2. Create order
3. Deduct inventory quantities
4. Update customer balance
5. Commit or rollback on error
```

**Payment Recording:**
```typescript
1. Start transaction
2. Create payment record
3. Update customer balance
4. Update order payment status
5. Commit or rollback on error
```

### Auto-Generated Numbers

The system automatically generates unique numbers for:
- Orders: `ORD-YYMM-00001`
- Payments: `PAY-YYMM-00001`
- Expenses: `EXP-YYMM-00001`
- Taxes: `TAX-YYMM-00001`

### Nigerian Currency Formatting

All monetary values are formatted in Nigerian Naira (₦) with proper thousand separators:
- Input: `1000000`
- Output: `₦1,000,000`

### Status Colors

The system uses consistent color coding:
- **Green**: Paid, Completed, In Stock, Active
- **Yellow**: Pending, Partial, Low Stock
- **Red**: Unpaid, Cancelled, Out of Stock, Overdue
- **Blue**: Processing, In Transit

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`

6. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Usage Examples

### Example 1: Adding Inventory

```typescript
Item Name: Rice
Brand: Golden
Category: Rice
Unit: Bag
Quantity: 10000
Unit Price: ₦45,000
Location: Warehouse A, Section 1
```

### Example 2: Creating an Order

```typescript
Customer: Kabiru (08012345678)
Items:
  - Golden Rice: 500 bags × ₦45,000 = ₦22,500,000
Subtotal: ₦22,500,000
Discount: ₦0
Tax: ₦0
Amount Paid: ₦22,500,000
Balance: ₦0
```

### Example 3: Recording a Payment

```typescript
Customer: Kabiru
Amount: ₦5,000,000
Payment Method: Bank Transfer
Reference: TRF/2025/12345
```

### Example 4: Adding an Expense

```typescript
Category: Transportation
Description: Delivery to Lagos
Amount: ₦150,000
Vendor: Transport Services Ltd
Payment Method: Cash
```

### Example 5: Recording Tax

```typescript
Tax Type: VAT
Rate: 7.5%
Taxable Amount: ₦10,000,000
Tax Amount: ₦750,000
Due Date: 2025-01-21
```

## Company Information

**PAT-ANI GRAINS LIMITED**
- Address: 7 Ichegbo Street, Eligbolo Road, Off Rumukoro, PH
- Phone: 08064881409, 08165443175
- Email: info@patanigrains.ng

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Extending the System

The Inventory Management page serves as a complete template for implementing other modules. To add similar pages for Customers, Orders, Payments, Expenses, or Taxes:

1. Copy the pattern from `app/inventory/page.tsx`
2. Adjust the API endpoints
3. Modify the form fields based on the model schema
4. Update table columns as needed

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **MongoDB**: Use MongoDB Atlas with IP whitelisting
3. **Validation**: All inputs are validated with Zod schemas
4. **Transactions**: Critical operations use MongoDB transactions
5. **Error Handling**: Comprehensive error handling throughout

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
1. Check your `MONGODB_URI` in `.env.local`
2. Verify your IP is whitelisted in MongoDB Atlas
3. Ensure your database user credentials are correct

### Build Errors

**Error**: `Type error: Cannot find module`

**Solution**:
1. Delete `node_modules` and `.next` folders
2. Run `npm install` again
3. Run `npm run build`

### Vercel Deployment Issues

**Error**: `Error: Cannot find module 'mongoose'`

**Solution**:
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Check that `package.json` is correctly configured

## License

Proprietary - PAT-ANI GRAINS LIMITED

## Support

For issues and questions, contact:
- Email: info@patanigrains.ng
- Phone: 08064881409, 08165443175

---

Built with ❤️ for PAT-ANI GRAINS LIMITED
