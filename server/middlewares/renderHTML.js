import express from 'express'
import React from 'react'
import { Provider } from 'react-redux'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter as Router, matchPath } from 'react-router'
import App from './../../app/components/App/App'
import { purgeCache } from './../utils/index'

const router = express.Router()
// const assetUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : '/'

const renderHTML = (componentHTML, initialState) => `
  <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello React</title>
    </head>
    <body>
      <div id="root">${componentHTML}</div>
      <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState).replace(/</g, '\\u003c')}
        </script>
      <script type="application/javascript" src="/build.js"></script>
    </body>
  </html>
  `

router.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    [
      './../../app/redux/confStore',
      './../../app/saga/rootsaga',
    ].forEach(purgeCache)
  }
    /* eslint-disable global-require */
  const configureStore = require('./../../app/redux/confStore.js').default
  const rootSaga = require('./../../app/saga/rootsaga.js').default

  // const routes = require('../../app/routes').default
  // const Html = require('../../app/components/Html').default
  /* eslint-enable global-require */
  // const mainChunk = res.locals.webpackStats.toJson().assetsByChunkName.main

  const store = configureStore()
  store.runSaga(rootSaga)
  const state = store.getState()
  const context = {}

  const componentHTML = renderToStaticMarkup(
    <Router
      location={req.url}
      context={context}
    >
      <App store={store} />
    </Router>,
  )

  return res.end(renderHTML(componentHTML, state))
})

export default router
