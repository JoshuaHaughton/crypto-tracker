import { Provider } from "react-redux";
import { Layout } from "../components/Layout/Layout";
import store from "../store";
import "../styles/globals.css";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { AuthProvider } from "../context/AuthProvider";
config.autoAddCss = false

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store} >
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
