import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";

// Helper function for number formatting
const formatPeso = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatK = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
    return amount >= 1000 ? `₱${(amount / 1000).toFixed(1)}k` : formatPeso(amount);
};

const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) {
        return current > 0 ? 'N/A' : '–';
    }
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    if (percent === 0) return '–';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
};

const screenWidth = Dimensions.get("window").width;

// Define the shape of your data
interface DashboardData {
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

// Generate mock data that simulates a backend API response
const generateMockBackendData = () => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const generateMonthlyData = (base: number, growth: number) => {
        let data: number[] = [];
        let value = base;
        for (let i = 0; i < 12; i++) {
            value += (Math.random() - 0.45) * growth; // slightly positive bias
            data.push(Math.max(0, Math.round(value)));
        }
        return data;
    };

    const sales = generateMonthlyData(25000, 5000);
    const expenses = generateMonthlyData(15000, 4000);
    const losses = generateMonthlyData(1000, 1000);
    const netprofits = sales.map((s, i) => s - expenses[i] - losses[i]);

    // UPDATED: Changed the categories as you requested
    const categories = ['Beverages', 'Canned Goods', 'Frozen', 'Fresh Meat'];
    const productSales = categories.map((cat) => ({
        name: cat,
        sales: Math.round(Math.random() * (20000 - 5000) + 5000),
    }));

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
    };
};

