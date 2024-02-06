import { ICoinDetailsChartProps } from "../../CoinDetailsChart/CoinDetailsChart";
import styles from "./CoinDetailsChartSkeleton.module.scss";

const CoinDetailsChartSkeleton: React.FC<ICoinDetailsChartProps> = () => {
  return (
    <div className={styles.chartInfoSkeleton}>
      <div className={styles.skeletonHeader}></div>
      <div className={styles.skeletonBody}></div>
    </div>
  );
};

export default CoinDetailsChartSkeleton;
