import Head from 'next/head'
import React, { useState } from 'react'
import HistoryChart from '../../components/UI/HistoryChart'
import { Chart as ChartJS } from "chart.js/auto";
import nookies from 'nookies';
import styles from './Portfolio.module.css'
import { doc, DocumentSnapshot, getDoc, getFirestore } from "firebase/firestore";
import { auth, db, firebaseConfig, getMyUid } from '../../firebase';
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { admin } from '../../lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

const Portfolio = ({ portfolioData, starterChartInfo, assetInfo }) => {
  console.log(new Date().toUTCString());

  console.log(uuidv4() );
  const [chartData, setChartData] = useState({
    oneDayData: {
      labels: starterChartInfo.marketLabels.oneDayLabels, 
      values: starterChartInfo.marketValues.oneDayValues,
    },
    oneMonthData: {
      labels: starterChartInfo.marketLabels.oneMonthLabels, 
      values: starterChartInfo.marketValues.oneMonthValues
    },
    threeMonthData: {
      labels: starterChartInfo.marketLabels.threeMonthLabels, 
      values: starterChartInfo.marketValues.threeMonthValues
    },
    oneYearData: {
      labels: starterChartInfo.marketLabels.oneYearLabels, 
      values: starterChartInfo.marketValues.oneYearValues
    }

  });

  
  const [currentChartInfo, setCurrentChartInfo] = useState(
    {
      labels: starterChartInfo.marketLabels.oneDayLabels,
      datasets: [ {
      label: "Price (Past 1 day) in CAD",
      data: starterChartInfo.marketValues.oneDayValues,
      backgroundColor: ["red"],
      fill: "origin",
      pointRadius: 1.5,
      pointStyle: 'circle'
    }] }
  )


    const dayClickHandler = () => {
    
      setCurrentChartInfo(prev => {
        return {
          labels: chartData.oneDayData.labels,
          datasets: [ {
          label: "Price (Past 1 day) in CAD",
          data: chartData.oneDayData.values,
          backgroundColor: ["red"],
          fill: "origin",
          pointRadius: 0,
        }] }
      })
    }
  
    const monthClickHandler = () => {
      
      setCurrentChartInfo(prev => {
        return {
          labels: chartData.oneMonthData.labels,
           datasets: [ {
          label: "Price (Past 1 month) in CAD",
          data: chartData.oneMonthData.values,
          backgroundColor: ["red"],
          fill: "origin",
          pointRadius: 0,
        }] }
      })
    }
  
    const threeMonthClickHandler = () => {
      
      setCurrentChartInfo(prev => {
        return {
          labels: chartData.threeMonthData.labels,
          datasets: [ {
          label: "Price (Past 3 months) in CAD",
          data: chartData.threeMonthData.values,
          backgroundColor: ["red"],
          fill: "origin",
          pointRadius: 0,
        }] }
      })
    }
  
    const yearClickHandler = () => {
      
      setCurrentChartInfo(prev => {
        return {
          labels: chartData.oneYearData.labels,
          datasets: [ {
          label: "Price (Past 1 year) in CAD",
          data: chartData.oneYearData.values,
          backgroundColor: ["red"],
          fill: "origin",
          pointRadius: 0,
        }] }
      })
    }

    const findOrderPlusMinus = (el) => {
      console.log(assetInfo);
      console.log(el);
      let currentSellingPrice = el.units * assetInfo[el.id].info.market_data.current_price.cad
      let initialSellingPrice = el.units * el.unitPriceAtTransaction

      let gainOrLoss = currentSellingPrice - initialSellingPrice;

      let finalOutput = ((gainOrLoss / initialSellingPrice) * 100).toFixed(2)

      return finalOutput;
    }

    const findAssetWorth = (el) => {
      console.log(assetInfo);
      console.log(el);
      return parseInt((portfolioData.assets[el].units * assetInfo[el].info.market_data.current_price.cad).toFixed(2))
    }

    const calculatePortfolioWorth = () => {

      let portfolioWorth = 0


      Object.keys(portfolioData.assets).forEach(el => {
        portfolioWorth += findAssetWorth(el)
      })

      console.log(portfolioWorth)

      return portfolioWorth
    }




  console.log(portfolioData, currentChartInfo)
  return (
    <div className={styles.container}>
      <Head>
        <title> Crypto Tracker</title>
        <meta name="description" content="Nextjs Crypto Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.card_container}>
        <div className={styles.card}>
        <div className={styles.cardText}>
            <h3>+/-</h3>
            <p>${portfolioData.totalFunds}</p>
            

          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardText}>
            <h3>Portfolio Worth</h3>
            <p>${calculatePortfolioWorth()}</p>
            

          </div>
        </div>
        <div className={styles.card}>
        <div className={styles.cardText}>
            <h3>Funds Available</h3>
            <p>${portfolioData.totalFunds}</p>
            

          </div>
        </div>
      </div>

      <div className={styles.chart_container}>
        <HistoryChart chartData={currentChartInfo} />
        <div className={styles.chart_buttons}>
          <button onClick={dayClickHandler}>24 Hours</button>
          <button onClick={monthClickHandler}>30 Days</button>
          <button onClick={threeMonthClickHandler}>3 Months</button>
          <button onClick={yearClickHandler}>1 Year</button>
        </div>
      </div>

      <div className={styles.my_assets}>
        <div className={styles.owned_assets}>
          <div className={styles.assets_header}>
            <h3>Name</h3>
            <h3>Units Owned</h3>
            <h3>Current Worth</h3>
          </div>

          <div className={styles.assets_content}>
            {Object.keys(portfolioData.assets).map((el) => {
              console.log(el);
              console.log(portfolioData.assets[el]);
              
              return (
              <div className={styles.asset}>
                <p>{portfolioData.assets[el].name}</p>
                <p>{portfolioData.assets[el].units}</p>
                <p>${findAssetWorth(el)}</p>
              </div>

              )
            })}

          </div>
        </div>

        <div className={styles.past_orders}>
        <div className={styles.orders_header}>
            <h3>Name</h3>
            {/* <h3>Id</h3> */}
            <h3>Quantity</h3>
            <h3>Price per unit</h3>
            <h3>Buy</h3>
            <h3>+/-</h3>
            <h3>Timestamp</h3>
          </div>
          <div className={styles.orders_content}>
          {/* {uuid.v4()} */}
            {portfolioData.orders.map((el) => {
              return (<div className={styles.order}>
                  <p>{el.name}</p>
                  {/* <p>1</p> */}
                  <p>{el.units}</p>
                  <p>${el.unitPriceAtTransaction}</p>
                  <p>{el.buy ? 'True' : 'False'}</p>
                  <p>{`${findOrderPlusMinus(el) ? '+' : '-'}${findOrderPlusMinus(el)}`}%</p>
                  <p>{el.createdAt}</p>
                </div>)
            })}
          </div>



        </div>
      </div>



      
    </div>
  )
}

