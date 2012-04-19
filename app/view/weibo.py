__author__ = 'xlzhu'

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import settings as GLOBAL_SETTINGS
from lib.weibo import weibo

import webapp2
import logging
import json
import math
from django.template import loader as django_loader
from google.appengine.api import urlfetch

client = weibo.APIClient(app_key=GLOBAL_SETTINGS.WEIBO_KEY, app_secret=GLOBAL_SETTINGS.WEIBO_SECRET)

class MainPage(webapp2.RequestHandler):
  def get(self):

    #step 1: get authorized token
    client.redirect_uri = self.request.uri
    url_authorize = client.get_authorize_url()

    #step 2:
    request_code = self.request.get('code')
    access_token = None
    expires_in = None
    if request_code:
      res = client.request_access_token(code=request_code)
      access_token =  res.access_token
      expires_in = res.expires_in
      client.set_access_token(access_token=access_token, expires_in=expires_in)

    template_values= {
      'oauth2_auth_url': url_authorize,
      'oauth2_access_token': access_token,
      'oauth2_expires_in': expires_in
    }

    logging.info("/weibo:\t%s" % (url_authorize))

    self.response.out.write(django_loader.render_to_string('weibo_mainpage.html', template_values))

class ResultPage(webapp2.RequestHandler):
  def get(self):
    template_values= {}

    access_token = self.request.get('access_token')
    expires_in = self.request.get('expires_in')

    if access_token:
      client.set_access_token(access_token=access_token,expires_in=expires_in)
      res = client.get.statuses__user_timeline(screen_name="gulimujyujyu",count=200)
      timeline = []

      if res['total_number'] > 0:
        timeline[len(timeline):] = (res.statuses)
        i=1
        logging.info("/weibo:\t%d:%d" % (i,len(res.statuses)))
        for i in range(2, int(math.ceil(float(res['total_number'])/float(len(res.statuses))))+1):
          res = client.get.statuses__user_timeline(screen_name="gulimujyujyu",count=200,page=i)
          timeline[len(timeline):] = (res.statuses)
          logging.info("/weibo:\t%d:%d" % (i,len(res.statuses)))

      logging.info("/weibo:\t%s" % res['total_number'])
      logging.info("/weibo:\t%s" % res['next_cursor'])
      logging.info("/weibo:\t%s" % res['previous_cursor'])

      template_values['weibo_list'] = timeline

    self.response.out.write(django_loader.render_to_string('weibo_result.html', template_values))

app = webapp2.WSGIApplication([('/weibo/?',MainPage),
  ('/weibo/result',ResultPage)],
  debug=True)