const DashboardScreen = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => {
            try {
                const backendData = generateMockBackendData();
                const formattedData: DashboardData = {
                    ownerName: backendData.ownerName,
                    currentDate: new Date(backendData.currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    dailySales: { dailySales: backendData.dailySales },
                    weeklySales: { weeklySales: backendData.weeklySales },
                    monthSales: { monthSales: backendData.monthSales },
                    sales: backendData.sales,
                    expenses: backendData.expenses,
                    losses: backendData.losses,
                    netprofits: backendData.netprofits,
                    months: backendData.months,
                    productSalesData: {
                        labels: backendData.categories,
                        datasets: [{ data: backendData.productSales.map(p => p.sales), color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})` }],
                    },
                    profitChartData: {
                        labels: backendData.months,
                        datasets: [{ data: backendData.netprofits, color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`, strokeWidth: 2 }],
                    },
                };
                setData(formattedData);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }, 1000);
    }, []);

    const chartConfig = {
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: "4", strokeWidth: "2", stroke: "#b91c1c" },
        formatYLabel: (yValue: string) => {
            const value = parseFloat(yValue);
            if (isNaN(value)) return "0";
            return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`;
        },
    };

    const AnalysisRow = ({ title, data, isPositiveGood }: { title: string, data: number[], isPositiveGood: boolean }) => (
        <View style={styles.tableDataRow}>
            {/* FIXED: Changed Text to a View containing Text for proper alignment */}
            <View style={styles.stickyCell}>
                <Text style={styles.stickyCellText}>{title}</Text>
            </View>
            <View style={{ flexDirection: 'row', paddingLeft: 120 }}>
                {data.map((value, index) => (
                    <React.Fragment key={`${title}-${index}`}>
                        <Text style={styles.tableCell}>{formatPeso(value)}</Text>
                        {index < data.length - 1 && (
                            <Text style={[styles.tableCell, {
                                width: 80, // Explicit width for percentage column
                                color: (isPositiveGood ? (data[index + 1] - value >= 0) : (data[index + 1] - value <= 0)) ? '#10b981' : '#dc2626'
                            }]}>
                                {calculatePercentageChange(data[index + 1], value)}
                            </Text>
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#b91c1c" /><Text style={styles.loadingText}>Loading dashboard...</Text></View>;
    }

    if (error || !data) {
        return <View style={styles.centered}><Text style={styles.errorText}>Error: {error || "Data not available."}</Text></View>;
    }

    const barChartWidth = Math.max(screenWidth - 32, data.productSalesData.labels.length * 90);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Welcome and Sales Cards */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.dateText}>{data.currentDate}</Text>
                    <Text style={styles.welcomeText}>Welcome, {data.ownerName}!</Text>
                    <View style={styles.salesCardsRow}>
                        <View style={[styles.salesCard, { borderTopColor: '#b91c1c' }]}><Text style={[styles.salesAmount, { color: '#b91c1c' }]}>{formatPeso(data.dailySales.dailySales)}</Text><Text style={styles.salesLabel}>Daily Sales</Text></View>
                        <View style={[styles.salesCard, { borderTopColor: '#dc2626' }]}><Text style={[styles.salesAmount, { color: '#dc2626' }]}>{formatK(data.weeklySales.weeklySales)}</Text><Text style={styles.salesLabel}>Last 7 days</Text></View>
                        <View style={[styles.salesCard, { borderTopColor: '#ef4444' }]}><Text style={[styles.salesAmount, { color: '#ef4444' }]}>{formatK(data.monthSales.monthSales)}</Text><Text style={styles.salesLabel}>This Month</Text></View>
                    </View>
                </View>

                {/* Monthly Profit Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Monthly Net Profit</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart data={data.profitChartData} width={screenWidth * 1.5} height={220} chartConfig={chartConfig} style={styles.chartStyle} bezier segments={4} />
                    </ScrollView>
                </View>

                {/* Sales by Category Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Sales by Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart data={data.productSalesData} width={barChartWidth} height={240} yAxisLabel="₱" chartConfig={chartConfig} style={styles.chartStyle} fromZero={true} segments={4} />
                    </ScrollView>
                </View>

                {/* Comparative Analysis Table */}
                <View style={styles.tableCard}>
                    <Text style={styles.tableTitle}>Comparative Analysis</Text>
                    <ScrollView horizontal>
                        <View>
                            {/* Table Header */}
                            <View style={styles.tableHeaderRow}>
                                {/* FIXED: Changed Text to a View containing Text for proper alignment */}
                                <View style={styles.stickyHeader}>
                                    <Text style={styles.stickyHeaderText}>Metric</Text>
                                </View>
                                <View style={{ flexDirection: 'row', paddingLeft: 120 }}>
                                    {data.months.map((month, index) => (
                                        <React.Fragment key={month}>
                                            <Text style={styles.tableHeaderCell}>{month}</Text>
                                            {index < data.months.length - 1 && <Text style={[styles.tableHeaderCell, { width: 80 }]}>% Chg</Text>}
                                        </React.Fragment>
                                    ))}
                                </View>
                            </View>

                            {/* Table Body */}
                            <View style={styles.tableSectionTitleRow}><Text style={styles.tableSectionTitle}>Money Spent (↓ is Better)</Text></View>
                            <AnalysisRow title="In-Store Expenses" data={data.expenses} isPositiveGood={false} />
                            <AnalysisRow title="Revenue Loss" data={data.losses} isPositiveGood={false} />

                            <View style={styles.tableSectionTitleRow}><Text style={styles.tableSectionTitle}>Money Earned (↑ is Better)</Text></View>
                            <AnalysisRow title="Total Sales" data={data.sales} isPositiveGood={true} />
                            <AnalysisRow title="Net Profit" data={data.netprofits} isPositiveGood={true} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    contentContainer: { padding: 16 },
    sectionContainer: { marginBottom: 16 },
    dateText: { fontSize: 14, color: '#6b7280' },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    salesCardsRow: { flexDirection: 'row', gap: 12 },
    salesCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopWidth: 4,
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center',
    },
    salesAmount: { fontSize: 18, fontWeight: 'bold' },
    salesLabel: { fontSize: 10, color: '#4b5563', marginTop: 4, textAlign: 'center' },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingLeft: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 16,
    },
    chartStyle: {
        borderRadius: 16,
    },
    chartTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8, paddingRight: 16 },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden', // Ensures inner content respects border radius
    },
    tableTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8, padding: 16 },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#b91c1c',
        height: 50,
    },
    tableHeaderCell: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
        width: 100,
        textAlign: 'center',
        alignSelf: 'center',
    },
    stickyHeader: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 120,
        height: 50,
        backgroundColor: '#b91c1c',
        justifyContent: 'center', // FIX: Added this to vertically center the text
        paddingLeft: 16,
        zIndex: 10,
    },
    stickyHeaderText: { // FIX: New style for the text inside the sticky header view
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
        textAlign: 'left',
    },
    tableSectionTitleRow: {
        backgroundColor: '#fee2e2',
        height: 35,
        justifyContent: 'center',
    },
    tableSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#991b1c',
        paddingLeft: 16,
    },
    tableDataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        height: 45,
        backgroundColor: '#fff',
    },
    tableCell: {
        fontSize: 12,
        width: 100,
        textAlign: 'center',
        alignSelf: 'center',
        color: '#374151',
    },
    stickyCell: { // FIX: This style is now for the View wrapper
        position: 'absolute',
        left: 0,
        top: 0,
        width: 120,
        height: 45,
        backgroundColor: '#fff',
        zIndex: 5,
        justifyContent: 'center', // FIX: Added this to vertically center the text
        paddingLeft: 16,
    },
    stickyCellText: { // FIX: New style for the text itself
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'left',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    loadingText: { marginTop: 8, fontSize: 16, color: '#6b7280' },
    errorText: { fontSize: 16, color: 'red', textAlign: 'center' },
});

export default DashboardScreen;