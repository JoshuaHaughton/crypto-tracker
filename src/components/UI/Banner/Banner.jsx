import React from 'react'
import BackgroundImage from '../../../../public/BannerPic.png'
import Carousel from '../Carousel/Carousel'
import styles from './Banner.module.css'

const Banner = ({ carouselCoins, nonReduxSymbol }) => {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.title_wrapper}>
          <h2> <span className={styles.orange}>Crypto</span> Tracker</h2>
          <p>Get the latest info on your favourite crypto!</p>
        </div>
        <Carousel carouselCoins={carouselCoins} nonReduxSymbol={nonReduxSymbol}/>
      </div>
    </div>
  )
}

export default React.memo(Banner)