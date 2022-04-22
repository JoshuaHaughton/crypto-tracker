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

const Portfolio = ({ portfolioData, chartInfo, message }) => {
  const [currentChartInfo, setCurrenthartInfo] = useState(
    chartInfo[Object.keys(chartInfo)[0]].oneDayPrices)
  console.log(portfolioData, currentChartInfo, chartInfo)
  return (
    <div className={styles.container}>
      <Head>
        <title> Crypto Tracker</title>
        <meta name="description" content="Nextjs Crypto Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.card_container}>
        <div className={styles.card}>
          +/-
        </div>
        <div className={styles.card}>
          <div className={styles.cardText}>
            <h3>Portfolio Worth</h3>
            <p>{portfolioData.userId}</p>
            

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
        ???
        <HistoryChart chartData={currentChartInfo} />
      </div>


      <div className={styles.owned_assets}>

      </div>

      <div className={styles.past_orders}>

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
    
    console.log('test')

    const chartUrls = 
      Object.keys(portfolioData.assets).map((name) => {
        chartInfo[name] = {url: `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=cad&days=1`}
        
      } 
    )

    // Object.keys(chartUrls).map(name => {
    //   chartInfo[name] = { name, data: }
    // })



    console.log('URL', chartUrls);
    console.log('URLs', chartInfo);

    // Object.keys(urls).forEach(async key => {
    //   urls[key]["oneDayPrices"] = await (await fetch(urls[key].url)).json();
    // })

    for (let key in chartInfo) {
      console.log('KEY', key);
      const results = await (await fetch(chartInfo[key].url)).json();
      console.log('results!', results.prices);
      chartInfo[key]["oneDayPrices"] = {labels: results.prices.map(dataPoint => new Date(dataPoint[0]).toLocaleTimeString())}
      console.log('labels', chartInfo);
      // chartInfo[key]["oneDayPrices"]['labels'] = results.prices.map(dataPoint => new Date(dataPoint[0]).toLocaleTimeString())

      chartInfo[key]["oneDayPrices"]['datasets'] = [ {
        label: "Price (Past 1 day) in CAD",
        data: results.prices.map(dataPoint => dataPoint[1]),
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      }
      ]

    }


    console.log('aaaa', chartInfo)
    console.log(portfolioData)
    console.log('bbbb', chartInfo.bitcoin.oneDayPrices.prices)

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

  // const coinInfo = await Promise.all(
  //   urls.map((url) => fetch(url).then((resp) => resp.json())),
  // ).then((res) => {
  //   // console.log('yup', res)
  //   return res;
  // });



  // const oneDayMarketValues = coinInfo[1].prices.map((data) => data[1]);
  // const oneMonthMarketValues = coinInfo[2].prices.map((data) => data[1]);
  // const threeMonthMarketValues = coinInfo[3].prices.map((data) => data[1]);
  // const oneYearMarketValues = coinInfo[4].prices.map((data) => data[1]);

  // return {
  //   props: {
  //     coin: coinInfo[0],
  //     market_chart: {
  //       day: coinInfo[1].prices,
  //       month: coinInfo[2].prices,
  //       threeMonth: coinInfo[3].prices,
  //       year: coinInfo[4].prices,
  //     },
  //     market_values: {
  //       oneDayMarketValues, oneMonthMarketValues, threeMonthMarketValues, oneYearMarketValues
  //     },
  //   },
  // };
}