export default Portfolio

export async function getServerSideProps(ctx) {


  let uid = null;
  console.log(db);

  try {
    const cookies = nookies.get(ctx);
    const token = await admin.auth().verifyIdToken(cookies.token);

    // the user is authenticated!
    const { uid, email } = token;
    console.log('authenticated!!!')

    // FETCH STUFF HERE!! 🚀

    //Fetch fund data

    let portfolioData = {}

    if (uid) {
      const docRef = doc(db, "portfolios", uid);
      const docSnap = await getDoc(docRef);
    
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        portfolioData = docSnap.data()
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
  
    }

    //portfolioWorth




    //Fetch chart data


    const chartInfo = {};
    

    //Transform all assets into fetchable urls, distributed into the chartInfo object
      Object.keys(portfolioData.assets).map((name) => {
        chartInfo[name] = {url: `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=cad&days=1`}
        
      } 
    )

    console.log('URLs', chartInfo);

    //Loop through each key in chartInfo array to fetch data. Will try to optimise (Promise.All) soon 
    for (let key in chartInfo) {
      console.log('KEY', key);

      //Get chart data using url from chartInfo for that asset
      const results = await (await fetch(chartInfo[key].url)).json();

      console.log('results prices!', results.prices);

      //Set labels for chart data on oneDayPrices key
      chartInfo[key]["oneDayPrices"] = {labels: results.prices.map(dataPoint => new Date(dataPoint[0]).toLocaleTimeString())}

      console.log('labels', chartInfo);

      //Set datasets for chart data on oneDayPrices key
      chartInfo[key]["oneDayPrices"]['datasets'] = [ {
        label: "Price (Past 1 day) in CAD",
        data: results.prices.map(dataPoint => dataPoint[1]),
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      }
      ]

    }

    // console.log('bbbb', chartInfo.bitcoin.oneDayPrices.prices)

    // const chartArray = await Promise.all(chartUrls.map(async url => {
    //   const resp = await fetch(url);
    //   console.log('slow', await resp.json());
    //   const prices = await resp.json().prices
    //   console.log('prices', prices);
    //   return prices
    //   // return await jsonResp.data();
    // }));

    // const chartInfo = await Promise.all(chartArray)
    // console.log('chart',chartArray)
    // .then((res) => {
      
    //   console.log('yup', res[0].prices)
    //   return res[0].prices;
    // });





    const firstAsset = Object.keys(portfolioData.assets)[0]; //returns 'someVal'
    console.log('firstAsset', firstAsset);
    const urls = [
      `https://api.coingecko.com/api/v3/coins/${firstAsset}?vs_currency=cad`,
      `https://api.coingecko.com/api/v3/coins/${firstAsset}/market_chart?vs_currency=cad&days=1`,
      `https://api.coingecko.com/api/v3/coins/${firstAsset}/market_chart?vs_currency=cad&days=30`,
      `https://api.coingecko.com/api/v3/coins/${firstAsset}/market_chart?vs_currency=cad&days=90`,
      `https://api.coingecko.com/api/v3/coins/${firstAsset}/market_chart?vs_currency=cad&days=365`,
    ];
    console.log('made it')
  
    const firstCoin = await Promise.all(
      urls.map((url) => fetch(url).then((resp) => resp.json())),
    ).then((res) => {
      // console.log('yup', res)
      return res;
    });
  
  
    // console.log(firstCoin)
  
    const oneDayValues = firstCoin[1].prices.map((data) => data[1]);
    const oneMonthValues = firstCoin[2].prices.map((data) => data[1]);
    const threeMonthValues = firstCoin[3].prices.map((data) => data[1]);
    const oneYearValues = firstCoin[4].prices.map((data) => data[1]);
    // console.log(firstCoin[1].prices)
    console.log('test')

    console.log(
      firstCoin[0],
      firstCoin[1],
    );

    const dateLabelMap = (arr) => {
      return arr.map((data) =>
      new Date(data[0]).toLocaleDateString())
    }

    const timeLabelMap = (arr) => {
      return arr.map((data) =>
      new Date(data[0]).toLocaleTimeString())
    }








    //Get owned assets current info
    const assetInfo = {};
    

    //Transform all assets into fetchable urls, distributed into the assetInfo object
      Object.keys(portfolioData.assets).map((name) => {
        assetInfo[name] = {url: `https://api.coingecko.com/api/v3/coins/${name}?vs_currency=cad`}
        
      } 
    )


    //Loop through each key in chartInfo array to fetch data. Will try to optimise (Promise.All) soon 
    for (let key in assetInfo) {
      console.log('KEY', key);

      //Get chart data using url from assetInfo for that asset
      const results = await (await fetch(assetInfo[key].url)).json();

      // console.log('results info!', results);

      //Set labels for chart data on oneDayPrices key
      assetInfo[key]['info'] = results

      console.log('labels', assetInfo);


    }

    console.log(assetInfo.bitcoin.info.market_data.current_price.cad, 'yaaa')



  
    return {
      props: {
        starterCoin: firstCoin[0],
        starterChartInfo: {
          marketLabels: {
            oneDayLabels: timeLabelMap(firstCoin[1].prices),
            oneMonthLabels: dateLabelMap(firstCoin[2].prices),
            threeMonthLabels: dateLabelMap(firstCoin[3].prices),
            oneYearLabels: dateLabelMap(firstCoin[4].prices),
          },
          marketValues: {
            oneDayValues, oneMonthValues, threeMonthValues, oneYearValues
          }
        },
        assetInfo,
        portfolioData,
        uid
      }
    };











    return {
      props: { message: `Your email is ${email} and your UID is ${uid}.`, portfolioData, chartInfo },
    };



  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page

    // ctx.res.writeHead(302, { Location: '/login' });
    ctx.res.end();
    console.log('not authenticated!!!')

    // `as never` prevents inference issues
    // with InferGetServerSidePropsType.
    // The props returned here don't matter because we've
    // already redirected the user.
    return { props: {} };
  }





  // auth.onAuthStateChanged(async (userAuth) => {
  //   console.log(userAuth);
  //   if (userAuth) {
  //     //User is logged in
  //     console.log('here');
  //     uid = userAuth.uid;
  //   } 
  // });

  console.log(auth);
  // const uid2 = await getMyUid();
  console.log(uid2)


 

  // return {
  //   props: {
  //     w: 'hi'
  //   }
  // }



  // const urls = [
  //   `https://api.coingecko.com/api/v3/coins/${id}?vs_currency=cad`,
  //   `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=1`,
  //   `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=30`,
  //   `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=90`,
  //   `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=365`,
  // ];

  // const firstCoin = await Promise.all(
  //   urls.map((url) => fetch(url).then((resp) => resp.json())),
  // ).then((res) => {
  //   // console.log('yup', res)
  //   return res;
  // });



  // const oneDayMarketValues = firstCoin[1].prices.map((data) => data[1]);
  // const oneMonthMarketValues = firstCoin[2].prices.map((data) => data[1]);
  // const threeMonthMarketValues = firstCoin[3].prices.map((data) => data[1]);
  // const oneYearMarketValues = firstCoin[4].prices.map((data) => data[1]);

  // return {
  //   props: {
  //     coin: firstCoin[0],
  //     market_chart: {
  //       day: firstCoin[1].prices,
  //       month: firstCoin[2].prices,
  //       threeMonth: firstCoin[3].prices,
  //       year: firstCoin[4].prices,
  //     },
  //     market_values: {
  //       oneDayMarketValues, oneMonthMarketValues, threeMonthMarketValues, oneYearMarketValues
  //     },
  //   },
  // };
}

