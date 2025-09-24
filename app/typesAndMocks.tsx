import { Dimensions } from "react-native";

export const screenWidth = Dimensions.get("window").width;

// Define the shape of your data
export interface DashboardData {
    ownerName: string;
    currentDate: string;
    dailySales: { dailySales: number };
    weeklySales: { weeklySales: number };
    monthSales: { monthSales: number };
    sales: number[];
    expenses: number[];
    losses: number[];
    netprofits: number[];
    productSalesData: {
        labels: string[];
        datasets: [{
            data: number[];
            color: (opacity: number) => string;
        }];
    };
    profitChartData: {
        labels: string[];
        datasets: [{
            data: number[];
            color: (opacity: number) => string;
            strokeWidth: number;
        }];
    };
    months: string[];
}

export interface Product {
    prod_code: string;
    barcode: string;
    name: string;
    description: string;
    cost_price: number;
    selling_price: number;
    unit: string;
    stock: number;
    category_id: string;
    prod_image: string;
}

export interface Category {
    category_id: string;
    category: string;
}

export interface Unit {
    unit_id: string;
    unit: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
    amount: number;
}

export interface CartSummary {
    total_quantity: number;
    total_amount: number;
}

// Helper function for number formatting
export const formatPeso = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatK = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return amount >= 1000 ? `₱${(amount / 1000).toFixed(1)}k` : formatPeso(amount);
};

export const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return 'Increased!';
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
};

// Generate mock data that simulates a backend API response
export const generateMockBackendData = () => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const generateMonthlyData = (base: number, growth: number) => {
        let data: number[] = [];
        let value = base;
        for (let i = 0; i < 12; i++) {
            value += (Math.random() - 0.5) * growth;
            data.push(Math.round(value));
        }
        return data;
    };

    const sales = generateMonthlyData(25000, 5000);
    const expenses = generateMonthlyData(15000, 4000);
    const losses = generateMonthlyData(1000, 1000);
    const netprofits = sales.map((s, i) => s - expenses[i] - losses[i]);

    const categories = ['Electronics', 'Home Goods', 'Apparel', 'Books'];
    const productSales = categories.map((cat) => ({
        name: cat,
        sales: Math.round(Math.random() * (20000 - 5000) + 5000),
    }));

    const mockProducts: Product[] = [
        { prod_code: '001', barcode: '1234567890', name: 'Laptop', description: 'A powerful laptop', cost_price: 50000, selling_price: 60000, unit: 'pcs', stock: 10, category_id: 'cat1', prod_image: 'https://placehold.co/64x64/EFEFEF/grey?text=Laptop' },
        { prod_code: '002', barcode: '0987654321', name: 'Mouse', description: 'Wireless mouse', cost_price: 500, selling_price: 750, unit: 'pcs', stock: 50, category_id: 'cat1', prod_image: 'https://placehold.co/64x64/EFEFEF/grey?text=Mouse' },
        { prod_code: '003', barcode: '1122334455', name: 'T-Shirt', description: 'Cotton t-shirt', cost_price: 200, selling_price: 350, unit: 'pcs', stock: 100, category_id: 'cat3', prod_image: 'https://placehold.co/64x64/EFEFEF/grey?text=Shirt' },
        { prod_code: '004', barcode: '5566778899', name: 'Keyboard', description: 'Mechanical keyboard', cost_price: 3000, selling_price: 4500, unit: 'pcs', stock: 15, category_id: 'cat1', prod_image: 'https://placehold.co/64x64/EFEFEF/grey?text=Keyboard' },
    ];

    const mockCategories: Category[] = [
        { category_id: 'cat1', category: 'Electronics' },
        { category_id: 'cat2', category: 'Home Goods' },
        { category_id: 'cat3', category: 'Apparel' },
        { category_id: 'cat4', category: 'Books' },
    ];

    const mockUnits: Unit[] = [
        { unit_id: 'unit1', unit: 'pcs' },
        { unit_id: 'unit2', unit: 'box' },
        { unit_id: 'unit3', unit: 'kg' },
    ];

    return {
        ownerName: 'John Doe',
        currentDate: today.toISOString(),
        dailySales: Math.round(Math.random() * (5000 - 1000) + 1000),
        weeklySales: Math.round(Math.random() * (20000 - 5000) + 5000),
        monthSales: Math.round(Math.random() * (80000 - 20000) + 20000),
        sales,
        expenses,
        losses,
        netprofits,
        categories,
        productSales,
        months,
        products: mockProducts,
        mockCategories,
        mockUnits,
    };
};
