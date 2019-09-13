'use strict'

const https = require('https')
const Router = require('express').Router
const passport = require('passport')
const GithubStrategy = require('passport-github').Strategy
const config = require('../../../config')
const response = require('../../../response')
const { setReturnToFromReferer, passportGeneralCallback } = require('../utils')

let githubAuth = module.exports = Router()

passport.use(new GithubStrategy({
  authorizationURL: config.github.authorizationURL,
  tokenURL: config.github.tokenURL,
  userProfileURL: config.github.userProfileURL,
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.serverURL + '/auth/github/callback'
}, function (accessToken, refreshToken, profile, done) {
  if (config.github.belongOrganization) {
    https.get(profile._json.organizations_url, function (res) {
      var body = ''
      res.on('data', function (chunk) {
        body += chunk
      })
      res.on('end', function () {
        const json = JSON.parse(body)
        if (res.statusCode !== 200) {
          return done(profile._json.organizations_url + ': ' + json.message, null)
        }
        const index = json.findIndex(function (org) {
          return org.login === config.github.belongOrganization
        })
        if (index === -1) {
          return done('You are not ' + config.github.belongOrganization + ' organization members (ps: Membership must public)', null)
        }
        return passportGeneralCallback(accessToken, refreshToken, profile, done)
      })
    }).end()
  } else {
    return passportGeneralCallback(accessToken, refreshToken, profile, done)
  }
}))

githubAuth.get('/auth/github', function (req, res, next) {
  setReturnToFromReferer(req)
  passport.authenticate('github')(req, res, next)
})

// github auth callback
githubAuth.get('/auth/github/callback', function (req, res, next) {
  return passport.authenticate('github', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  }, function (err, user, info) {
    if (err) {
      req.flash('error', err)
    }
    if (user) {
      req.logIn(user, function (err) {
        res.redirect(config.serverURL + '/')
      })
    } else {
      res.redirect(config.serverURL + '/')
    }
  })(req, res, next)
})

// github callback actions
githubAuth.get('/auth/github/callback/:noteId/:action', response.githubActions)
