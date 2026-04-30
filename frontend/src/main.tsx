import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { persistor, store } from './store/store.ts'
import { Spin } from 'antd';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={ store }> {/*  make sure every component can accss to Redux*/ }
          <PersistGate loading={ <Spin size="large" /> } persistor={ persistor }>
              <BrowserRouter>
                  <App/>
              </BrowserRouter>
          </PersistGate>
      </Provider>
  </StrictMode>,
)
