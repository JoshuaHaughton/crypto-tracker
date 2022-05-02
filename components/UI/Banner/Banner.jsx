import React from 'react'
import BackgroundImage from '../../../public/BannerPic.png'
import Carousel from '../Carousel/Carousel'
import styles from './Banner.module.css'

const Banner = ({ trendingCoins }) => {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.title_wrapper}>
          <h2>Crypto City</h2>
          <p>Get info on your favourite cryptocurrency</p>
        </div>
        <Carousel trendingCoins={trendingCoins} />
      </div>
    </div>
  )
}

export default Banner