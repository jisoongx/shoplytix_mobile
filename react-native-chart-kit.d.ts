declare module "react-native-chart-kit" {
  import * as React from "react";
  import { ViewStyle } from "react-native";

  export interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity: number) => string;
    labelColor?: (opacity: number) => string;
    style?: ViewStyle;
    propsForDots?: object;
  }

  export interface ChartBaseProps {
    width: number;
    height: number;
    chartConfig: ChartConfig;
    style?: ViewStyle;
  }

  export interface BarChartProps extends ChartBaseProps {
    data: any;
    yAxisLabel?: string;
    fromZero?: boolean;
    segments?: number;
  }

  export class BarChart extends React.Component<BarChartProps> {}
  export class LineChart extends React.Component<ChartBaseProps & { data: any }> {}
}
