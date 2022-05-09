import Router from 'next/router';
import NProgress from 'nprogress';
import "./nprogress.module.css";

NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 500,
    showSpinner: false,
    color: 'red'
    
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());
const func = () => null;
export default func;